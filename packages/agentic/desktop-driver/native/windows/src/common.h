#pragma once

#include <windows.h>

#include <objbase.h>
#include <oleauto.h>

#include <atomic>
#include <cstdint>
#include <exception>
#include <stdexcept>
#include <string>
#include <string_view>

namespace furn {

// Wire error codes shared with the Node adapter. "unsupported-operation" and
// "stale-element" carry protocol meaning; the remaining codes are diagnostic.
inline constexpr char kErrorUnsupported[] = "unsupported-operation";
inline constexpr char kErrorStaleElement[] = "stale-element";
inline constexpr char kErrorInvalidRequest[] = "invalid-request";
inline constexpr char kErrorInvalidParams[] = "invalid-params";
inline constexpr char kErrorNoSuchWindow[] = "no-such-window";
inline constexpr char kErrorNoSuchElement[] = "no-such-element";
inline constexpr char kErrorNotInteractable[] = "element-not-interactable";
inline constexpr char kErrorAutomationFailed[] = "automation-failed";
inline constexpr char kErrorInputUnavailable[] = "input-unavailable";
inline constexpr char kErrorInputBusy[] = "input-busy";
inline constexpr char kErrorInputFailed[] = "input-failed";
inline constexpr char kErrorLaunchFailed[] = "launch-failed";
inline constexpr char kErrorAttachFailed[] = "attach-failed";
inline constexpr char kErrorLeaseInvalid[] = "lease-invalid";
inline constexpr char kErrorAmbiguousTarget[] = "ambiguous-target";
inline constexpr char kErrorNoSuchLease[] = "no-such-lease";
inline constexpr char kErrorWindowActivation[] = "window-activation-failed";
inline constexpr char kErrorCaptureFailed[] = "capture-failed";
inline constexpr char kErrorTreeTooLarge[] = "tree-too-large";
inline constexpr char kErrorInternal[] = "internal-error";

std::string ToUtf8(std::wstring_view value);
std::wstring ToWide(std::string_view value);
std::string TrimAscii(std::string_view value);
std::string ToLowerAscii(std::string_view value);
std::wstring TrimWide(std::wstring_view value);

// Structured failure that maps directly onto a protocol error response.
class HelperError : public std::runtime_error {
 public:
  HelperError(std::string code, const std::string& message)
      : std::runtime_error(message), code_(std::move(code)) {}

  const std::string& code() const noexcept { return code_; }

 private:
  std::string code_;
};

[[noreturn]] void Fail(std::string code, std::string message);
[[noreturn]] void FailHresult(std::string code, std::string_view operation, HRESULT result);
void CheckHresult(std::string code, std::string_view operation, HRESULT result);
[[noreturn]] void FailLastError(std::string code, std::string_view operation, DWORD error);
std::string DescribeHresult(HRESULT result);

// Raised when a command observes cancellation between two bounded steps.
class CancelledError : public std::exception {
 public:
  const char* what() const noexcept override { return "The native command was cancelled."; }
};

class CancellationToken {
 public:
  void Cancel() noexcept { cancelled_.store(true, std::memory_order_release); }
  void Reset() noexcept { cancelled_.store(false, std::memory_order_release); }
  bool IsCancelled() const noexcept { return cancelled_.load(std::memory_order_acquire); }

  void ThrowIfCancelled() const {
    if (IsCancelled()) {
      throw CancelledError{};
    }
  }

  // Sleeps in bounded slices so cancellation is observed promptly.
  void Wait(unsigned int milliseconds) const;

 private:
  std::atomic<bool> cancelled_{false};
};

class Deadline {
 public:
  explicit Deadline(unsigned int timeoutMs) noexcept : expiresAt_(GetTickCount64() + timeoutMs) {}

  bool Expired() const noexcept { return GetTickCount64() >= expiresAt_; }

 private:
  ULONGLONG expiresAt_{0};
};

// Opaque, helper-generated identifiers. Native handles never reach the wire.
std::string NextIdentifier(std::string_view prefix);

std::string FormatFileTimeIso8601(const FILETIME& value);
bool TryParseIso8601(std::string_view value, FILETIME& parsed);
std::uint64_t FileTimeTicks(const FILETIME& value);

double RoundToHundredths(double value);

}  // namespace furn
