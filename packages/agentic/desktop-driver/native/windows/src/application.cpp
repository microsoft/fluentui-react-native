#include "application.h"

#include <appmodel.h>
#include <shobjidl_core.h>
#include <tlhelp32.h>

#include <algorithm>
#include <cmath>
#include <exception>
#include <filesystem>
#include <iostream>
#include <optional>
#include <unordered_set>
#include <utility>

#include <winrt/base.h>

#include "geometry.h"
#include "settlement.h"

namespace furn {

std::wstring QuoteWindowsCommandLineArgument(std::wstring_view value) {
  std::wstring quoted(1, L'"');
  std::size_t backslashes = 0;
  for (const wchar_t character : value) {
    if (character == L'\\') {
      backslashes += 1;
      continue;
    }
    if (character == L'"') {
      quoted.append(backslashes * 2 + 1, L'\\');
      quoted += L'"';
      backslashes = 0;
      continue;
    }
    quoted.append(backslashes, L'\\');
    backslashes = 0;
    quoted += character;
  }
  quoted.append(backslashes * 2, L'\\');
  quoted += L'"';
  return quoted;
}

namespace {

constexpr unsigned int kLaunchTimeoutMs = 90000;
constexpr unsigned int kLaunchGraceMs = 15000;
constexpr unsigned int kCloseTimeoutMs = 5000;
constexpr unsigned int kActivationTimeoutMs = 2000;
constexpr DWORD kLaunchCleanupGraceMs = 250;
constexpr DWORD kLaunchCleanupForcedMs = 1000;
constexpr unsigned int kDisposeGraceMs = 3000;
constexpr unsigned int kDisposeForcedMs = 3000;
constexpr DWORD kOwnedProcessAccess = PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE | PROCESS_TERMINATE;
// PowerShell writes the lease with 100-nanosecond precision; allow a small
// tolerance so rounding never rejects the correct process.
constexpr std::uint64_t kStartTimeToleranceTicks = 100000;  // 10 milliseconds

struct EnumerationContext {
  DWORD processId{0};
  std::vector<HWND> windows;
};

BOOL CALLBACK CollectWindow(HWND window, LPARAM parameter) {
  auto* context = reinterpret_cast<EnumerationContext*>(parameter);
  DWORD processId = 0;
  GetWindowThreadProcessId(window, &processId);
  if (context->processId != 0 && processId != context->processId) {
    return TRUE;
  }
  if (IsWindowVisible(window) == FALSE) {
    return TRUE;
  }
  if (GetAncestor(window, GA_ROOT) != window) {
    return TRUE;
  }
  const LONG_PTR exStyle = GetWindowLongPtrW(window, GWL_EXSTYLE);
  if ((exStyle & WS_EX_TOOLWINDOW) != 0 && ReadWindowTitle(window).empty()) {
    return TRUE;
  }
  RECT bounds{};
  if (GetWindowRect(window, &bounds) == FALSE || IsEmptyRect(bounds)) {
    return TRUE;
  }
  context->windows.push_back(window);
  return TRUE;
}

BOOL CALLBACK CollectProcessWindow(HWND window, LPARAM parameter) {
  auto* context = reinterpret_cast<EnumerationContext*>(parameter);
  DWORD processId = 0;
  GetWindowThreadProcessId(window, &processId);
  if (processId == context->processId) {
    context->windows.push_back(window);
  }
  return TRUE;
}

// Every top-level window of a process, hidden ones included, in z-order.
std::vector<HWND> EnumerateAllTopLevelWindows(DWORD processId) {
  EnumerationContext context;
  context.processId = processId;
  EnumWindows(CollectProcessWindow, reinterpret_cast<LPARAM>(&context));
  return context.windows;
}

struct WindowFingerprint {
  DWORD threadId{0};
  std::wstring className;
};

WindowFingerprint ReadWindowFingerprint(HWND window) {
  WindowFingerprint fingerprint;
  fingerprint.threadId = GetWindowThreadProcessId(window, nullptr);
  wchar_t className[256] = {};
  const int length = GetClassNameW(window, className, static_cast<int>(std::size(className)));
  if (length > 0) {
    fingerprint.className.assign(className, static_cast<std::size_t>(length));
  }
  return fingerprint;
}

std::string ReadFileWithRetry(const std::wstring& path, const CancellationToken& token) {
  for (int attempt = 0; attempt < 20; attempt += 1) {
    token.ThrowIfCancelled();
    const HANDLE file = CreateFileW(path.c_str(), GENERIC_READ, FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE,
                                    nullptr, OPEN_EXISTING, FILE_ATTRIBUTE_NORMAL, nullptr);
    if (file == INVALID_HANDLE_VALUE) {
      const DWORD error = GetLastError();
      if (error == ERROR_SHARING_VIOLATION) {
        token.Wait(25);
        continue;
      }
      FailLastError(kErrorLeaseInvalid, "Opening the application lease file", error);
    }
    std::string contents;
    char buffer[4096];
    DWORD read = 0;
    while (ReadFile(file, buffer, sizeof(buffer), &read, nullptr) != FALSE && read > 0) {
      contents.append(buffer, read);
    }
    CloseHandle(file);
    if (contents.size() >= 3 && static_cast<unsigned char>(contents[0]) == 0xEF &&
        static_cast<unsigned char>(contents[1]) == 0xBB && static_cast<unsigned char>(contents[2]) == 0xBF) {
      contents.erase(0, 3);
    }
    return contents;
  }
  Fail(kErrorLeaseInvalid, "The application lease file stayed locked by another writer.");
}

winrt::handle OpenProcessForIdentity(DWORD processId, std::string_view failureCode) {
  winrt::handle process{OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, processId)};
  if (!process) {
    FailLastError(std::string(failureCode), "Opening the target application process", GetLastError());
  }
  return process;
}

bool IsProcessAlive(HANDLE process) {
  if (process == nullptr) {
    return false;
  }
  return WaitForSingleObject(process, 0) == WAIT_TIMEOUT;
}

std::wstring NormalizeExecutablePath(std::wstring path) {
  if (path.starts_with(L"\\\\?\\UNC\\")) {
    return L"\\\\" + path.substr(8);
  }
  if (path.starts_with(L"\\\\?\\")) {
    return path.substr(4);
  }
  return path;
}

std::wstring CanonicalizeExecutablePath(const std::wstring& executablePath) {
  const HANDLE rawFile =
      CreateFileW(executablePath.c_str(), FILE_READ_ATTRIBUTES,
                  FILE_SHARE_READ | FILE_SHARE_WRITE | FILE_SHARE_DELETE, nullptr, OPEN_EXISTING,
                  FILE_ATTRIBUTE_NORMAL, nullptr);
  if (rawFile == INVALID_HANDLE_VALUE) {
    FailLastError(kErrorInvalidParams, "Opening the configured application executable", GetLastError());
  }
  winrt::handle file;
  file.attach(rawFile);
  const DWORD required =
      GetFinalPathNameByHandleW(file.get(), nullptr, 0, FILE_NAME_NORMALIZED | VOLUME_NAME_DOS);
  if (required == 0) {
    FailLastError(kErrorInvalidParams, "Resolving the configured application executable", GetLastError());
  }
  std::wstring resolved(required, L'\0');
  const DWORD written = GetFinalPathNameByHandleW(file.get(), resolved.data(), required,
                                                  FILE_NAME_NORMALIZED | VOLUME_NAME_DOS);
  if (written == 0 || written >= required) {
    FailLastError(kErrorInvalidParams, "Resolving the configured application executable", GetLastError());
  }
  resolved.resize(written);
  return NormalizeExecutablePath(std::move(resolved));
}

std::wstring ReadProcessApplicationUserModelId(HANDLE process) {
  UINT32 length = 0;
  const LONG measured = GetApplicationUserModelId(process, &length, nullptr);
  if (measured != ERROR_INSUFFICIENT_BUFFER || length == 0) {
    return {};
  }
  std::wstring value(length, L'\0');
  if (GetApplicationUserModelId(process, &length, value.data()) != ERROR_SUCCESS || length == 0) {
    return {};
  }
  value.resize(length - 1);
  return value;
}

bool ProcessStartedForLaunch(HANDLE process, const FILETIME& launchStartedAt) {
  FILETIME processStartedAt{};
  if (!TryReadProcessStartTime(process, processStartedAt)) {
    return false;
  }
  return FileTimeTicks(processStartedAt) >= FileTimeTicks(launchStartedAt);
}

bool ProcessMatchesLaunchIdentity(HANDLE process, const std::wstring& aumid,
                                  const std::wstring& executablePath) {
  if (!aumid.empty()) {
    const std::wstring actualAumid = ReadProcessApplicationUserModelId(process);
    return !actualAumid.empty() && _wcsicmp(actualAumid.c_str(), aumid.c_str()) == 0;
  }
  const std::wstring actualPath = NormalizeExecutablePath(ReadProcessImagePath(process));
  return !actualPath.empty() && _wcsicmp(actualPath.c_str(), executablePath.c_str()) == 0;
}

winrt::handle DuplicateProcessHandle(HANDLE process) {
  HANDLE duplicated = nullptr;
  if (DuplicateHandle(GetCurrentProcess(), process, GetCurrentProcess(), &duplicated, 0,
                      FALSE, DUPLICATE_SAME_ACCESS) == FALSE) {
    return {};
  }
  winrt::handle result;
  result.attach(duplicated);
  return result;
}

void PostCloseToExactProcessWindows(DWORD processId, const FILETIME& expectedStartTime) {
  if (processId == 0 || FileTimeTicks(expectedStartTime) == 0) {
    return;
  }
  for (const HWND window : EnumerateTopLevelWindows(processId)) {
    DWORD owner = 0;
    GetWindowThreadProcessId(window, &owner);
    if (owner != processId) {
      continue;
    }
    winrt::handle currentProcess{
        OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, owner)};
    FILETIME currentStartTime{};
    if (!currentProcess ||
        !TryReadProcessStartTime(currentProcess.get(), currentStartTime) ||
        FileTimeTicks(currentStartTime) != FileTimeTicks(expectedStartTime)) {
      continue;
    }
    DWORD revalidatedOwner = 0;
    GetWindowThreadProcessId(window, &revalidatedOwner);
    if (revalidatedOwner == owner) {
      PostMessageW(window, WM_CLOSE, 0, 0);
    }
  }
}

struct TrackedLaunchProcess {
  DWORD processId{0};
  FILETIME startTime{};
  winrt::handle process;
};

class LaunchProcessGuard {
 public:
  ~LaunchProcessGuard() {
    try {
      const std::string failure = Cleanup();
      if (!failure.empty()) {
        std::cerr << "furn-desktop-driver-host: launch cleanup failed: " << failure << '\n';
      }
    } catch (...) {
      std::cerr << "furn-desktop-driver-host: launch cleanup failed with an unknown error.\n";
    }
  }

  void Track(DWORD processId, winrt::handle process) {
    if (!process || Find(processId) != nullptr) {
      return;
    }
    FILETIME startTime{};
    TryReadProcessStartTime(process.get(), startTime);
    processes_.push_back(TrackedLaunchProcess{processId, startTime, std::move(process)});
  }

  HANDLE Find(DWORD processId) const {
    const auto entry = std::find_if(processes_.begin(), processes_.end(),
                                    [processId](const TrackedLaunchProcess& candidate) {
                                      return candidate.processId == processId;
                                    });
    return entry == processes_.end() ? nullptr : entry->process.get();
  }

  winrt::handle Take(DWORD processId) {
    const auto entry = std::find_if(processes_.begin(), processes_.end(),
                                    [processId](const TrackedLaunchProcess& candidate) {
                                      return candidate.processId == processId;
                                    });
    if (entry == processes_.end()) {
      return {};
    }
    winrt::handle process = std::move(entry->process);
    processes_.erase(entry);
    return process;
  }

  std::string Cleanup() {
    std::string failures;
    std::unordered_map<HANDLE, DWORD> terminationErrors;
    std::vector<HANDLE> handles;
    for (TrackedLaunchProcess& tracked : processes_) {
      if (!IsProcessAlive(tracked.process.get())) {
        continue;
      }
      PostCloseToExactProcessWindows(tracked.processId, tracked.startTime);
      handles.push_back(tracked.process.get());
    }
    if (!handles.empty()) {
      if (handles.size() <= MAXIMUM_WAIT_OBJECTS) {
        WaitForMultipleObjects(static_cast<DWORD>(handles.size()), handles.data(), TRUE,
                               kLaunchCleanupGraceMs);
      } else {
        Sleep(kLaunchCleanupGraceMs);
      }
    }
    for (TrackedLaunchProcess& tracked : processes_) {
      if (!IsProcessAlive(tracked.process.get())) {
        continue;
      }
      if (TerminateProcess(tracked.process.get(), 0) == FALSE &&
          IsProcessAlive(tracked.process.get())) {
        terminationErrors.emplace(tracked.process.get(), GetLastError());
      }
    }
    if (!handles.empty()) {
      if (handles.size() <= MAXIMUM_WAIT_OBJECTS) {
        WaitForMultipleObjects(static_cast<DWORD>(handles.size()), handles.data(), TRUE,
                               kLaunchCleanupForcedMs);
      } else {
        Sleep(kLaunchCleanupForcedMs);
      }
    }
    std::vector<TrackedLaunchProcess> remaining;
    for (TrackedLaunchProcess& tracked : processes_) {
      if (!IsProcessAlive(tracked.process.get())) {
        continue;
      }
      if (!failures.empty()) {
        failures += "; ";
      }
      const auto terminationError = terminationErrors.find(tracked.process.get());
      failures += terminationError == terminationErrors.end()
                      ? "Process " + std::to_string(tracked.processId) +
                            " did not exit during bounded launch cleanup."
                      : "Terminating process " + std::to_string(tracked.processId) +
                            " failed: " +
                            DescribeHresult(HRESULT_FROM_WIN32(terminationError->second));
      remaining.push_back(std::move(tracked));
    }
    processes_ = std::move(remaining);
    return failures;
  }

  std::vector<TrackedLaunchProcess> ReleaseRemaining() {
    return std::exchange(processes_, {});
  }

 private:
  std::vector<TrackedLaunchProcess> processes_;
};

struct LaunchRootIdentity {
  DWORD processId{0};
  FILETIME startTime{};
  winrt::handle process;
  bool trusted{false};

  bool valid() const noexcept { return trusted && processId != 0 && process; }
};

std::unordered_map<DWORD, DWORD> CaptureParentProcessIds() {
  std::unordered_map<DWORD, DWORD> parents;
  const HANDLE rawSnapshot = CreateToolhelp32Snapshot(TH32CS_SNAPPROCESS, 0);
  if (rawSnapshot == INVALID_HANDLE_VALUE) {
    return parents;
  }
  winrt::handle snapshot;
  snapshot.attach(rawSnapshot);
  PROCESSENTRY32W entry{};
  entry.dwSize = sizeof(entry);
  if (Process32FirstW(snapshot.get(), &entry) == FALSE) {
    return parents;
  }
  do {
    parents.emplace(entry.th32ProcessID, entry.th32ParentProcessID);
  } while (Process32NextW(snapshot.get(), &entry) != FALSE);
  return parents;
}

bool IsCausallyRelatedProcess(DWORD candidateProcessId,
                              const FILETIME& candidateStartTime,
                              const LaunchRootIdentity& root,
                              const std::unordered_map<DWORD, DWORD>& parents) {
  if (candidateProcessId == 0 || !root.valid()) {
    return false;
  }
  DWORD current = candidateProcessId;
  std::uint64_t currentStartTicks = FileTimeTicks(candidateStartTime);
  const std::uint64_t rootStartTicks = FileTimeTicks(root.startTime);
  std::unordered_set<DWORD> visited;
  for (std::size_t depth = 0; depth < 64 && current != 0 && visited.insert(current).second;
       depth += 1) {
    if (current == root.processId) {
      return currentStartTicks == rootStartTicks;
    }
    const auto parent = parents.find(current);
    if (parent == parents.end()) {
      return false;
    }
    const DWORD parentProcessId = parent->second;
    if (parentProcessId == root.processId) {
      winrt::handle currentRoot{
          OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE,
                      root.processId)};
      FILETIME currentRootStartTime{};
      if (!currentRoot) {
        if (GetLastError() != ERROR_INVALID_PARAMETER) {
          return false;
        }
      } else {
        if (!TryReadProcessStartTime(currentRoot.get(), currentRootStartTime) ||
            FileTimeTicks(currentRootStartTime) != rootStartTicks) {
          return false;
        }
      }
      return rootStartTicks <= currentStartTicks;
    }
    winrt::handle parentProcess{
        OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE,
                    parentProcessId)};
    FILETIME parentStartTime{};
    if (!parentProcess || !TryReadProcessStartTime(parentProcess.get(), parentStartTime)) {
      return false;
    }
    const std::uint64_t parentStartTicks = FileTimeTicks(parentStartTime);
    if (parentStartTicks < rootStartTicks || parentStartTicks > currentStartTicks) {
      return false;
    }
    current = parentProcessId;
    currentStartTicks = parentStartTicks;
  }
  return false;
}

void TrackRelatedLaunchProcesses(const LaunchRootIdentity& root,
                                 const std::wstring& aumid,
                                 const std::wstring& executablePath,
                                 const FILETIME& launchStartedAt,
                                 LaunchProcessGuard& launchProcesses) {
  if (!root.valid()) {
    return;
  }
  const std::unordered_map<DWORD, DWORD> parents = CaptureParentProcessIds();
  for (const auto& [processId, _parentProcessId] : parents) {
    winrt::handle process{OpenProcess(kOwnedProcessAccess, FALSE, processId)};
    FILETIME processStartTime{};
    if (!process || !TryReadProcessStartTime(process.get(), processStartTime) ||
        !ProcessStartedForLaunch(process.get(), launchStartedAt) ||
        !IsCausallyRelatedProcess(processId, processStartTime, root, parents) ||
        !ProcessMatchesLaunchIdentity(process.get(), aumid, executablePath)) {
      continue;
    }
    launchProcesses.Track(processId, std::move(process));
  }
}

[[noreturn]] void RethrowWithCleanup(std::exception_ptr original, const std::string& cleanupFailure) {
  if (cleanupFailure.empty()) {
    std::rethrow_exception(original);
  }
  try {
    std::rethrow_exception(original);
  } catch (const std::exception& error) {
    Fail(kErrorCleanupFailed, std::string(error.what()) + " Launch cleanup also failed: " + cleanupFailure);
  } catch (...) {
    Fail(kErrorCleanupFailed, "Application launch failed and cleanup also failed: " + cleanupFailure);
  }
}

struct ActivationOutcome {
  bool activated{false};
  bool sawForeground{false};
};

class ForegroundInputAttachment {
 public:
  explicit ForegroundInputAttachment(DWORD selfThread) noexcept : selfThread_(selfThread) {}

  ~ForegroundInputAttachment() {
    if (otherThread_ != 0) {
      AttachThreadInput(selfThread_, otherThread_, FALSE);
    }
  }

  bool Attach(DWORD otherThread) {
    if (otherThread_ != 0 || otherThread == 0 || otherThread == selfThread_) {
      return otherThread_ != 0;
    }
    if (AttachThreadInput(selfThread_, otherThread, TRUE) == FALSE) {
      return false;
    }
    otherThread_ = otherThread;
    return true;
  }

  bool attached() const noexcept { return otherThread_ != 0; }

 private:
  DWORD selfThread_{0};
  DWORD otherThread_{0};
};

// Like application activation on macOS, a foreground popup that the window owns keeps the window's activation
// context. Re-activating the owner would dismiss that popup with input no user produced; a physical press on the owner
// activates it as the user's own press would.
bool IsInActivationContext(HWND window, HWND foreground) noexcept {
  for (HWND current = foreground; current != nullptr; current = GetWindow(current, GW_OWNER)) {
    if (current == window || GetAncestor(current, GA_ROOT) == window) {
      return true;
    }
  }
  return false;
}

ActivationOutcome ActivateWindowInternal(HWND window, const CancellationToken& token) {
  if (window == nullptr || IsWindow(window) == FALSE) {
    Fail(kErrorNoSuchWindow, "The requested window is no longer available.");
  }
  if (IsIconic(window) != FALSE) {
    ShowWindow(window, SW_RESTORE);
  }
  AllowSetForegroundWindow(ASFW_ANY);
  const DWORD currentThread = GetCurrentThreadId();
  ForegroundInputAttachment inputAttachment(currentThread);
  const Deadline deadline(kActivationTimeoutMs);
  ActivationOutcome outcome;
  while (true) {
    token.ThrowIfCancelled();
    const HWND foreground = GetForegroundWindow();
    outcome.sawForeground = outcome.sawForeground || foreground != nullptr;
    if (IsInActivationContext(window, foreground)) {
      outcome.activated = true;
      break;
    }
    if (deadline.Expired()) {
      break;
    }
    if (!inputAttachment.attached()) {
      // Foreground ownership only transfers between threads that share an
      // input queue, so borrow the current foreground thread's queue.
      const DWORD candidate = GetWindowThreadProcessId(foreground != nullptr ? foreground : window, nullptr);
      inputAttachment.Attach(candidate);
    }
    BringWindowToTop(window);
    SetForegroundWindow(window);
    SetActiveWindow(window);
    token.Wait(50);
  }
  return outcome;
}

}  // namespace

std::vector<HWND> EnumerateTopLevelWindows(DWORD processId) {
  EnumerationContext context;
  context.processId = processId;
  EnumWindows(CollectWindow, reinterpret_cast<LPARAM>(&context));
  return context.windows;
}

std::vector<HWND> FindWindowsWithTitle(const std::wstring& title) {
  std::vector<HWND> matches;
  for (const HWND window : EnumerateTopLevelWindows(0)) {
    if (ReadWindowTitle(window) == title) {
      matches.push_back(window);
    }
  }
  return matches;
}

std::wstring ReadWindowTitle(HWND window) {
  const int length = GetWindowTextLengthW(window);
  if (length <= 0) {
    return {};
  }
  std::wstring title(static_cast<std::size_t>(length) + 1, L'\0');
  const int written = GetWindowTextW(window, title.data(), length + 1);
  title.resize(written < 0 ? 0 : static_cast<std::size_t>(written));
  return title;
}

bool TryReadProcessStartTime(HANDLE process, FILETIME& startTime) {
  FILETIME exitTime{};
  FILETIME kernelTime{};
  FILETIME userTime{};
  return GetProcessTimes(process, &startTime, &exitTime, &kernelTime, &userTime) != FALSE;
}

std::wstring ReadProcessImagePath(HANDLE process) {
  for (DWORD capacity = 1024; capacity <= 32768; capacity *= 2) {
    std::wstring buffer(capacity, L'\0');
    DWORD size = capacity;
    if (QueryFullProcessImageNameW(process, 0, buffer.data(), &size) != FALSE) {
      buffer.resize(size);
      return buffer;
    }
    if (GetLastError() != ERROR_INSUFFICIENT_BUFFER) {
      return {};
    }
  }
  return {};
}

bool TryActivateWindow(HWND window, const CancellationToken& token) {
  return ActivateWindowInternal(window, token).activated;
}

void ActivateWindow(HWND window, const CancellationToken& token) {
  const ActivationOutcome outcome = ActivateWindowInternal(window, token);
  if (outcome.activated) {
    return;
  }
  if (!outcome.sawForeground) {
    Fail(kErrorWindowActivation,
         "The session has no interactive foreground desktop, so the window could not be activated.");
  }
  Fail(kErrorWindowActivation, "The target window did not become the foreground window.");
}

ApplicationManager::~ApplicationManager() {
  try {
    const CancellationToken idle;
    Dispose(idle);
  } catch (const std::exception& error) {
    std::cerr << "furn-desktop-driver-host: application cleanup during shutdown failed: "
              << error.what() << '\n';
  } catch (...) {
    std::cerr << "furn-desktop-driver-host: application cleanup during shutdown failed.\n";
  }
  for (auto& entry : leases_) {
    if (entry.second.process != nullptr) {
      CloseHandle(entry.second.process);
      entry.second.process = nullptr;
    }
  }
  for (PendingCleanupProcess& pending : pendingCleanupProcesses_) {
    if (pending.process != nullptr) {
      CloseHandle(pending.process);
      pending.process = nullptr;
    }
  }
}

void ApplicationManager::TrackPendingCleanupProcess(DWORD processId, HANDLE process) {
  if (process == nullptr) {
    return;
  }
  FILETIME startTime{};
  if (!TryReadProcessStartTime(process, startTime)) {
    CloseHandle(process);
    return;
  }
  try {
    pendingCleanupProcesses_.push_back(PendingCleanupProcess{processId, startTime, process});
  } catch (...) {
    CloseHandle(process);
    throw;
  }
}

std::string ApplicationManager::RegisterWindow(HWND window, DWORD processId, const std::string& leaseId,
                                               bool primary, const std::wstring& title) {
  const WindowFingerprint fingerprint = ReadWindowFingerprint(window);
  const auto existing = windowIdsByHandle_.find(window);
  if (existing != windowIdsByHandle_.end()) {
    const std::string existingId = existing->second;
    const auto found = windowsById_.find(existingId);
    if (found != windowsById_.end()) {
      WindowRecord& record = found->second;
      // A handle can be reused by a later window. The identifier stays with
      // the window it was issued for only while no destroy notification was
      // seen and the creating thread and class still match.
      if (!windowEvents_.IsClosed(existingId) && record.threadId == fingerprint.threadId &&
          record.className == fingerprint.className) {
        record.primary = primary || record.primary;
        record.processId = processId;
        record.leaseId = leaseId;
        record.title = title;
        windowEvents_.Track(window, existingId, processId);
        return existingId;
      }
    }
    RetireWindow(existingId);
  }
  WindowRecord record;
  record.id = NextIdentifier("window");
  record.window = window;
  record.processId = processId;
  record.threadId = fingerprint.threadId;
  record.className = fingerprint.className;
  record.title = title;
  record.leaseId = leaseId;
  record.primary = primary;
  windowIdsByHandle_.emplace(window, record.id);
  const std::string id = record.id;
  windowsById_.emplace(id, std::move(record));
  windowEvents_.Track(window, id, processId);
  return id;
}

bool ApplicationManager::IsWindowClosed(const WindowRecord& record) const {
  return record.window == nullptr || IsWindow(record.window) == FALSE || windowEvents_.IsClosed(record.id);
}

void ApplicationManager::RetireWindow(const std::string& windowId) {
  const auto entry = windowsById_.find(windowId);
  if (entry != windowsById_.end()) {
    const auto byHandle = windowIdsByHandle_.find(entry->second.window);
    if (byHandle != windowIdsByHandle_.end() && byHandle->second == windowId) {
      windowIdsByHandle_.erase(byHandle);
    }
    windowsById_.erase(entry);
  }
  windowEvents_.Forget(windowId);
  if (retiredIds_.insert(windowId).second) {
    retiredOrder_.push_back(windowId);
    while (retiredOrder_.size() > kMaximumRetiredWindowIds) {
      retiredIds_.erase(retiredOrder_.front());
      retiredOrder_.pop_front();
    }
  }
  pendingRetirements_.push_back(windowId);
}

void ApplicationManager::RetireClosedWindows(const std::string& leaseId) {
  std::vector<std::string> closed;
  for (const auto& entry : windowsById_) {
    if (entry.second.leaseId == leaseId && IsWindowClosed(entry.second)) {
      closed.push_back(entry.first);
    }
  }
  for (const std::string& windowId : closed) {
    RetireWindow(windowId);
  }
}

std::vector<std::string> ApplicationManager::TakeRetiredWindowIds() {
  std::vector<std::string> retired;
  retired.swap(pendingRetirements_);
  return retired;
}

void ApplicationManager::SetWindowClosedPublisher(std::function<void(const std::string&)> publisher) {
  windowEvents_.SetClosedPublisher(std::move(publisher));
}

const ApplicationLease& ApplicationManager::AdoptWindowForTesting(HWND window, const std::wstring& title) {
  const DWORD processId = GetCurrentProcessId();
  HANDLE process = OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, processId);
  if (process == nullptr) {
    FailLastError(kErrorAttachFailed, "Opening the self-test process", GetLastError());
  }
  return CreateLease("attached", processId, process, window, title, json::Value::Object());
}

ApplicationLease& ApplicationManager::CreateLease(std::string ownership, DWORD processId, HANDLE process,
                                                  HWND primaryWindow, const std::wstring& title,
                                                  const json::Value& params) {
  ApplicationLease lease;
  lease.id = NextIdentifier("lease");
  lease.ownership = std::move(ownership);
  lease.endpoint = params.StringField("endpoint", "windows");
  lease.storyRootTestId = params.StringField("storyRootTestId");
  lease.processId = processId;
  lease.process = process;
  lease.primaryWindow = primaryWindow;
  lease.windowTitle = title;
  if (process != nullptr) {
    TryReadProcessStartTime(process, lease.startTime);
  }
  const std::string id = lease.id;
  leases_.emplace(id, std::move(lease));
  leaseOrder_.push_back(id);
  ApplicationLease& stored = leases_[id];
  // Observation starts before the first window is registered so a window that
  // closes right after the lease exists is still seen.
  windowEvents_.Observe(processId);
  if (primaryWindow != nullptr) {
    RegisterWindow(primaryWindow, processId, id, true, title);
  }
  return stored;
}

const ApplicationLease& ApplicationManager::Launch(const json::Value& params, const CancellationToken& token) {
  const json::Value* application = params.Find("application");
  if (application == nullptr || !application->IsObject()) {
    Fail(kErrorInvalidParams, "The launch request is missing its application descriptor.");
  }
  const json::Value* timeout = params.Find("launchTimeoutMs");
  const double configuredTimeout = params.NumberField("launchTimeoutMs", kLaunchTimeoutMs);
  if ((timeout != nullptr && !timeout->IsNumber()) || !std::isfinite(configuredTimeout) ||
      configuredTimeout < 1 || configuredTimeout > 2147483647 || std::floor(configuredTimeout) != configuredTimeout) {
    Fail(kErrorInvalidParams, "The registered launch timeout must be a positive bounded integer.");
  }
  const std::wstring aumid = application->WideField("aumid");
  const std::wstring configuredExecutablePath = application->WideField("executablePath");
  const std::wstring windowTitle = application->WideField("windowTitle");
  const std::wstring workingDirectory = application->WideField("workingDirectory");
  if (!workingDirectory.empty() &&
      (!std::filesystem::path(workingDirectory).is_absolute() ||
       !std::filesystem::is_directory(workingDirectory))) {
    Fail(kErrorInvalidParams, "The application workingDirectory must name an existing absolute directory.");
  }
  if (!workingDirectory.empty() && !aumid.empty()) {
    Fail(kErrorInvalidParams, "Packaged activation does not support a workingDirectory override.");
  }
  if (aumid.empty() && configuredExecutablePath.empty()) {
    Fail(kErrorInvalidParams, "The application descriptor needs an \"aumid\" or an \"executablePath\".");
  }
  if (windowTitle.empty()) {
    Fail(kErrorInvalidParams, "The application descriptor needs an exact \"windowTitle\" to identify its window.");
  }

  const std::wstring executablePath =
      aumid.empty() ? CanonicalizeExecutablePath(configuredExecutablePath) : std::wstring();
  std::wstring arguments;
  if (const json::Value* list = application->Find("arguments"); list != nullptr) {
    if (!list->IsArray()) {
      Fail(kErrorInvalidParams, "The application descriptor \"arguments\" field must be an array.");
    }
    for (const json::Value& argument : list->Items()) {
      if (!argument.IsString()) {
        Fail(kErrorInvalidParams, "Every application argument must be a string.");
      }
      if (!arguments.empty()) {
        arguments += L' ';
      }
      arguments += QuoteWindowsCommandLineArgument(argument.AsWide());
    }
  }

  const std::vector<HWND> preexisting = FindWindowsWithTitle(windowTitle);
  FILETIME launchStartedAt{};
  GetSystemTimeAsFileTime(&launchStartedAt);
  LaunchProcessGuard launchProcesses;
  LaunchRootIdentity launchRoot;
  try {
    if (!aumid.empty()) {
      winrt::com_ptr<IApplicationActivationManager> manager;
      CheckHresult(kErrorLaunchFailed, "Creating the application activation manager",
                   CoCreateInstance(CLSID_ApplicationActivationManager, nullptr, CLSCTX_LOCAL_SERVER,
                                    IID_PPV_ARGS(manager.put())));
      CoAllowSetForegroundWindow(manager.get(), nullptr);
      CheckHresult(kErrorLaunchFailed, "Activating the packaged application",
                   manager->ActivateApplication(aumid.c_str(), arguments.empty() ? nullptr : arguments.c_str(),
                                                AO_NONE, &launchRoot.processId));
      launchRoot.process.attach(
          OpenProcess(kOwnedProcessAccess, FALSE, launchRoot.processId));
      if (!launchRoot.process) {
        FailLastError(kErrorLaunchFailed, "Opening the activated application process",
                      GetLastError());
      }
      if (!TryReadProcessStartTime(launchRoot.process.get(), launchRoot.startTime)) {
        Fail(kErrorLaunchFailed,
             "The activated application process identity could not be read.");
      }
      if (!ProcessStartedForLaunch(launchRoot.process.get(), launchStartedAt)) {
        Fail(kErrorLaunchFailed,
             "Packaged activation reused a pre-existing process. Use attach mode instead.");
      }
      launchRoot.trusted = true;
      winrt::handle cleanupProcess = DuplicateProcessHandle(launchRoot.process.get());
      if (!cleanupProcess) {
        const DWORD error = GetLastError();
        launchRoot.trusted = false;
        launchProcesses.Track(launchRoot.processId, std::move(launchRoot.process));
        FailLastError(kErrorLaunchFailed,
                      "Duplicating the activated process handle for owned cleanup",
                      error);
      }
      launchProcesses.Track(launchRoot.processId, std::move(cleanupProcess));
    } else {
      std::wstring commandLine = QuoteWindowsCommandLineArgument(executablePath);
      if (!arguments.empty()) {
        commandLine += L' ' + arguments;
      }
      STARTUPINFOW startup{};
      startup.cb = sizeof(startup);
      PROCESS_INFORMATION information{};
      if (CreateProcessW(executablePath.c_str(), commandLine.data(), nullptr, nullptr, FALSE, 0, nullptr,
                         workingDirectory.empty() ? nullptr : workingDirectory.c_str(),
                         &startup, &information) == FALSE) {
        FailLastError(kErrorLaunchFailed, "Starting the unpackaged application", GetLastError());
      }
      CloseHandle(information.hThread);
      winrt::handle created;
      created.attach(information.hProcess);
      launchRoot.processId = information.dwProcessId;
      launchRoot.process = DuplicateProcessHandle(created.get());
      const DWORD duplicateError = launchRoot.process ? ERROR_SUCCESS : GetLastError();
      launchProcesses.Track(launchRoot.processId, std::move(created));
      if (!launchRoot.process) {
        FailLastError(kErrorLaunchFailed,
                      "Duplicating the created process handle for identity tracking",
                      duplicateError);
      }
      if (!TryReadProcessStartTime(launchRoot.process.get(), launchRoot.startTime)) {
        Fail(kErrorLaunchFailed,
             "The created application process identity could not be read.");
      }
      launchRoot.trusted = true;
    }

    // Packaged activation can report a short-lived broker. Only a new,
    // identity-matched process with a non-preexisting window can become owned.
    const Deadline deadline(static_cast<unsigned int>(configuredTimeout));
    std::optional<Deadline> graceDeadline;
    HWND matched = nullptr;
    DWORD matchedProcessId = 0;
    while (matched == nullptr) {
      token.ThrowIfCancelled();
      std::vector<std::pair<HWND, DWORD>> candidates;
      const std::unordered_map<DWORD, DWORD> parents = CaptureParentProcessIds();
      for (const HWND window : FindWindowsWithTitle(windowTitle)) {
        if (std::find(preexisting.begin(), preexisting.end(), window) != preexisting.end()) {
          continue;
        }
        DWORD owner = 0;
        GetWindowThreadProcessId(window, &owner);
        winrt::handle candidate{OpenProcess(kOwnedProcessAccess, FALSE, owner)};
        FILETIME candidateStartTime{};
        if (!candidate ||
            !TryReadProcessStartTime(candidate.get(), candidateStartTime) ||
            !ProcessStartedForLaunch(candidate.get(), launchStartedAt) ||
            !IsCausallyRelatedProcess(owner, candidateStartTime, launchRoot, parents) ||
            !ProcessMatchesLaunchIdentity(candidate.get(), aumid, executablePath)) {
          continue;
        }
        DWORD revalidatedOwner = 0;
        GetWindowThreadProcessId(window, &revalidatedOwner);
        if (revalidatedOwner != owner || ReadWindowTitle(window) != windowTitle) {
          continue;
        }
        launchProcesses.Track(owner, std::move(candidate));
        candidates.emplace_back(window, owner);
      }
      if (candidates.size() > 1) {
        Fail(kErrorAmbiguousTarget,
             "The launch created multiple matching windows titled \"" + ToUtf8(windowTitle) + "\".");
      }
      if (candidates.size() == 1) {
        matched = candidates.front().first;
        matchedProcessId = candidates.front().second;
        break;
      }
      const HANDLE activatedProcess = launchProcesses.Find(launchRoot.processId);
      if (activatedProcess != nullptr && !IsProcessAlive(activatedProcess)) {
        if (!graceDeadline) {
          graceDeadline.emplace(kLaunchGraceMs);
        } else if (graceDeadline->Expired()) {
          Fail(kErrorLaunchFailed, "The launched application exited before it showed its window.");
        }
      }
      if (deadline.Expired()) {
        Fail(kErrorLaunchFailed,
             "The launched application did not present a new identity-matched window titled \"" +
                 ToUtf8(windowTitle) + "\".");
      }
      token.Wait(100);
    }

    winrt::handle owned = launchProcesses.Take(matchedProcessId);
    if (!owned || !IsProcessAlive(owned.get())) {
      Fail(kErrorLaunchFailed, "The launched application process exited before its lease was created.");
    }
    const std::string extraCleanupFailure = launchProcesses.Cleanup();
    if (!extraCleanupFailure.empty()) {
      launchProcesses.Track(matchedProcessId, std::move(owned));
      Fail(kErrorCleanupFailed, "A secondary launch process could not be cleaned up: " + extraCleanupFailure);
    }
    return CreateLease("launched", matchedProcessId, owned.detach(), matched, windowTitle, params);
  } catch (...) {
    const std::exception_ptr original = std::current_exception();
    TrackRelatedLaunchProcesses(launchRoot, aumid, executablePath, launchStartedAt,
                                launchProcesses);
    const std::string cleanupFailure = launchProcesses.Cleanup();
    for (TrackedLaunchProcess& tracked : launchProcesses.ReleaseRemaining()) {
      TrackPendingCleanupProcess(tracked.processId, tracked.process.detach());
    }
    RethrowWithCleanup(original, cleanupFailure);
  }
}

const ApplicationLease& ApplicationManager::Attach(const json::Value& params, const CancellationToken& token) {
  const json::Value* application = params.Find("application");
  if (application == nullptr || !application->IsObject()) {
    Fail(kErrorInvalidParams, "The attach request is missing its application descriptor.");
  }
  const std::string endpoint = params.StringField("endpoint", "windows");
  const std::wstring leasePath = application->WideField("leasePath");
  std::wstring windowTitle = application->WideField("windowTitle");

  if (!leasePath.empty()) {
    const std::string contents = ReadFileWithRetry(leasePath, token);
    if (TrimAscii(contents).empty()) {
      Fail(kErrorLeaseInvalid, "The application lease file is empty.");
    }
    const json::Value lease = json::Value::Parse(contents);
    if (!lease.IsObject() || lease.NumberField("schemaVersion", 0) != 1) {
      Fail(kErrorLeaseInvalid, "The application lease does not use schema version 1.");
    }
    const std::string expectedNonce = application->StringField("leaseNonce");
    if (expectedNonce.empty()) {
      Fail(kErrorLeaseInvalid, "The application descriptor does not carry the expected lease nonce.");
    }
    if (lease.StringField("nonce") != expectedNonce) {
      Fail(kErrorLeaseInvalid, "The application lease nonce does not match this session.");
    }
    if (lease.StringField("endpoint") != endpoint) {
      Fail(kErrorLeaseInvalid, "The application lease was written for a different endpoint.");
    }
    const DWORD processId = static_cast<DWORD>(lease.NumberField("processId", 0));
    if (processId == 0) {
      Fail(kErrorLeaseInvalid, "The application lease does not name a process.");
    }
    winrt::handle process = OpenProcessForIdentity(processId, kErrorLeaseInvalid);
    if (!IsProcessAlive(process.get())) {
      Fail(kErrorLeaseInvalid, "The leased application process is no longer running.");
    }
    FILETIME actualStart{};
    if (!TryReadProcessStartTime(process.get(), actualStart)) {
      Fail(kErrorLeaseInvalid, "The leased application process identity could not be read.");
    }
    FILETIME expectedStart{};
    if (!TryParseIso8601(lease.StringField("processStartedAt"), expectedStart)) {
      Fail(kErrorLeaseInvalid, "The application lease does not carry a valid process start time.");
    }
    const std::uint64_t actualTicks = FileTimeTicks(actualStart);
    const std::uint64_t expectedTicks = FileTimeTicks(expectedStart);
    const std::uint64_t difference = actualTicks > expectedTicks ? actualTicks - expectedTicks
                                                                 : expectedTicks - actualTicks;
    if (difference > kStartTimeToleranceTicks) {
      Fail(kErrorLeaseInvalid, "The leased process identifier was reused by a different process.");
    }
    const std::wstring leaseImage = lease.WideField("executablePath");
    if (!leaseImage.empty()) {
      const std::wstring actualImage = ReadProcessImagePath(process.get());
      if (!actualImage.empty() && _wcsicmp(actualImage.c_str(), leaseImage.c_str()) != 0) {
        Fail(kErrorLeaseInvalid, "The leased process does not run the expected executable.");
      }
    }
    const std::wstring leaseTitle = lease.WideField("windowTitle");
    if (!leaseTitle.empty()) {
      if (!windowTitle.empty() && windowTitle != leaseTitle) {
        Fail(kErrorLeaseInvalid, "The application lease names a different window title than the target.");
      }
      windowTitle = leaseTitle;
    }
    if (windowTitle.empty()) {
      Fail(kErrorLeaseInvalid, "The application lease does not name the application window.");
    }

    std::vector<HWND> matches;
    for (const HWND window : EnumerateTopLevelWindows(processId)) {
      if (ReadWindowTitle(window) == windowTitle) {
        matches.push_back(window);
      }
    }
    if (matches.empty()) {
      Fail(kErrorAttachFailed,
           "The leased application does not currently show a window titled \"" + ToUtf8(windowTitle) + "\".");
    }
    if (matches.size() > 1) {
      Fail(kErrorAmbiguousTarget,
           "The leased application shows " + std::to_string(matches.size()) + " windows titled \"" +
               ToUtf8(windowTitle) + "\".");
    }
    return CreateLease("attached", processId, process.detach(), matches.front(), windowTitle, params);
  }

  if (windowTitle.empty()) {
    Fail(kErrorInvalidParams,
         "Attaching without a lease requires an exact \"windowTitle\" in the application descriptor.");
  }
  const std::wstring aumid = application->WideField("aumid");
  const std::wstring configuredExecutablePath = application->WideField("executablePath");
  if (aumid.empty() && configuredExecutablePath.empty()) {
    Fail(kErrorInvalidParams, "Attaching without a lease requires an executablePath or aumid, not a window title alone.");
  }
  const std::wstring executablePath =
      aumid.empty() ? CanonicalizeExecutablePath(configuredExecutablePath) : std::wstring();
  std::vector<HWND> matches;
  winrt::handle matchedProcess;
  DWORD matchedProcessId = 0;
  for (const HWND window : FindWindowsWithTitle(windowTitle)) {
    token.ThrowIfCancelled();
    DWORD candidateId = 0;
    GetWindowThreadProcessId(window, &candidateId);
    winrt::handle candidate(OpenProcess(PROCESS_QUERY_LIMITED_INFORMATION | SYNCHRONIZE, FALSE, candidateId));
    if (candidate && IsProcessAlive(candidate.get()) &&
        ProcessMatchesLaunchIdentity(candidate.get(), aumid, executablePath)) {
      if (matches.empty()) {
        matchedProcessId = candidateId;
        matchedProcess = std::move(candidate);
      }
      matches.push_back(window);
    }
  }
  if (matches.empty()) {
    Fail(kErrorAttachFailed, "No window titled \"" + ToUtf8(windowTitle) + "\" is currently open.");
  }
  if (matches.size() > 1) {
    Fail(kErrorAmbiguousTarget,
         std::to_string(matches.size()) + " windows are titled \"" + ToUtf8(windowTitle) +
             "\", so the target is ambiguous.");
  }
  DWORD processId = 0;
  GetWindowThreadProcessId(matches.front(), &processId);
  if (processId != matchedProcessId || !IsProcessAlive(matchedProcess.get()) ||
      !ProcessMatchesLaunchIdentity(matchedProcess.get(), aumid, executablePath)) {
    Fail(kErrorAttachFailed, "The application identity changed while attaching.");
  }
  return CreateLease("attached", processId, matchedProcess.detach(), matches.front(), windowTitle, params);
}

std::vector<WindowInfo> ApplicationManager::Windows(const std::string& leaseId, const CancellationToken& token) {
  const auto entry = leases_.find(leaseId);
  if (entry == leases_.end()) {
    Fail(kErrorNoSuchLease, "The requested application lease is not held by this helper.");
  }
  ApplicationLease& lease = entry->second;
  token.ThrowIfCancelled();
  if (!IsProcessAlive(lease.process)) {
    Fail(kErrorNoSuchLease, "The leased application process has exited.");
  }

  std::vector<WindowInfo> results;
  // Closed windows leave the table before the live ones register, so a handle
  // reused by a later window can never keep its predecessor's identifier.
  RetireClosedWindows(leaseId);
  for (const HWND window : EnumerateTopLevelWindows(lease.processId)) {
    WindowInfo info;
    info.window = window;
    info.processId = lease.processId;
    info.title = ReadWindowTitle(window);
    info.primary = window == lease.primaryWindow || (lease.primaryWindow == nullptr && info.title == lease.windowTitle);
    info.id = RegisterWindow(window, lease.processId, leaseId, info.primary, info.title);
    results.push_back(std::move(info));
  }
  if (lease.primaryWindow != nullptr && IsWindow(lease.primaryWindow) == FALSE) {
    lease.primaryWindow = nullptr;
  }
  std::stable_sort(results.begin(), results.end(),
                   [](const WindowInfo& left, const WindowInfo& right) { return left.primary && !right.primary; });
  if (lease.primaryWindow == nullptr && !results.empty()) {
    lease.primaryWindow = results.front().window;
    windowsById_[results.front().id].primary = true;
  }
  return results;
}

void ApplicationManager::CloseApplication(const std::string& leaseId, const CancellationToken& token) {
  const auto entry = leases_.find(leaseId);
  if (entry == leases_.end()) {
    // Closing an unknown lease is a no-op so teardown stays idempotent.
    return;
  }
  ApplicationLease& lease = entry->second;
  const DWORD leasedProcessId = lease.processId;

  // The lease and its window records stay intact until the close sequence
  // finishes, so a cancelled teardown remains retryable instead of orphaning an
  // owned process together with its only handle.
  if (lease.ownership == "launched" && lease.process != nullptr &&
      IsProcessAlive(lease.process)) {
    PostCloseToExactProcessWindows(lease.processId, lease.startTime);
    const Deadline deadline(kCloseTimeoutMs);
    while (IsProcessAlive(lease.process) && !deadline.Expired()) {
      token.Wait(50);
    }
    if (IsProcessAlive(lease.process)) {
      if (TerminateProcess(lease.process, 0) == FALSE && IsProcessAlive(lease.process)) {
        FailLastError(kErrorCleanupFailed, "Terminating the owned application process", GetLastError());
      }
      const DWORD waited = WaitForSingleObject(lease.process, 2000);
      if (waited == WAIT_FAILED && IsProcessAlive(lease.process)) {
        FailLastError(kErrorCleanupFailed, "Waiting for the owned application process", GetLastError());
      }
      if (waited != WAIT_OBJECT_0 && IsProcessAlive(lease.process)) {
        Fail(kErrorCleanupFailed, "The owned application process did not exit after forced termination.");
      }
    }
  }

  // A mutation abandoned against an application this helper launched can no
  // longer land once that process is verified gone, so closing it ends the
  // quarantine. An attached application keeps running and keeps its quarantine.
  const bool ownedProcessGone =
      lease.ownership == "launched" && lease.process != nullptr && !IsProcessAlive(lease.process);
  if (lease.process != nullptr) {
    CloseHandle(lease.process);
    lease.process = nullptr;
  }
  for (auto iterator = windowsById_.begin(); iterator != windowsById_.end();) {
    if (iterator->second.leaseId == leaseId) {
      windowEvents_.Forget(iterator->first);
      windowIdsByHandle_.erase(iterator->second.window);
      iterator = windowsById_.erase(iterator);
      continue;
    }
    ++iterator;
  }
  leases_.erase(leaseId);
  leaseOrder_.erase(std::remove(leaseOrder_.begin(), leaseOrder_.end(), leaseId), leaseOrder_.end());
  // Several leases can observe the same process; events stop with the last one.
  const bool processStillLeased =
      std::any_of(leases_.begin(), leases_.end(), [leasedProcessId](const auto& other) {
        return other.second.processId == leasedProcessId;
      });
  if (!processStillLeased) {
    windowEvents_.Stop(leasedProcessId);
  }
  if (ownedProcessGone) {
    ReleaseMutationQuarantine(leaseId);
  }
}

void ApplicationManager::Dispose(const CancellationToken& token) {
  const std::vector<std::string> leaseIds = leaseOrder_;
  std::string failures;
  std::vector<HANDLE> ownedProcesses;
  for (PendingCleanupProcess& pending : pendingCleanupProcesses_) {
    if (IsProcessAlive(pending.process)) {
      PostCloseToExactProcessWindows(pending.processId, pending.startTime);
      ownedProcesses.push_back(pending.process);
    }
  }
  for (const std::string& leaseId : leaseIds) {
    const auto entry = leases_.find(leaseId);
    if (entry == leases_.end()) {
      continue;
    }
    ApplicationLease& lease = entry->second;
    if (lease.ownership == "launched" && IsProcessAlive(lease.process)) {
      PostCloseToExactProcessWindows(lease.processId, lease.startTime);
      ownedProcesses.push_back(lease.process);
    }
  }

  const auto waitForOwnedProcesses = [&](unsigned int timeoutMs) {
    const Deadline deadline(timeoutMs);
    while (!deadline.Expired()) {
      token.ThrowIfCancelled();
      if (std::none_of(ownedProcesses.begin(), ownedProcesses.end(), IsProcessAlive)) {
        return;
      }
      token.Wait(50);
    }
  };

  waitForOwnedProcesses(kDisposeGraceMs);
  std::unordered_map<HANDLE, DWORD> terminationErrors;
  for (const HANDLE process : ownedProcesses) {
    if (!IsProcessAlive(process)) {
      continue;
    }
    if (TerminateProcess(process, 0) == FALSE && IsProcessAlive(process)) {
      terminationErrors.emplace(process, GetLastError());
    }
  }
  waitForOwnedProcesses(kDisposeForcedMs);

  for (auto iterator = pendingCleanupProcesses_.begin();
       iterator != pendingCleanupProcesses_.end();) {
    if (IsProcessAlive(iterator->process)) {
      if (!failures.empty()) {
        failures += "; ";
      }
      const auto terminationError = terminationErrors.find(iterator->process);
      failures += terminationError == terminationErrors.end()
                      ? "Pending owned process " + std::to_string(iterator->processId) +
                            " did not exit during disposal."
                      : "Terminating pending owned process " +
                            std::to_string(iterator->processId) + " failed: " +
                            DescribeHresult(HRESULT_FROM_WIN32(terminationError->second));
      ++iterator;
      continue;
    }
    CloseHandle(iterator->process);
    iterator = pendingCleanupProcesses_.erase(iterator);
  }
  for (const std::string& leaseId : leaseIds) {
    const auto entry = leases_.find(leaseId);
    if (entry == leases_.end()) {
      continue;
    }
    ApplicationLease& lease = entry->second;
    if (lease.ownership == "launched" && IsProcessAlive(lease.process)) {
      if (!failures.empty()) {
        failures += "; ";
      }
      const auto terminationError = terminationErrors.find(lease.process);
      failures += terminationError == terminationErrors.end()
                      ? "Owned application process " + std::to_string(lease.processId) +
                            " did not exit during disposal."
                      : "Terminating owned application process " +
                            std::to_string(lease.processId) + " failed: " +
                            DescribeHresult(HRESULT_FROM_WIN32(terminationError->second));
      continue;
    }
    CloseApplication(leaseId, token);
  }
  if (!failures.empty()) {
    Fail(kErrorCleanupFailed, "Disposing native application leases failed: " + failures);
  }
}

WindowInfo ApplicationManager::RequireWindow(const std::string& windowId) {
  const auto entry = windowsById_.find(windowId);
  if (entry == windowsById_.end()) {
    if (retiredIds_.count(windowId) > 0) {
      Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" has been closed.");
    }
    Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" is not tracked by this helper.");
  }
  const WindowRecord record = entry->second;
  if (IsWindowClosed(record)) {
    RetireWindow(windowId);
    Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" has been closed.");
  }
  DWORD processId = 0;
  const DWORD threadId = GetWindowThreadProcessId(record.window, &processId);
  if (record.processId != 0 && processId != record.processId) {
    RetireWindow(windowId);
    Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" now belongs to a different process.");
  }
  if (threadId != record.threadId || ReadWindowFingerprint(record.window).className != record.className) {
    RetireWindow(windowId);
    Fail(kErrorNoSuchWindow,
         "Window \"" + windowId + "\" has been replaced by a different window that reused its handle.");
  }
  WindowInfo info;
  info.id = record.id;
  info.window = record.window;
  info.processId = record.processId;
  info.primary = record.primary;
  info.title = ReadWindowTitle(record.window);
  return info;
}

const ApplicationLease* ApplicationManager::FindLease(const std::string& leaseId) const {
  const auto entry = leases_.find(leaseId);
  return entry == leases_.end() ? nullptr : &entry->second;
}

const ApplicationLease* ApplicationManager::LeaseForWindow(HWND window) const {
  const auto id = windowIdsByHandle_.find(window);
  if (id == windowIdsByHandle_.end()) {
    return nullptr;
  }
  const auto record = windowsById_.find(id->second);
  if (record == windowsById_.end()) {
    return nullptr;
  }
  return FindLease(record->second.leaseId);
}

const ApplicationLease* ApplicationManager::PrimaryLease() const {
  for (const std::string& id : leaseOrder_) {
    const auto entry = leases_.find(id);
    if (entry != leases_.end()) {
      return &entry->second;
    }
  }
  return nullptr;
}

bool ApplicationManager::ForegroundBelongsToLease(const ApplicationLease& lease, HWND foreground) const {
  DWORD foregroundProcess = 0;
  GetWindowThreadProcessId(foreground, &foregroundProcess);
  if (foregroundProcess != 0 && foregroundProcess == lease.processId) {
    return true;
  }
  for (const auto& entry : windowsById_) {
    const WindowRecord& record = entry.second;
    if (record.leaseId != lease.id) {
      continue;
    }
    if ((foregroundProcess != 0 && foregroundProcess == record.processId) ||
        IsInActivationContext(record.window, foreground)) {
      return true;
    }
  }
  return false;
}

bool ApplicationManager::ForegroundBelongsToApplication(HWND window, HWND foreground) const {
  if (foreground == nullptr) {
    return false;
  }
  if (window == nullptr) {
    for (const auto& entry : leases_) {
      if (ForegroundBelongsToLease(entry.second, foreground)) {
        return true;
      }
    }
    return false;
  }
  if (IsInActivationContext(window, foreground)) {
    return true;
  }
  // A framework host can parent the tracked window below the foreground frame.
  if (GetAncestor(window, GA_ROOT) == foreground) {
    return true;
  }
  if (const ApplicationLease* lease = LeaseForWindow(window); lease != nullptr) {
    return ForegroundBelongsToLease(*lease, foreground);
  }
  DWORD windowProcess = 0;
  DWORD foregroundProcess = 0;
  GetWindowThreadProcessId(window, &windowProcess);
  GetWindowThreadProcessId(foreground, &foregroundProcess);
  return windowProcess != 0 && windowProcess == foregroundProcess;
}

void ApplicationManager::RequireForegroundOwnedBy(HWND window, HWND foreground) const {
  if (foreground == nullptr) {
    Fail(kErrorWindowActivation,
         "No window holds the foreground, so keyboard input was not sent to avoid typing into the wrong place.");
  }
  if (ForegroundBelongsToApplication(window, foreground)) {
    return;
  }
  DWORD foregroundProcess = 0;
  GetWindowThreadProcessId(foreground, &foregroundProcess);
  Fail(kErrorWindowActivation,
       "The foreground window " + DescribeWindowHandle(foreground) + " of process " + std::to_string(foregroundProcess) +
           (window == nullptr ? " does not belong to an application this helper launched or attached to"
                              : " does not belong to the target application") +
           ", so keyboard input was not sent to avoid typing into it. Activate the application window first.");
}

std::vector<std::string> ApplicationManager::WindowIdsForLease(const std::string& leaseId) const {
  std::vector<std::string> ids;
  for (const auto& entry : windowsById_) {
    if (entry.second.leaseId == leaseId) {
      ids.push_back(entry.first);
    }
  }
  return ids;
}

void ApplicationManager::ForgetWindow(const std::string& windowId) {
  windowEvents_.Forget(windowId);
  const auto entry = windowsById_.find(windowId);
  if (entry == windowsById_.end()) {
    return;
  }
  windowIdsByHandle_.erase(entry->second.window);
  windowsById_.erase(entry);
}

json::Value ApplicationManager::PublicationDiagnostic(const ApplicationLease& lease) const {
  constexpr std::size_t kMaximumPublishedWindows = 32;
  const std::vector<HWND> all = EnumerateAllTopLevelWindows(lease.processId);
  const std::vector<HWND> listed = EnumerateTopLevelWindows(lease.processId);
  json::Value windows = json::Value::Array();
  for (std::size_t index = 0; index < all.size() && index < kMaximumPublishedWindows; index += 1) {
    const HWND window = all[index];
    const WindowDescriptor descriptor = DescribeWindow(window);
    json::Value entry = json::Value::Object();
    entry.Set("className", json::Value::String(descriptor.className));
    entry.Set("listed", json::Value::Bool(std::find(listed.begin(), listed.end(), window) != listed.end()));
    entry.Set("owned", json::Value::Bool(descriptor.owned));
    if (descriptor.hasTitle) {
      entry.Set("title", json::Value::String(descriptor.title));
    }
    entry.Set("tracked", json::Value::Bool(windowIdsByHandle_.count(window) > 0));
    entry.Set("visible", json::Value::Bool(descriptor.visible));
    windows.Append(std::move(entry));
  }
  json::Value publication = json::Value::Object();
  publication.Set("processId", json::Value::Integer(static_cast<std::int64_t>(lease.processId)));
  publication.Set("reason", json::Value::String(std::string("observation")));
  publication.Set("windowCount", json::Value::Integer(static_cast<std::int64_t>(all.size())));
  publication.Set("windows", std::move(windows));
  publication.Set("windowsTruncated", json::Value::Bool(all.size() > kMaximumPublishedWindows));
  return publication;
}

json::Value ApplicationManager::WindowEventLog(const std::string& leaseId) {
  const auto entry = leases_.find(leaseId);
  if (entry == leases_.end()) {
    Fail(kErrorNoSuchLease, "The requested application lease is not held by this helper.");
  }
  const ApplicationLease& lease = entry->second;
  json::Value log = windowEvents_.Diagnostic(lease.processId, WindowEventMonitor::kMaximumEvents);
  log.Set("publication", PublicationDiagnostic(lease));

  std::vector<const WindowRecord*> tracked;
  for (const auto& record : windowsById_) {
    if (record.second.leaseId == leaseId) {
      tracked.push_back(&record.second);
    }
  }
  std::sort(tracked.begin(), tracked.end(),
            [](const WindowRecord* left, const WindowRecord* right) { return left->id < right->id; });
  json::Value windows = json::Value::Array();
  for (const WindowRecord* record : tracked) {
    json::Value window = json::Value::Object();
    window.Set("closed", json::Value::Bool(IsWindowClosed(*record)));
    window.Set("element", json::Value::String(DescribeWindowHandle(record->window)));
    window.Set("id", json::Value::String(record->id));
    window.Set("primary", json::Value::Bool(record->primary));
    window.Set("title", json::Value::String(BoundedText(ToUtf8(record->title), 512)));
    windows.Append(std::move(window));
  }
  log.Set("trackedWindows", std::move(windows));
  return log;
}

json::Value ApplicationManager::SerializeLease(const ApplicationLease& lease) const {
  json::Value value = json::Value::Object();
  value.Set("id", json::Value::String(lease.id));
  value.Set("ownership", json::Value::String(lease.ownership));
  value.Set("processId", json::Value::Integer(static_cast<std::int64_t>(lease.processId)));
  const std::string started = FormatFileTimeIso8601(lease.startTime);
  if (!started.empty()) {
    value.Set("processStartedAt", json::Value::String(started));
  }
  return value;
}

}  // namespace furn
