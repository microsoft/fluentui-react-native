#include "application.h"

#include <shobjidl_core.h>

#include <algorithm>
#include <optional>

#include <winrt/base.h>

#include "geometry.h"

namespace furn {
namespace {

constexpr unsigned int kLaunchTimeoutMs = 90000;
constexpr unsigned int kLaunchGraceMs = 15000;
constexpr unsigned int kCloseTimeoutMs = 5000;
constexpr unsigned int kActivationTimeoutMs = 2000;
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
    if (foreground == window || (foreground != nullptr && GetAncestor(foreground, GA_ROOT) == window)) {
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
  std::wstring buffer(1024, L'\0');
  DWORD size = static_cast<DWORD>(buffer.size());
  if (QueryFullProcessImageNameW(process, 0, buffer.data(), &size) == FALSE) {
    return {};
  }
  buffer.resize(size);
  return buffer;
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
  for (auto& entry : leases_) {
    if (entry.second.process != nullptr) {
      CloseHandle(entry.second.process);
      entry.second.process = nullptr;
    }
  }
}

std::string ApplicationManager::RegisterWindow(HWND window, DWORD processId, const std::string& leaseId,
                                               bool primary) {
  const auto existing = windowIdsByHandle_.find(window);
  if (existing != windowIdsByHandle_.end()) {
    WindowRecord& record = windowsById_[existing->second];
    record.primary = primary || record.primary;
    record.processId = processId;
    record.leaseId = leaseId;
    return existing->second;
  }
  WindowRecord record;
  record.id = NextIdentifier("window");
  record.window = window;
  record.processId = processId;
  record.leaseId = leaseId;
  record.primary = primary;
  windowIdsByHandle_.emplace(window, record.id);
  const std::string id = record.id;
  windowsById_.emplace(id, std::move(record));
  return id;
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
  if (primaryWindow != nullptr) {
    RegisterWindow(primaryWindow, processId, id, true);
  }
  return stored;
}

const ApplicationLease& ApplicationManager::Launch(const json::Value& params, const CancellationToken& token) {
  const json::Value* application = params.Find("application");
  if (application == nullptr || !application->IsObject()) {
    Fail(kErrorInvalidParams, "The launch request is missing its application descriptor.");
  }
  const std::wstring aumid = application->WideField("aumid");
  const std::wstring executablePath = application->WideField("executablePath");
  const std::wstring windowTitle = application->WideField("windowTitle");
  if (aumid.empty() && executablePath.empty()) {
    Fail(kErrorInvalidParams, "The application descriptor needs an \"aumid\" or an \"executablePath\".");
  }
  if (windowTitle.empty()) {
    Fail(kErrorInvalidParams, "The application descriptor needs an exact \"windowTitle\" to identify its window.");
  }

  std::wstring arguments;
  if (const json::Value* list = application->Find("arguments"); list != nullptr && list->IsArray()) {
    for (const json::Value& argument : list->Items()) {
      if (!argument.IsString()) {
        continue;
      }
      if (!arguments.empty()) {
        arguments += L' ';
      }
      arguments += L'"' + argument.AsWide() + L'"';
    }
  }

  DWORD processId = 0;
  winrt::handle owned;
  const std::vector<HWND> preexisting = FindWindowsWithTitle(windowTitle);
  if (!aumid.empty()) {
    winrt::com_ptr<IApplicationActivationManager> manager;
    CheckHresult(kErrorLaunchFailed, "Creating the application activation manager",
                 CoCreateInstance(CLSID_ApplicationActivationManager, nullptr, CLSCTX_LOCAL_SERVER,
                                  IID_PPV_ARGS(manager.put())));
    CoAllowSetForegroundWindow(manager.get(), nullptr);
    CheckHresult(kErrorLaunchFailed, "Activating the packaged application",
                 manager->ActivateApplication(aumid.c_str(), arguments.empty() ? nullptr : arguments.c_str(), AO_NONE,
                                              &processId));
    owned.attach(OpenProcess(kOwnedProcessAccess, FALSE, processId));
  } else {
    std::wstring commandLine = L'"' + executablePath + L'"';
    if (!arguments.empty()) {
      commandLine += L' ' + arguments;
    }
    STARTUPINFOW startup{};
    startup.cb = sizeof(startup);
    PROCESS_INFORMATION information{};
    if (CreateProcessW(executablePath.c_str(), commandLine.data(), nullptr, nullptr, FALSE, 0, nullptr, nullptr,
                       &startup, &information) == FALSE) {
      FailLastError(kErrorLaunchFailed, "Starting the unpackaged application", GetLastError());
    }
    CloseHandle(information.hThread);
    owned.attach(information.hProcess);
    processId = information.dwProcessId;
  }

  // Packaged activation can report a broker process that exits immediately, so
  // ownership follows the exact window this launch created rather than the
  // reported identifier alone. Windows that already existed are never adopted.
  const Deadline deadline(kLaunchTimeoutMs);
  std::optional<Deadline> graceDeadline;
  HWND matched = nullptr;
  DWORD matchedProcessId = 0;
  while (matched == nullptr) {
    token.ThrowIfCancelled();
    HWND candidate = nullptr;
    DWORD candidateProcessId = 0;
    for (const HWND window : FindWindowsWithTitle(windowTitle)) {
      DWORD owner = 0;
      GetWindowThreadProcessId(window, &owner);
      if (processId != 0 && owner == processId) {
        candidate = window;
        candidateProcessId = owner;
        break;
      }
      if (std::find(preexisting.begin(), preexisting.end(), window) == preexisting.end() && candidate == nullptr) {
        candidate = window;
        candidateProcessId = owner;
      }
    }
    if (candidate != nullptr) {
      matched = candidate;
      matchedProcessId = candidateProcessId;
      break;
    }
    if (owned && !IsProcessAlive(owned.get())) {
      if (!graceDeadline) {
        graceDeadline.emplace(kLaunchGraceMs);
      } else if (graceDeadline->Expired()) {
        Fail(kErrorLaunchFailed, "The launched application exited before it showed its window.");
      }
    }
    if (deadline.Expired()) {
      Fail(kErrorLaunchFailed,
           "The launched application did not present a window titled \"" + ToUtf8(windowTitle) + "\".");
    }
    token.Wait(100);
  }

  if (matchedProcessId != processId || !IsProcessAlive(owned.get())) {
    winrt::handle adopted{OpenProcess(kOwnedProcessAccess, FALSE, matchedProcessId)};
    if (!adopted) {
      FailLastError(kErrorLaunchFailed, "Opening the launched application process", GetLastError());
    }
    owned = std::move(adopted);
    processId = matchedProcessId;
  }

  return CreateLease("launched", processId, owned.detach(), matched, windowTitle, params);
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
  std::vector<HWND> matches;
  for (const HWND window : FindWindowsWithTitle(windowTitle)) {
    token.ThrowIfCancelled();
    matches.push_back(window);
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
  winrt::handle process = OpenProcessForIdentity(processId, kErrorAttachFailed);
  return CreateLease("attached", processId, process.detach(), matches.front(), windowTitle, params);
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
  for (const HWND window : EnumerateTopLevelWindows(lease.processId)) {
    WindowInfo info;
    info.window = window;
    info.processId = lease.processId;
    info.title = ReadWindowTitle(window);
    info.primary = window == lease.primaryWindow || (lease.primaryWindow == nullptr && info.title == lease.windowTitle);
    info.id = RegisterWindow(window, lease.processId, leaseId, info.primary);
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

  // The lease and its window records stay intact until the close sequence
  // finishes, so a cancelled teardown remains retryable instead of orphaning an
  // owned process together with its only handle.
  if (lease.ownership == "launched" && lease.process != nullptr) {
    for (const HWND window : EnumerateTopLevelWindows(lease.processId)) {
      PostMessageW(window, WM_CLOSE, 0, 0);
    }
    const Deadline deadline(kCloseTimeoutMs);
    while (IsProcessAlive(lease.process) && !deadline.Expired()) {
      token.Wait(50);
    }
    if (IsProcessAlive(lease.process)) {
      TerminateProcess(lease.process, 0);
      WaitForSingleObject(lease.process, 2000);
    }
  }

  if (lease.process != nullptr) {
    CloseHandle(lease.process);
    lease.process = nullptr;
  }
  for (auto iterator = windowsById_.begin(); iterator != windowsById_.end();) {
    if (iterator->second.leaseId == leaseId) {
      windowIdsByHandle_.erase(iterator->second.window);
      iterator = windowsById_.erase(iterator);
      continue;
    }
    ++iterator;
  }
  leases_.erase(leaseId);
  leaseOrder_.erase(std::remove(leaseOrder_.begin(), leaseOrder_.end(), leaseId), leaseOrder_.end());
}

WindowInfo ApplicationManager::RequireWindow(const std::string& windowId) {
  const auto entry = windowsById_.find(windowId);
  if (entry == windowsById_.end()) {
    Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" is not tracked by this helper.");
  }
  const WindowRecord& record = entry->second;
  if (record.window == nullptr || IsWindow(record.window) == FALSE) {
    Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" has been closed.");
  }
  DWORD processId = 0;
  GetWindowThreadProcessId(record.window, &processId);
  if (record.processId != 0 && processId != record.processId) {
    Fail(kErrorNoSuchWindow, "Window \"" + windowId + "\" now belongs to a different process.");
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
  const auto entry = windowsById_.find(windowId);
  if (entry == windowsById_.end()) {
    return;
  }
  windowIdsByHandle_.erase(entry->second.window);
  windowsById_.erase(entry);
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
