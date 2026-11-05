#pragma once

#include <windows.h>

#include <string>

namespace furn {

enum class SessionLock { Unknown, Unlocked, Locked };

// The facts that decide whether injected input can reach an application right
// now. They are read fresh for every physical operation, and evaluation is a
// pure function of them so every verdict is testable without changing the real
// session.
struct InputEnvironment {
  // WTS_CONNECTSTATE_CLASS of the helper's session, or -1 when unreadable.
  int connectState{-1};
  SessionLock lock{SessionLock::Unknown};
  // Empty when the name could not be read.
  std::wstring windowStation;
  bool inputDesktopOpened{false};
  std::wstring inputDesktopName;
  DWORD inputDesktopError{0};
  bool cursorReadable{false};
};

struct InputVerdict {
  bool available{false};
  // Why input cannot be delivered; empty when it can.
  std::string reason;
};

inline InputVerdict InputAvailable() {
  InputVerdict verdict;
  verdict.available = true;
  return verdict;
}

// Mandatory integrity of a process token. UIPI drops input that a lower
// integrity process injects into a higher integrity one, and SendInput does
// not report the drop.
struct ProcessIntegrity {
  bool known{false};
  DWORD level{0};  // SECURITY_MANDATORY_*_RID
  DWORD error{0};  // The Win32 error that kept the level unread
};

InputEnvironment ReadInputEnvironment();
InputVerdict EvaluateInputEnvironment(const InputEnvironment& environment);

// A process id of 0 reads the helper's own token.
ProcessIntegrity ReadProcessIntegrity(DWORD processId);
const ProcessIntegrity& HelperIntegrity();
const char* DescribeIntegrityLevel(DWORD level);
InputVerdict EvaluateInjectionTarget(const ProcessIntegrity& helper, const ProcessIntegrity& target);

// A neutral environment for tests that redirect injection away from the desktop.
InputEnvironment InteractiveEnvironmentForTesting();

}  // namespace furn
