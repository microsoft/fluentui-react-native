#include "inputlock.h"

#include <iostream>
#include <mutex>
#include <string>
#include <utility>

namespace furn {
namespace {

// The named mutex handle lives for the life of the process; ownership is
// tracked per thread so nested command scopes never wait twice.
std::mutex stateMutex;
HANDLE inputMutex = nullptr;
DWORD ownerThread = 0;
unsigned int ownerDepth = 0;
std::wstring inputMutexName = kPhysicalInputMutexName;

HANDLE EnsureMutex() {
  if (inputMutex == nullptr) {
    inputMutex = CreateMutexW(nullptr, FALSE, inputMutexName.c_str());
    if (inputMutex == nullptr) {
      FailLastError(kErrorInputBusy, "Creating the physical input mutex", GetLastError());
    }
  }
  return inputMutex;
}

void WriteDiagnostic(const std::string& message) {
  std::cerr << "furn-desktop-driver-host: " << message << '\n';
}

}  // namespace

const wchar_t* PhysicalInputMutexName() noexcept {
  return inputMutexName.c_str();
}

void SetPhysicalInputMutexNameForTesting(std::wstring name) {
  const std::lock_guard<std::mutex> guard(stateMutex);
  if (name.empty() || ownerDepth != 0) {
    Fail(kErrorInvalidParams, "The physical input mutex test name is invalid or the mutex is currently owned.");
  }
  if (inputMutex != nullptr) {
    CloseHandle(inputMutex);
    inputMutex = nullptr;
  }
  inputMutexName = std::move(name);
  ownerThread = 0;
}

PhysicalInputScope::PhysicalInputScope(const CancellationToken& token, unsigned int timeoutMs, AbandonPolicy policy) {
  HANDLE handle = nullptr;
  {
    const std::lock_guard<std::mutex> guard(stateMutex);
    handle = EnsureMutex();
    if (ownerDepth > 0 && ownerThread == GetCurrentThreadId()) {
      ownerDepth += 1;
      owns_ = true;
      nested_ = true;
      return;
    }
  }

  const Deadline deadline(timeoutMs);
  while (true) {
    token.ThrowIfCancelled();
    const DWORD result = WaitForSingleObject(handle, 50);
    if (result == WAIT_OBJECT_0) {
      break;
    }
    if (result == WAIT_ABANDONED) {
      if (policy == AbandonPolicy::Adopt) {
        WriteDiagnostic("adopting physical input abandoned by a terminated helper.");
        break;
      }
      ReleaseMutex(handle);
      Fail(kErrorInputBusy,
           "A previous desktop driver helper terminated while holding physical input, so keys or buttons may still "
           "be depressed. Run the helper with --release-input to recover, then retry the command.");
    }
    if (result != WAIT_TIMEOUT) {
      FailLastError(kErrorInputBusy, "Waiting for the physical input mutex", GetLastError());
    }
    if (deadline.Expired()) {
      Fail(kErrorInputBusy, "Another desktop driver helper held physical input for longer than " +
                                std::to_string(timeoutMs) +
                                " ms. Wait for the other session to finish its input command, or run the helper with "
                                "--release-input if that session is gone.");
    }
  }

  const std::lock_guard<std::mutex> guard(stateMutex);
  ownerThread = GetCurrentThreadId();
  ownerDepth = 1;
  owns_ = true;
}

PhysicalInputScope::PhysicalInputScope(PhysicalInputScope&& other) noexcept
    : owns_(other.owns_), nested_(other.nested_) {
  other.owns_ = false;
  other.nested_ = false;
}

PhysicalInputScope& PhysicalInputScope::operator=(PhysicalInputScope&& other) noexcept {
  if (this != &other) {
    Release();
    owns_ = other.owns_;
    nested_ = other.nested_;
    other.owns_ = false;
    other.nested_ = false;
  }
  return *this;
}

PhysicalInputScope::~PhysicalInputScope() {
  Release();
}

void PhysicalInputScope::Release() noexcept {
  if (!owns_) {
    return;
  }
  owns_ = false;
  nested_ = false;
  const std::lock_guard<std::mutex> guard(stateMutex);
  if (ownerDepth == 0 || ownerThread != GetCurrentThreadId()) {
    return;
  }
  ownerDepth -= 1;
  if (ownerDepth == 0) {
    ownerThread = 0;
    ReleaseMutex(inputMutex);
  }
}

}  // namespace furn
