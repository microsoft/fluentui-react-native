#pragma once

#include <windows.h>

#include <string>
#include <vector>

namespace furn {

// Owns a kernel handle. Win32 reports failure as NULL for some functions and as
// INVALID_HANDLE_VALUE for others, so both mean "no handle" here.
class ScopedHandle {
 public:
  ScopedHandle() noexcept = default;
  explicit ScopedHandle(HANDLE handle) noexcept : handle_(Normalize(handle)) {}
  ScopedHandle(const ScopedHandle&) = delete;
  ScopedHandle& operator=(const ScopedHandle&) = delete;
  ScopedHandle(ScopedHandle&& other) noexcept : handle_(other.Release()) {}
  ScopedHandle& operator=(ScopedHandle&& other) noexcept {
    if (this != &other) {
      Reset(other.Release());
    }
    return *this;
  }
  ~ScopedHandle() { Reset(); }

  HANDLE Get() const noexcept { return handle_; }
  explicit operator bool() const noexcept { return handle_ != nullptr; }

  HANDLE Release() noexcept {
    HANDLE released = handle_;
    handle_ = nullptr;
    return released;
  }

  void Reset(HANDLE handle = nullptr) noexcept {
    const HANDLE next = Normalize(handle);
    if (handle_ != nullptr) {
      CloseHandle(handle_);
    }
    handle_ = next;
  }

 private:
  static HANDLE Normalize(HANDLE handle) noexcept { return handle == INVALID_HANDLE_VALUE ? nullptr : handle; }

  HANDLE handle_{nullptr};
};

// An owned copy of a security identifier.
class Sid {
 public:
  Sid() = default;

  static Sid Copy(PSID source);
  static Sid WellKnown(WELL_KNOWN_SID_TYPE type);
  static Sid Parse(const wchar_t* text);

  bool Valid() const noexcept { return !bytes_.empty(); }
  PSID Get() const noexcept { return bytes_.empty() ? nullptr : const_cast<BYTE*>(bytes_.data()); }
  bool Equals(PSID other) const noexcept;

 private:
  std::vector<BYTE> bytes_;
};

// The user SID of a token, or an invalid SID when the token cannot be read.
Sid TokenUserSid(HANDLE token);

// The user SID of the current process token, or an invalid SID on failure.
Sid CurrentUserSid();

// The terminal-services session of a process; false when it cannot be read.
bool ProcessSession(DWORD processId, DWORD& session);

}  // namespace furn
