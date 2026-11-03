#include "inputauthority.h"

#include <wtsapi32.h>

#include <cwchar>
#include <vector>

#include "common.h"

namespace furn {
namespace {

InputVerdict Unavailable(std::string reason) {
  InputVerdict verdict;
  verdict.reason = std::move(reason);
  return verdict;
}

bool EqualsIgnoreCase(const std::wstring& left, const wchar_t* right) {
  return _wcsicmp(left.c_str(), right) == 0;
}

const char* ConnectStateName(int state) {
  switch (state) {
    case WTSActive:
      return "active";
    case WTSConnected:
      return "connected without a signed-in user";
    case WTSConnectQuery:
      return "still connecting";
    case WTSShadow:
      return "being shadowed";
    case WTSDisconnected:
      return "disconnected";
    case WTSIdle:
      return "idle";
    case WTSListen:
      return "listening";
    case WTSReset:
      return "resetting";
    case WTSDown:
      return "down";
    case WTSInit:
      return "initializing";
    default:
      return "in an unknown state";
  }
}

std::wstring ReadObjectName(HANDLE object) {
  DWORD needed = 0;
  GetUserObjectInformationW(object, UOI_NAME, nullptr, 0, &needed);
  if (needed < sizeof(wchar_t) || needed > 4096) {
    return {};
  }
  std::vector<wchar_t> buffer(needed / sizeof(wchar_t) + 1, L'\0');
  if (GetUserObjectInformationW(object, UOI_NAME, buffer.data(), needed, &needed) == FALSE) {
    return {};
  }
  return std::wstring(buffer.data());
}

// One RPC reports both the connection state and the lock flag.
void ReadSessionState(InputEnvironment& environment) {
  LPWSTR buffer = nullptr;
  DWORD bytes = 0;
  if (WTSQuerySessionInformationW(WTS_CURRENT_SERVER_HANDLE, WTS_CURRENT_SESSION, WTSSessionInfoEx, &buffer,
                                  &bytes) != FALSE) {
    if (buffer != nullptr && bytes >= sizeof(WTSINFOEXW)) {
      const auto* info = reinterpret_cast<const WTSINFOEXW*>(buffer);
      if (info->Level == 1) {
        environment.connectState = static_cast<int>(info->Data.WTSInfoExLevel1.SessionState);
        const LONG flags = info->Data.WTSInfoExLevel1.SessionFlags;
        if (flags == WTS_SESSIONSTATE_LOCK) {
          environment.lock = SessionLock::Locked;
        } else if (flags == WTS_SESSIONSTATE_UNLOCK) {
          environment.lock = SessionLock::Unlocked;
        }
      }
    }
    WTSFreeMemory(buffer);
    if (environment.connectState >= 0) {
      return;
    }
  }
  buffer = nullptr;
  bytes = 0;
  if (WTSQuerySessionInformationW(WTS_CURRENT_SERVER_HANDLE, WTS_CURRENT_SESSION, WTSConnectState, &buffer,
                                  &bytes) != FALSE) {
    if (buffer != nullptr && bytes >= sizeof(int)) {
      environment.connectState = *reinterpret_cast<const int*>(buffer);
    }
    WTSFreeMemory(buffer);
  }
}

bool ReadTokenIntegrity(HANDLE token, DWORD& level, DWORD& error) {
  DWORD size = 0;
  GetTokenInformation(token, TokenIntegrityLevel, nullptr, 0, &size);
  if (size < sizeof(TOKEN_MANDATORY_LABEL) || size > 4096) {
    error = GetLastError();
    return false;
  }
  std::vector<BYTE> buffer(size);
  if (GetTokenInformation(token, TokenIntegrityLevel, buffer.data(), size, &size) == FALSE) {
    error = GetLastError();
    return false;
  }
  PSID sid = reinterpret_cast<const TOKEN_MANDATORY_LABEL*>(buffer.data())->Label.Sid;
  if (sid == nullptr || IsValidSid(sid) == FALSE) {
    error = ERROR_INVALID_SID;
    return false;
  }
  const UCHAR count = *GetSidSubAuthorityCount(sid);
  if (count == 0) {
    error = ERROR_INVALID_SID;
    return false;
  }
  level = *GetSidSubAuthority(sid, static_cast<DWORD>(count - 1));
  return true;
}

}  // namespace

InputEnvironment ReadInputEnvironment() {
  InputEnvironment environment;
  ReadSessionState(environment);

  if (const HWINSTA station = GetProcessWindowStation(); station != nullptr) {
    environment.windowStation = ReadObjectName(station);
  }

  // OpenInputDesktop succeeds only for the desktop that currently receives
  // user input, so a locked workstation, a UAC prompt, and a screen saver all
  // show up here as a refusal or as a desktop other than "Default".
  if (const HDESK desktop = OpenInputDesktop(0, FALSE, DESKTOP_READOBJECTS); desktop != nullptr) {
    environment.inputDesktopOpened = true;
    environment.inputDesktopName = ReadObjectName(desktop);
    CloseDesktop(desktop);
  } else {
    environment.inputDesktopError = GetLastError();
  }

  POINT cursor{};
  environment.cursorReadable = GetCursorPos(&cursor) != FALSE;
  return environment;
}

InputVerdict EvaluateInputEnvironment(const InputEnvironment& environment) {
  if (environment.connectState >= 0 && environment.connectState != WTSActive) {
    return Unavailable(std::string("The Windows session is ") + ConnectStateName(environment.connectState) +
                       " rather than active, so physical input cannot reach applications.");
  }
  if (environment.lock == SessionLock::Locked) {
    return Unavailable("The Windows session is locked, so physical input cannot reach applications.");
  }
  if (!environment.windowStation.empty() && !EqualsIgnoreCase(environment.windowStation, L"WinSta0")) {
    return Unavailable("The helper runs on the non-interactive window station \"" +
                       ToUtf8(environment.windowStation) + "\", so physical input cannot reach applications.");
  }
  if (environment.inputDesktopOpened) {
    if (!environment.inputDesktopName.empty() && !EqualsIgnoreCase(environment.inputDesktopName, L"Default")) {
      return Unavailable("The input desktop is \"" + ToUtf8(environment.inputDesktopName) +
                         "\" rather than the default desktop, so physical input cannot reach applications. A secure "
                         "desktop such as the lock screen, a UAC prompt, or a screen saver is active.");
    }
    return InputAvailable();
  }
  // Some hosted and packaged launch contexts deny the input-desktop handle
  // while the process still shares the active interactive session. A readable
  // cursor separates them from a secure desktop, which denies both.
  if (environment.cursorReadable) {
    return InputAvailable();
  }
  return Unavailable("The helper cannot open the input desktop (Windows error " +
                     std::to_string(environment.inputDesktopError) +
                     ") or read the cursor, so a secure desktop such as the lock screen or a UAC prompt is active or "
                     "the session is not interactive; physical input cannot reach applications.");
}

ProcessIntegrity ReadProcessIntegrity(DWORD processId) {
  ProcessIntegrity integrity;
  HANDLE process = nullptr;
  bool owned = false;
  if (processId == 0 || processId == GetCurrentProcessId()) {
    process = GetCurrentProcess();
  } else {
    process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION, FALSE, processId);
    owned = true;
    if (process == nullptr) {
      integrity.error = GetLastError();
      return integrity;
    }
  }
  HANDLE token = nullptr;
  if (OpenProcessToken(process, TOKEN_QUERY, &token) == FALSE) {
    integrity.error = GetLastError();
  } else {
    integrity.known = ReadTokenIntegrity(token, integrity.level, integrity.error);
    CloseHandle(token);
  }
  if (owned) {
    CloseHandle(process);
  }
  return integrity;
}

const ProcessIntegrity& HelperIntegrity() {
  static const ProcessIntegrity integrity = ReadProcessIntegrity(0);
  return integrity;
}

const char* DescribeIntegrityLevel(DWORD level) {
  if (level >= SECURITY_MANDATORY_SYSTEM_RID) {
    return "system";
  }
  if (level >= SECURITY_MANDATORY_HIGH_RID) {
    return "high";
  }
  if (level > SECURITY_MANDATORY_MEDIUM_RID) {
    return "medium-plus";
  }
  if (level >= SECURITY_MANDATORY_MEDIUM_RID) {
    return "medium";
  }
  if (level >= SECURITY_MANDATORY_LOW_RID) {
    return "low";
  }
  return "untrusted";
}

InputVerdict EvaluateInjectionTarget(const ProcessIntegrity& helper, const ProcessIntegrity& target) {
  if (!target.known) {
    if (target.error == ERROR_ACCESS_DENIED) {
      return Unavailable(
          "Windows denied reading the target application's security token, so it is probably elevated, protected, "
          "or owned by another account, and the operating system can drop the input this helper injects into it.");
    }
    // A process that is gone or unreadable for another reason is reported by
    // the window and element checks that follow.
    return InputAvailable();
  }
  if (!helper.known) {
    return InputAvailable();
  }
  if (target.level > helper.level) {
    return Unavailable(std::string("The target application runs at ") + DescribeIntegrityLevel(target.level) +
                       " integrity but this helper runs at " + DescribeIntegrityLevel(helper.level) +
                       ", so Windows (UIPI) drops the input it injects. Run the helper at the same or a higher "
                       "integrity level.");
  }
  return InputAvailable();
}

InputEnvironment InteractiveEnvironmentForTesting() {
  InputEnvironment environment;
  environment.connectState = WTSActive;
  environment.lock = SessionLock::Unlocked;
  environment.windowStation = L"WinSta0";
  environment.inputDesktopOpened = true;
  environment.inputDesktopName = L"Default";
  environment.cursorReadable = true;
  return environment;
}

}  // namespace furn
