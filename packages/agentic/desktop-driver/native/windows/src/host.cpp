#include "host.h"

#include <fcntl.h>
#include <io.h>

#include <algorithm>
#include <iostream>
#include <thread>

#include <winrt/base.h>

#include "build_info.h"

namespace furn {
namespace {

void WriteDiagnostic(const std::string& message) {
  const std::string bounded = message.size() > 1000 ? message.substr(0, 1000) + "..." : message;
  std::cerr << bounded << '\n';
}

}  // namespace

json::Value CreateHello() {
  json::Value hello = json::Value::Object();
  hello.Set("type", json::Value::String(std::string("hello")));
  hello.Set("provider", json::Value::String(std::string("windows")));
  hello.Set("architecture", json::Value::String(std::string("x64")));
  hello.Set("buildId", json::Value::String(std::wstring_view(FurnDesktopDriverBuildId)));
  hello.Set("sourceDigest", json::Value::String(std::wstring_view(FurnDesktopDriverSourceDigest)));
  hello.Set("minimumOs", json::Value::String(std::string("10.0.22000.0")));

  json::Value protocol = json::Value::Object();
  protocol.Set("major", json::Value::Integer(1));
  protocol.Set("minor", json::Value::Integer(0));
  hello.Set("protocol", protocol);

  json::Value features = json::Value::Array();
  for (const char* feature : {"accessibilityClick", "activeElement", "capture", "elementCapture", "find", "hitTest",
                              "keyboard", "launch", "attach", "pointer", "probe", "releaseActions", "setWindowRect",
                              "source", "tree", "wheel"}) {
    features.Append(json::Value::String(std::string(feature)));
  }
  hello.Set("features", features);
  return hello;
}

void Host::WriteResponse(const std::string& id, const CommandResult& result) {
  json::Value response = json::Value::Object();
  response.Set("type", json::Value::String(std::string("response")));
  response.Set("id", json::Value::String(id));
  response.Set("result", result.result);
  if (result.hasBinary) {
    response.Set("binary", result.binaryMetadata);
  }
  writer_->WriteJson(response);
  if (result.hasBinary) {
    writer_->WriteBinary(result.binaryId, result.binaryData);
  }
}

void Host::WriteError(const std::string& id, const std::string& command, const std::string& code,
                      const std::string& message) {
  json::Value error = json::Value::Object();
  error.Set("code", json::Value::String(code));
  error.Set("message", json::Value::String(message));
  json::Value data = json::Value::Object();
  data.Set("command", json::Value::String(command));
  error.Set("data", data);

  json::Value response = json::Value::Object();
  response.Set("type", json::Value::String(std::string("response")));
  response.Set("id", json::Value::String(id));
  response.Set("error", error);
  writer_->WriteJson(response);
}

void Host::WriteCancelled(const std::string& id) {
  json::Value cancelled = json::Value::Object();
  cancelled.Set("type", json::Value::String(std::string("cancelled")));
  cancelled.Set("id", json::Value::String(id));
  writer_->WriteJson(cancelled);
}

void Host::HandleCancel(const std::string& id) {
  {
    const std::lock_guard<std::mutex> guard(mutex_);
    if (activeId_ == id) {
      // The worker owns the acknowledgement: it must stop side effects and
      // release depressed input before the cancellation is reported.
      token_.Cancel();
      return;
    }
    const auto queued = std::find_if(queue_.begin(), queue_.end(),
                                     [&id](const PendingRequest& request) { return request.id == id; });
    if (queued != queue_.end()) {
      queue_.erase(queued);
    }
  }
  // A queued or already-settled request has no running side effects, so the
  // acknowledgement can be written immediately.
  WriteCancelled(id);
}

void Host::WorkerLoop() {
  winrt::init_apartment(winrt::apartment_type::multi_threaded);
  while (true) {
    PendingRequest request;
    {
      std::unique_lock<std::mutex> guard(mutex_);
      signal_.wait(guard, [this] { return stopping_ || !queue_.empty(); });
      if (stopping_ && queue_.empty()) {
        break;
      }
      request = std::move(queue_.front());
      queue_.pop_front();
      token_.Reset();
      activeId_ = request.id;
    }

    bool cancelled = false;
    try {
      const CommandResult result = driver_.Execute(request.command, request.params, token_);
      WriteResponse(request.id, result);
    } catch (const CancelledError&) {
      cancelled = true;
    } catch (const HelperError& error) {
      WriteError(request.id, request.command, error.code(), error.what());
    } catch (const winrt::hresult_error& error) {
      WriteError(request.id, request.command, kErrorInternal, ToUtf8(error.message().c_str()));
    } catch (const std::exception& error) {
      WriteError(request.id, request.command, kErrorInternal, error.what());
    }

    if (cancelled) {
      driver_.ReleaseInput();
      WriteCancelled(request.id);
    }

    {
      const std::lock_guard<std::mutex> guard(mutex_);
      activeId_.clear();
    }
    if (request.command == "dispose") {
      // The session is over: flush the acknowledged response and end the
      // process instead of leaving the reader blocked on a dead stream.
      FlushFileBuffers(GetStdHandle(STD_OUTPUT_HANDLE));
      ExitProcess(0);
    }
  }
  winrt::uninit_apartment();
}

int Host::Run() {
  _setmode(_fileno(stdin), _O_BINARY);
  _setmode(_fileno(stdout), _O_BINARY);
  FrameWriter writer(GetStdHandle(STD_OUTPUT_HANDLE));
  writer_ = &writer;
  FrameReader reader(GetStdHandle(STD_INPUT_HANDLE));

  writer.WriteJson(CreateHello());
  std::thread worker(&Host::WorkerLoop, this);

  int exitCode = 0;
  try {
    Frame frame;
    while (reader.Read(frame)) {
      if (frame.type != kJsonFrameType) {
        WriteDiagnostic("The native helper ignored an unexpected binary frame on stdin.");
        continue;
      }
      const json::Value message =
          json::Value::Parse(std::string_view(reinterpret_cast<const char*>(frame.payload.data()),
                                              frame.payload.size()));
      const std::string type = message.StringField("type");
      const std::string id = message.StringField("id");
      if (type == "cancel") {
        HandleCancel(id);
        continue;
      }
      if (type != "request" || id.empty()) {
        WriteDiagnostic("The native helper received a message that is not a correlated request.");
        continue;
      }
      PendingRequest request;
      request.id = id;
      request.command = message.StringField("command");
      if (const json::Value* params = message.Find("params"); params != nullptr) {
        request.params = *params;
      } else {
        request.params = json::Value::Object();
      }
      {
        const std::lock_guard<std::mutex> guard(mutex_);
        queue_.push_back(std::move(request));
      }
      signal_.notify_one();
    }
  } catch (const HelperError& error) {
    WriteDiagnostic(std::string("furn-desktop-driver-host: ") + error.what());
    exitCode = 1;
  } catch (const std::exception& error) {
    WriteDiagnostic(std::string("furn-desktop-driver-host: ") + error.what());
    exitCode = 1;
  }

  {
    const std::lock_guard<std::mutex> guard(mutex_);
    stopping_ = true;
    token_.Cancel();
  }
  signal_.notify_all();
  worker.join();
  writer_ = nullptr;
  return exitCode;
}

}  // namespace furn
