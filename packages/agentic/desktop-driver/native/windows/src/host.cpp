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

void WriteFailureDiagnostic(std::string_view operation, const char* message) noexcept {
  try {
    WriteDiagnostic(std::string(operation) + ": " + message);
  } catch (...) {
    // A diagnostic failure must never escape a noexcept pipe-failure path.
  }
}

std::string BoundedField(std::string_view value, std::size_t maximumBytes) {
  return value.size() <= maximumBytes ? std::string(value) : std::string(value.substr(0, maximumBytes)) + "...";
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

void Host::RecordWriteFailure(std::string_view operation, const char* message) noexcept {
  writeFailed_.store(true, std::memory_order_release);
  if (readerThread_ != nullptr) {
    CancelSynchronousIo(readerThread_);
  }
  WriteFailureDiagnostic(operation, message);
}

bool Host::WriteResponse(const std::string& id, const std::string& command, const CommandResult& result) noexcept {
  try {
    if (result.hasBinary &&
        (result.binaryId.size() > kMaximumBinaryFramePayload - 4 ||
         result.binaryData.size() > kMaximumBinaryFramePayload - 4 - result.binaryId.size())) {
      return WriteError(id, command, kErrorCaptureFailed,
                        "The captured image exceeds the 64 MiB native binary frame limit.");
    }
    json::Value response = json::Value::Object();
    response.Set("type", json::Value::String(std::string("response")));
    response.Set("id", json::Value::String(id));
    response.Set("result", result.result);
    if (result.hasBinary) {
      response.Set("binary", result.binaryMetadata);
    }
    const std::string serialized = response.Serialize();
    if (serialized.size() > kMaximumJsonFramePayload) {
      const bool treeCommand = command == "find" || command == "source" || command == "tree";
      return WriteError(id, command, treeCommand ? kErrorTreeTooLarge : kErrorInternal,
                        "The native command response exceeds the 8 MiB JSON frame limit.");
    }
    writer_->WriteJson(serialized);
    if (result.hasBinary) {
      writer_->WriteBinary(result.binaryId, result.binaryData);
    }
    return true;
  } catch (const std::exception& error) {
    RecordWriteFailure("Native response write failed", error.what());
    return false;
  } catch (...) {
    RecordWriteFailure("Native response write failed", "unknown error");
    return false;
  }
}

bool Host::WriteError(const std::string& id, const std::string& command, const std::string& code,
                      const std::string& message) noexcept {
  try {
    json::Value error = json::Value::Object();
    error.Set("code", json::Value::String(code));
    error.Set("message", json::Value::String(BoundedField(message, 4096)));
    json::Value data = json::Value::Object();
    data.Set("command", json::Value::String(BoundedField(command, 256)));
    error.Set("data", data);

    json::Value response = json::Value::Object();
    response.Set("type", json::Value::String(std::string("response")));
    response.Set("id", json::Value::String(id));
    response.Set("error", error);
    writer_->WriteJson(response);
    return true;
  } catch (const std::exception& error) {
    RecordWriteFailure("Native error write failed", error.what());
    return false;
  } catch (...) {
    RecordWriteFailure("Native error write failed", "unknown error");
    return false;
  }
}

bool Host::WriteCancelled(const std::string& id) noexcept {
  try {
    json::Value cancelled = json::Value::Object();
    cancelled.Set("type", json::Value::String(std::string("cancelled")));
    cancelled.Set("id", json::Value::String(id));
    writer_->WriteJson(cancelled);
    return true;
  } catch (const std::exception& error) {
    RecordWriteFailure("Native cancellation write failed", error.what());
    return false;
  } catch (...) {
    RecordWriteFailure("Native cancellation write failed", "unknown error");
    return false;
  }
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
    bool wroteResult = true;
    try {
      const CommandResult result = driver_.Execute(request.command, request.params, token_);
      wroteResult = WriteResponse(request.id, request.command, result);
    } catch (const CancelledError&) {
      cancelled = true;
    } catch (const HelperError& error) {
      wroteResult = WriteError(request.id, request.command, error.code(), error.what());
    } catch (const winrt::hresult_error& error) {
      wroteResult = WriteError(request.id, request.command, kErrorInternal, ToUtf8(error.message().c_str()));
    } catch (const std::exception& error) {
      wroteResult = WriteError(request.id, request.command, kErrorInternal, error.what());
    }

    if (cancelled) {
      driver_.ReleaseInput();
      wroteResult = WriteCancelled(request.id);
    }

    {
      const std::lock_guard<std::mutex> guard(mutex_);
      activeId_.clear();
    }
    if (!wroteResult || writeFailed_.load(std::memory_order_acquire)) {
      break;
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
  DuplicateHandle(GetCurrentProcess(), GetCurrentThread(), GetCurrentProcess(), &readerThread_, 0, FALSE,
                  DUPLICATE_SAME_ACCESS);
  std::thread worker(&Host::WorkerLoop, this);

  int exitCode = 0;
  try {
    Frame frame;
    while (!writeFailed_.load(std::memory_order_acquire) && reader.Read(frame)) {
      if (frame.type != kJsonFrameType) {
        WriteDiagnostic("The native helper ignored an unexpected binary frame on stdin.");
        continue;
      }
      json::Value message;
      try {
        message = json::Value::Parse(
            std::string_view(reinterpret_cast<const char*>(frame.payload.data()), frame.payload.size()));
      } catch (const HelperError& error) {
        WriteDiagnostic(std::string("The native helper ignored malformed JSON: ") + error.what());
        continue;
      }
      const std::string type = message.StringField("type");
      const std::string id = message.StringField("id");
      if ((type == "cancel" || type == "request") &&
          (id.empty() || id.size() > kMaximumCorrelationIdBytes)) {
        WriteDiagnostic("The native helper ignored a request with an invalid correlation identifier.");
        continue;
      }
      if (type == "cancel") {
        HandleCancel(id);
        if (writeFailed_.load(std::memory_order_acquire)) {
          break;
        }
        continue;
      }
      if (type != "request") {
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
  if (readerThread_ != nullptr) {
    CloseHandle(readerThread_);
    readerThread_ = nullptr;
  }
  writer_ = nullptr;
  return exitCode;
}

}  // namespace furn
