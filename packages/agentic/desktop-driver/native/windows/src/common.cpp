#include "common.h"

#include <algorithm>
#include <array>
#include <charconv>
#include <cmath>
#include <cstdio>
#include <random>

namespace furn {
namespace {

std::string CreateSessionSalt() {
  LARGE_INTEGER counter{};
  QueryPerformanceCounter(&counter);
  std::mt19937_64 generator(static_cast<std::uint64_t>(counter.QuadPart) ^
                            (static_cast<std::uint64_t>(GetCurrentProcessId()) << 32));
  std::array<char, 17> buffer{};
  std::snprintf(buffer.data(), buffer.size(), "%08x", static_cast<unsigned>(generator() & 0xffffffffu));
  return std::string(buffer.data());
}

const std::string& SessionSalt() {
  static const std::string salt = CreateSessionSalt();
  return salt;
}

// The system message table has no text for UI Automation's own failures, which
// would otherwise reach callers as a bare number.
const char* DescribeUiaHresult(HRESULT result) {
  switch (static_cast<std::uint32_t>(result)) {
    case 0x80040200:
      return "The UI Automation element is not enabled";
    case 0x80040201:
      return "The UI Automation element is no longer available";
    case 0x80040202:
      return "The UI Automation element has no clickable point";
    case 0x80040204:
      return "The UI Automation operation is not supported by the element";
    case 0x80131505:
      return "The UI Automation request timed out because the application did not respond";
    case 0x80131509:
      return "The UI Automation element is not in a state that allows the operation";
    default:
      return nullptr;
  }
}

}  // namespace

std::string ToUtf8(std::wstring_view value) {
  if (value.empty()) {
    return {};
  }
  const int length = WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0, nullptr,
                                         nullptr);
  if (length <= 0) {
    Fail(kErrorInternal, "Could not convert UTF-16 text to UTF-8.");
  }
  std::string output(static_cast<std::size_t>(length), '\0');
  WideCharToMultiByte(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), output.data(), length, nullptr,
                      nullptr);
  return output;
}

std::wstring ToWide(std::string_view value) {
  if (value.empty()) {
    return {};
  }
  const int length = MultiByteToWideChar(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), nullptr, 0);
  if (length <= 0) {
    Fail(kErrorInternal, "Could not convert UTF-8 text to UTF-16.");
  }
  std::wstring output(static_cast<std::size_t>(length), L'\0');
  MultiByteToWideChar(CP_UTF8, 0, value.data(), static_cast<int>(value.size()), output.data(), length);
  return output;
}

bool IsStrictUtf8(std::string_view bytes) {
  std::size_t index = 0;
  while (index < bytes.size()) {
    const unsigned char lead = static_cast<unsigned char>(bytes[index]);
    if (lead < 0x80) {
      index += 1;
      continue;
    }
    std::size_t continuation = 0;
    std::uint32_t codepoint = 0;
    std::uint32_t minimum = 0;
    if ((lead & 0xE0) == 0xC0) {
      continuation = 1;
      codepoint = lead & 0x1F;
      minimum = 0x80;
    } else if ((lead & 0xF0) == 0xE0) {
      continuation = 2;
      codepoint = lead & 0x0F;
      minimum = 0x800;
    } else if ((lead & 0xF8) == 0xF0) {
      continuation = 3;
      codepoint = lead & 0x07;
      minimum = 0x10000;
    } else {
      return false;
    }
    if (index + continuation >= bytes.size()) {
      return false;
    }
    for (std::size_t offset = 1; offset <= continuation; offset += 1) {
      const unsigned char next = static_cast<unsigned char>(bytes[index + offset]);
      if ((next & 0xC0) != 0x80) {
        return false;
      }
      codepoint = (codepoint << 6) | (next & 0x3F);
    }
    if (codepoint < minimum || codepoint > 0x10FFFF || (codepoint >= 0xD800 && codepoint <= 0xDFFF)) {
      return false;
    }
    index += continuation + 1;
  }
  return true;
}

std::string TrimAscii(std::string_view value) {
  const auto isSpace = [](unsigned char character) { return character == ' ' || character == '\t' || character == '\r' || character == '\n'; };
  std::size_t start = 0;
  while (start < value.size() && isSpace(static_cast<unsigned char>(value[start]))) {
    start += 1;
  }
  std::size_t end = value.size();
  while (end > start && isSpace(static_cast<unsigned char>(value[end - 1]))) {
    end -= 1;
  }
  return std::string(value.substr(start, end - start));
}

std::string ToLowerAscii(std::string_view value) {
  std::string output(value);
  std::transform(output.begin(), output.end(), output.begin(), [](unsigned char character) {
    return static_cast<char>(character >= 'A' && character <= 'Z' ? character + ('a' - 'A') : character);
  });
  return output;
}

std::wstring TrimWide(std::wstring_view value) {
  std::size_t start = 0;
  while (start < value.size() && (value[start] == L' ' || value[start] == L'\t')) {
    start += 1;
  }
  std::size_t end = value.size();
  while (end > start && (value[end - 1] == L' ' || value[end - 1] == L'\t')) {
    end -= 1;
  }
  return std::wstring(value.substr(start, end - start));
}

void Fail(std::string code, std::string message) {
  throw HelperError(std::move(code), message);
}

std::string DescribeHresult(HRESULT result) {
  std::array<char, 32> hex{};
  std::snprintf(hex.data(), hex.size(), "0x%08X", static_cast<unsigned>(result));
  if (const char* known = DescribeUiaHresult(result)) {
    return std::string(known) + " (" + hex.data() + ")";
  }
  wchar_t* text = nullptr;
  const DWORD length = FormatMessageW(
      FORMAT_MESSAGE_ALLOCATE_BUFFER | FORMAT_MESSAGE_FROM_SYSTEM | FORMAT_MESSAGE_IGNORE_INSERTS, nullptr,
      static_cast<DWORD>(result), MAKELANGID(LANG_NEUTRAL, SUBLANG_DEFAULT), reinterpret_cast<wchar_t*>(&text), 0,
      nullptr);
  std::string description;
  if (length > 0 && text != nullptr) {
    description = TrimAscii(ToUtf8(std::wstring_view(text, length)));
  }
  if (text != nullptr) {
    LocalFree(text);
  }
  return description.empty() ? std::string(hex.data()) : description + " (" + hex.data() + ")";
}

void FailHresult(std::string code, std::string_view operation, HRESULT result) {
  Fail(std::move(code), std::string(operation) + " failed: " + DescribeHresult(result));
}

void CheckHresult(std::string code, std::string_view operation, HRESULT result) {
  if (FAILED(result)) {
    FailHresult(std::move(code), operation, result);
  }
}

void FailLastError(std::string code, std::string_view operation, DWORD error) {
  Fail(std::move(code), std::string(operation) + " failed: " + DescribeHresult(HRESULT_FROM_WIN32(error)));
}

void CancellationToken::Wait(unsigned int milliseconds) const {
  // Sleep against a high-resolution deadline so an action pause is never
  // shorter than requested and never accumulates system timer rounding.
  constexpr long long slice = 10;
  LARGE_INTEGER frequency{};
  LARGE_INTEGER start{};
  if (QueryPerformanceFrequency(&frequency) == FALSE || frequency.QuadPart <= 0 ||
      QueryPerformanceCounter(&start) == FALSE) {
    Sleep(milliseconds);
    ThrowIfCancelled();
    return;
  }
  const long long deadline =
      start.QuadPart + static_cast<long long>((static_cast<double>(milliseconds) / 1000.0) *
                                              static_cast<double>(frequency.QuadPart));
  while (true) {
    ThrowIfCancelled();
    LARGE_INTEGER now{};
    if (QueryPerformanceCounter(&now) == FALSE || now.QuadPart >= deadline) {
      break;
    }
    const long long remaining = ((deadline - now.QuadPart) * 1000) / frequency.QuadPart;
    Sleep(static_cast<DWORD>(remaining < slice ? (remaining > 0 ? remaining : 1) : slice));
  }
  ThrowIfCancelled();
}

std::string NextIdentifier(std::string_view prefix) {
  static std::atomic<std::uint64_t> counter{1};
  const std::uint64_t value = counter.fetch_add(1, std::memory_order_relaxed);
  std::array<char, 32> suffix{};
  std::snprintf(suffix.data(), suffix.size(), "%llx", static_cast<unsigned long long>(value));
  return std::string(prefix) + "-" + SessionSalt() + "-" + suffix.data();
}

std::uint64_t FileTimeTicks(const FILETIME& value) {
  ULARGE_INTEGER large{};
  large.LowPart = value.dwLowDateTime;
  large.HighPart = value.dwHighDateTime;
  return large.QuadPart;
}

std::string FormatFileTimeIso8601(const FILETIME& value) {
  SYSTEMTIME system{};
  if (!FileTimeToSystemTime(&value, &system)) {
    return {};
  }
  const std::uint64_t ticks = FileTimeTicks(value);
  const unsigned int fraction = static_cast<unsigned int>(ticks % 10000000ull);
  std::array<char, 48> buffer{};
  std::snprintf(buffer.data(), buffer.size(), "%04u-%02u-%02uT%02u:%02u:%02u.%07uZ", system.wYear, system.wMonth,
                system.wDay, system.wHour, system.wMinute, system.wSecond, fraction);
  return std::string(buffer.data());
}

bool TryParseIso8601(std::string_view value, FILETIME& parsed) {
  const std::string text = TrimAscii(value);
  if (text.size() < 19) {
    return false;
  }
  const auto number = [&text](std::size_t offset, std::size_t length, unsigned int& output) {
    if (offset + length > text.size()) {
      return false;
    }
    unsigned int result = 0;
    for (std::size_t index = 0; index < length; index += 1) {
      const char character = text[offset + index];
      if (character < '0' || character > '9') {
        return false;
      }
      result = result * 10 + static_cast<unsigned int>(character - '0');
    }
    output = result;
    return true;
  };
  unsigned int year = 0;
  unsigned int month = 0;
  unsigned int day = 0;
  unsigned int hour = 0;
  unsigned int minute = 0;
  unsigned int second = 0;
  if (!number(0, 4, year) || text[4] != '-' || !number(5, 2, month) || text[7] != '-' || !number(8, 2, day) ||
      (text[10] != 'T' && text[10] != ' ') || !number(11, 2, hour) || text[13] != ':' || !number(14, 2, minute) ||
      text[16] != ':' || !number(17, 2, second)) {
    return false;
  }
  std::uint64_t fraction = 0;
  std::size_t cursor = 19;
  if (cursor < text.size() && text[cursor] == '.') {
    cursor += 1;
    unsigned int digits = 0;
    while (cursor < text.size() && text[cursor] >= '0' && text[cursor] <= '9') {
      if (digits < 7) {
        fraction = fraction * 10 + static_cast<std::uint64_t>(text[cursor] - '0');
        digits += 1;
      }
      cursor += 1;
    }
    while (digits < 7) {
      fraction *= 10;
      digits += 1;
    }
  }
  long long offsetMinutes = 0;
  if (cursor < text.size()) {
    const char marker = text[cursor];
    if (marker == 'Z' || marker == 'z') {
      cursor += 1;
    } else if (marker == '+' || marker == '-') {
      unsigned int offsetHour = 0;
      unsigned int offsetMinute = 0;
      if (!number(cursor + 1, 2, offsetHour)) {
        return false;
      }
      std::size_t minuteOffset = cursor + 3;
      if (minuteOffset < text.size() && text[minuteOffset] == ':') {
        minuteOffset += 1;
      }
      if (!number(minuteOffset, 2, offsetMinute)) {
        return false;
      }
      offsetMinutes = static_cast<long long>(offsetHour) * 60 + offsetMinute;
      if (marker == '+') {
        offsetMinutes = -offsetMinutes;
      }
      cursor = minuteOffset + 2;
    }
  }
  SYSTEMTIME system{};
  system.wYear = static_cast<WORD>(year);
  system.wMonth = static_cast<WORD>(month);
  system.wDay = static_cast<WORD>(day);
  system.wHour = static_cast<WORD>(hour);
  system.wMinute = static_cast<WORD>(minute);
  system.wSecond = static_cast<WORD>(second);
  FILETIME base{};
  if (!SystemTimeToFileTime(&system, &base)) {
    return false;
  }
  const std::uint64_t ticks =
      FileTimeTicks(base) + fraction + static_cast<std::uint64_t>(offsetMinutes * 60ll * 10000000ll);
  ULARGE_INTEGER large{};
  large.QuadPart = ticks;
  parsed.dwLowDateTime = large.LowPart;
  parsed.dwHighDateTime = large.HighPart;
  return true;
}

double RoundToHundredths(double value) {
  if (!std::isfinite(value)) {
    return 0.0;
  }
  return std::round(value * 100.0) / 100.0;
}

}  // namespace furn
