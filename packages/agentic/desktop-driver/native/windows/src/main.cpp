#include <fcntl.h>
#include <io.h>
#include <windows.h>

#include <array>
#include <cstdint>
#include <iostream>
#include <stdexcept>
#include <string>
#include <string_view>
#include <vector>

#include <winrt/Windows.Data.Json.h>
#include <winrt/Windows.Foundation.Collections.h>
#include <winrt/base.h>

#include "build_info.h"

using winrt::Windows::Data::Json::JsonArray;
using winrt::Windows::Data::Json::JsonObject;
using winrt::Windows::Data::Json::JsonValue;

namespace {

constexpr std::array<std::uint8_t, 4> frameMagic{'F', 'D', 'R', '1'};
constexpr std::uint8_t jsonFrameType = 1;
constexpr std::size_t frameHeaderBytes = 12;

std::string toUtf8(std::wstring_view value) {
  if (value.empty()) {
    return {};
  }
  const auto length =
      WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()),
                          nullptr, 0, nullptr, nullptr);
  if (length <= 0) {
    throw std::runtime_error("Could not convert UTF-16 text to UTF-8.");
  }
  std::string output(static_cast<std::size_t>(length), '\0');
  WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()),
                      output.data(), length, nullptr, nullptr);
  return output;
}

std::wstring toWide(std::string_view value) {
  if (value.empty()) {
    return {};
  }
  const auto length = MultiByteToWideChar(
      CP_UTF8, MB_ERR_INVALID_CHARS, value.data(), static_cast<int>(value.size()),
      nullptr, 0);
  if (length <= 0) {
    throw std::runtime_error("Could not convert UTF-8 text to UTF-16.");
  }
  std::wstring output(static_cast<std::size_t>(length), L'\0');
  MultiByteToWideChar(CP_UTF8, MB_ERR_INVALID_CHARS, value.data(),
                      static_cast<int>(value.size()), output.data(), length);
  return output;
}

bool readExact(HANDLE input, void *buffer, std::size_t length) {
  auto *cursor = static_cast<std::uint8_t *>(buffer);
  std::size_t remaining = length;
  while (remaining > 0) {
    DWORD read = 0;
    if (!ReadFile(input, cursor, static_cast<DWORD>(remaining), &read, nullptr)) {
      throw std::runtime_error("Could not read from native driver stdin.");
    }
    if (read == 0) {
      return false;
    }
    cursor += read;
    remaining -= read;
  }
  return true;
}

void writeExact(HANDLE output, const void *buffer, std::size_t length) {
  const auto *cursor = static_cast<const std::uint8_t *>(buffer);
  std::size_t remaining = length;
  while (remaining > 0) {
    DWORD written = 0;
    if (!WriteFile(output, cursor, static_cast<DWORD>(remaining), &written,
                   nullptr)) {
      throw std::runtime_error("Could not write to native driver stdout.");
    }
    cursor += written;
    remaining -= written;
  }
}

JsonObject createHello() {
  JsonObject hello;
  hello.Insert(L"type", JsonValue::CreateStringValue(L"hello"));
  hello.Insert(L"provider", JsonValue::CreateStringValue(L"windows"));
  hello.Insert(L"architecture", JsonValue::CreateStringValue(L"x64"));
  hello.Insert(L"buildId",
               JsonValue::CreateStringValue(FurnDesktopDriverBuildId));
  hello.Insert(L"sourceDigest",
               JsonValue::CreateStringValue(FurnDesktopDriverSourceDigest));
  hello.Insert(L"minimumOs", JsonValue::CreateStringValue(L"10.0.22000.0"));

  JsonObject protocol;
  protocol.Insert(L"major", JsonValue::CreateNumberValue(1));
  protocol.Insert(L"minor", JsonValue::CreateNumberValue(0));
  hello.Insert(L"protocol", protocol);

  JsonArray features;
  features.Append(JsonValue::CreateStringValue(L"probe"));
  features.Append(JsonValue::CreateStringValue(L"releaseActions"));
  hello.Insert(L"features", features);
  return hello;
}

void writeJsonFrame(HANDLE output, const JsonObject &message) {
  const auto payload = toUtf8(message.Stringify().c_str());
  std::array<std::uint8_t, frameHeaderBytes> header{};
  std::copy(frameMagic.begin(), frameMagic.end(), header.begin());
  header[4] = jsonFrameType;
  const auto length = static_cast<std::uint32_t>(payload.size());
  header[8] = static_cast<std::uint8_t>(length & 0xff);
  header[9] = static_cast<std::uint8_t>((length >> 8) & 0xff);
  header[10] = static_cast<std::uint8_t>((length >> 16) & 0xff);
  header[11] = static_cast<std::uint8_t>((length >> 24) & 0xff);
  writeExact(output, header.data(), header.size());
  writeExact(output, payload.data(), payload.size());
}

bool readJsonFrame(HANDLE input, JsonObject &message) {
  std::array<std::uint8_t, frameHeaderBytes> header{};
  if (!readExact(input, header.data(), header.size())) {
    return false;
  }
  if (!std::equal(frameMagic.begin(), frameMagic.end(), header.begin()) ||
      header[4] != jsonFrameType) {
    throw std::runtime_error("Native driver stdin contained an invalid frame.");
  }
  const auto length = static_cast<std::uint32_t>(header[8]) |
                      (static_cast<std::uint32_t>(header[9]) << 8) |
                      (static_cast<std::uint32_t>(header[10]) << 16) |
                      (static_cast<std::uint32_t>(header[11]) << 24);
  std::string payload(length, '\0');
  if (length > 0 && !readExact(input, payload.data(), payload.size())) {
    throw std::runtime_error("Native driver stdin ended during a frame.");
  }
  message = JsonObject::Parse(toWide(payload));
  return true;
}

JsonObject createProbeResult(const JsonObject &request) {
  std::wstring endpoint = L"windows";
  if (request.HasKey(L"params")) {
    const auto params = request.GetNamedObject(L"params");
    endpoint = params.GetNamedString(L"endpoint", L"windows").c_str();
  }
  JsonObject features;
  features.Insert(L"accessibilityClick", JsonValue::CreateBooleanValue(false));
  features.Insert(L"elementScreenshot", JsonValue::CreateBooleanValue(false));
  features.Insert(L"focus", JsonValue::CreateBooleanValue(false));
  features.Insert(L"keyboard", JsonValue::CreateBooleanValue(false));
  features.Insert(L"physicalClick", JsonValue::CreateBooleanValue(false));
  features.Insert(L"screenshot", JsonValue::CreateBooleanValue(false));
  features.Insert(L"setWindowRect", JsonValue::CreateBooleanValue(false));
  features.Insert(L"wheel", JsonValue::CreateBooleanValue(false));

  JsonObject result;
  result.Insert(L"endpoint", JsonValue::CreateStringValue(endpoint));
  result.Insert(L"features", features);
  result.Insert(L"platformName", JsonValue::CreateStringValue(L"windows"));
  result.Insert(L"protocolVersion", JsonValue::CreateNumberValue(1));
  return result;
}

JsonObject createResponse(std::wstring_view id, const JsonObject &result) {
  JsonObject response;
  response.Insert(L"type", JsonValue::CreateStringValue(L"response"));
  response.Insert(L"id", JsonValue::CreateStringValue(id));
  response.Insert(L"result", result);
  return response;
}

JsonObject createNullResponse(std::wstring_view id) {
  JsonObject response;
  response.Insert(L"type", JsonValue::CreateStringValue(L"response"));
  response.Insert(L"id", JsonValue::CreateStringValue(id));
  response.Insert(L"result", JsonValue::CreateNullValue());
  return response;
}

JsonObject createErrorResponse(std::wstring_view id, std::wstring_view code,
                               std::wstring_view message) {
  JsonObject error;
  error.Insert(L"code", JsonValue::CreateStringValue(code));
  error.Insert(L"message", JsonValue::CreateStringValue(message));

  JsonObject response;
  response.Insert(L"type", JsonValue::CreateStringValue(L"response"));
  response.Insert(L"id", JsonValue::CreateStringValue(id));
  response.Insert(L"error", error);
  return response;
}

int runStdio() {
  _setmode(_fileno(stdin), _O_BINARY);
  _setmode(_fileno(stdout), _O_BINARY);
  const auto input = GetStdHandle(STD_INPUT_HANDLE);
  const auto output = GetStdHandle(STD_OUTPUT_HANDLE);
  writeJsonFrame(output, createHello());

  JsonObject message;
  while (readJsonFrame(input, message)) {
    const auto type = message.GetNamedString(L"type", L"");
    const auto id = message.GetNamedString(L"id", L"");
    if (type == L"cancel") {
      JsonObject cancelled;
      cancelled.Insert(L"type", JsonValue::CreateStringValue(L"cancelled"));
      cancelled.Insert(L"id", JsonValue::CreateStringValue(id));
      writeJsonFrame(output, cancelled);
      continue;
    }
    if (type != L"request" || id.empty()) {
      throw std::runtime_error("Native driver received an invalid request.");
    }
    const auto command = message.GetNamedString(L"command", L"");
    if (command == L"probe") {
      writeJsonFrame(output, createResponse(id, createProbeResult(message)));
    } else if (command == L"releaseActions") {
      writeJsonFrame(output, createNullResponse(id));
    } else if (command == L"dispose") {
      writeJsonFrame(output, createNullResponse(id));
      break;
    } else {
      writeJsonFrame(
          output,
          createErrorResponse(id, L"unsupported-operation",
                              L"The Windows helper skeleton does not implement this command yet."));
    }
  }
  return 0;
}

} // namespace

int wmain(int argc, wchar_t **argv) {
  try {
    winrt::init_apartment(winrt::apartment_type::multi_threaded);
    if (argc >= 2 && std::wstring_view(argv[1]) == L"--handshake") {
      std::cout << toUtf8(createHello().Stringify().c_str()) << '\n';
      return 0;
    }
    if (argc >= 2 && std::wstring_view(argv[1]) == L"--self-test") {
      return 0;
    }
    if (argc >= 2 && std::wstring_view(argv[1]) == L"--stdio") {
      return runStdio();
    }
    std::wcerr << L"Usage: furn-desktop-driver-host --handshake --json | --self-test | --stdio\n";
    return 2;
  } catch (const winrt::hresult_error &error) {
    std::cerr << toUtf8(error.message().c_str()) << '\n';
    return 1;
  } catch (const std::exception &error) {
    std::cerr << error.what() << '\n';
    return 1;
  }
}
