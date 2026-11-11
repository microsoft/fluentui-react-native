#include "events.h"

#include <algorithm>
#include <cstdio>
#include <iterator>
#include <utility>

#include "common.h"

namespace furn {
namespace {

constexpr LONG kChildSelf = 0;
constexpr int kMaximumClassNameUnits = 256;
// 170 UTF-16 units encode to at most 510 UTF-8 bytes, inside the 512-byte bound
// that window titles keep in every diagnostic.
constexpr int kMaximumTitleUnits = 170;
constexpr std::size_t kMaximumCommandBytes = 128;
constexpr UINT kTaskMessage = WM_APP + 1;

struct HookRange {
  DWORD first;
  DWORD last;
  const char* name;
  // Close detection depends on this range, so only its failure ends observing.
  bool lifetime;
};

constexpr HookRange kHookRanges[] = {
    {EVENT_SYSTEM_FOREGROUND, EVENT_SYSTEM_MENUPOPUPEND, "foreground and menu events", false},
    {EVENT_SYSTEM_DIALOGSTART, EVENT_SYSTEM_DIALOGEND, "dialog events", false},
    {EVENT_SYSTEM_MINIMIZESTART, EVENT_SYSTEM_MINIMIZEEND, "minimize events", false},
    {EVENT_OBJECT_CREATE, EVENT_OBJECT_HIDE, "object lifetime events", true},
    {EVENT_OBJECT_NAMECHANGE, EVENT_OBJECT_NAMECHANGE, "name change events", false},
};

// Hook callbacks run on the thread that installed the hook, so a thread-local
// pointer reaches the monitor without a global registry.
thread_local WindowEventMonitor* hookThreadMonitor = nullptr;

HWINEVENTHOOK InstallHook(DWORD firstEvent, DWORD lastEvent, DWORD processId, WINEVENTPROC callback) {
  return SetWinEventHook(firstEvent, lastEvent, nullptr, callback, processId, 0, WINEVENT_OUTOFCONTEXT);
}

bool IsTopLevelWindow(HWND window) {
  return window != nullptr && IsWindow(window) != FALSE && GetAncestor(window, GA_PARENT) == GetDesktopWindow();
}

struct ProcessWindows {
  DWORD processId{0};
  std::vector<HWND> windows;
};

BOOL CALLBACK CollectProcessWindow(HWND window, LPARAM parameter) {
  auto* context = reinterpret_cast<ProcessWindows*>(parameter);
  DWORD processId = 0;
  GetWindowThreadProcessId(window, &processId);
  if (processId == context->processId) {
    context->windows.push_back(window);
  }
  return TRUE;
}

json::Value SerializeDescriptor(const WindowDescriptor& descriptor) {
  json::Value value = json::Value::Object();
  value.Set("className", json::Value::String(descriptor.className));
  value.Set("owned", json::Value::Bool(descriptor.owned));
  if (descriptor.hasTitle) {
    value.Set("title", json::Value::String(descriptor.title));
  }
  value.Set("topLevel", json::Value::Bool(descriptor.topLevel));
  value.Set("visible", json::Value::Bool(descriptor.visible));
  return value;
}

std::int64_t MillisecondsSince(const std::chrono::steady_clock::time_point& start,
                               const std::chrono::steady_clock::time_point& now) {
  return std::chrono::duration_cast<std::chrono::milliseconds>(now - start).count();
}

}  // namespace

std::string BoundedText(std::string_view value, std::size_t maximumBytes) {
  if (value.size() <= maximumBytes) {
    return std::string(value);
  }
  constexpr std::string_view marker = "...";
  std::size_t end = maximumBytes > marker.size() ? maximumBytes - marker.size() : 0;
  while (end > 0 && (static_cast<unsigned char>(value[end]) & 0xC0) == 0x80) {
    end -= 1;
  }
  std::string bounded(value.substr(0, end));
  if (maximumBytes >= marker.size()) {
    bounded += marker;
  }
  return bounded;
}

std::string WinEventName(DWORD event) {
  switch (event) {
    case EVENT_SYSTEM_FOREGROUND:
      return "EVENT_SYSTEM_FOREGROUND";
    case EVENT_SYSTEM_MENUSTART:
      return "EVENT_SYSTEM_MENUSTART";
    case EVENT_SYSTEM_MENUEND:
      return "EVENT_SYSTEM_MENUEND";
    case EVENT_SYSTEM_MENUPOPUPSTART:
      return "EVENT_SYSTEM_MENUPOPUPSTART";
    case EVENT_SYSTEM_MENUPOPUPEND:
      return "EVENT_SYSTEM_MENUPOPUPEND";
    case EVENT_SYSTEM_DIALOGSTART:
      return "EVENT_SYSTEM_DIALOGSTART";
    case EVENT_SYSTEM_DIALOGEND:
      return "EVENT_SYSTEM_DIALOGEND";
    case EVENT_SYSTEM_MINIMIZESTART:
      return "EVENT_SYSTEM_MINIMIZESTART";
    case EVENT_SYSTEM_MINIMIZEEND:
      return "EVENT_SYSTEM_MINIMIZEEND";
    case EVENT_OBJECT_CREATE:
      return "EVENT_OBJECT_CREATE";
    case EVENT_OBJECT_DESTROY:
      return "EVENT_OBJECT_DESTROY";
    case EVENT_OBJECT_SHOW:
      return "EVENT_OBJECT_SHOW";
    case EVENT_OBJECT_HIDE:
      return "EVENT_OBJECT_HIDE";
    case EVENT_OBJECT_NAMECHANGE:
      return "EVENT_OBJECT_NAMECHANGE";
    default:
      break;
  }
  char text[32] = {};
  std::snprintf(text, sizeof(text), "EVENT_0x%04lX", static_cast<unsigned long>(event));
  return text;
}

std::string DescribeWindowHandle(HWND window) {
  if (window == nullptr) {
    return "none";
  }
  std::uint32_t hash = 2166136261u;
  const std::uint64_t value = static_cast<std::uint64_t>(reinterpret_cast<std::uintptr_t>(window));
  for (int shift = 0; shift < 64; shift += 8) {
    hash ^= static_cast<std::uint32_t>((value >> shift) & 0xFFu);
    hash *= 16777619u;
  }
  char text[24] = {};
  std::snprintf(text, sizeof(text), "hwnd:%08x", static_cast<unsigned>(hash));
  return text;
}

WindowDescriptor DescribeWindow(HWND window) {
  WindowDescriptor descriptor;
  wchar_t className[kMaximumClassNameUnits] = {};
  const int classLength = GetClassNameW(window, className, kMaximumClassNameUnits);
  if (classLength > 0) {
    descriptor.className = ToUtf8(std::wstring_view(className, static_cast<std::size_t>(classLength)));
  }
  descriptor.visible = IsWindowVisible(window) != FALSE;
  descriptor.owned = GetWindow(window, GW_OWNER) != nullptr;
  descriptor.topLevel = IsTopLevelWindow(window);
  DWORD processId = 0;
  if (GetWindowThreadProcessId(window, &processId) != 0 && processId != GetCurrentProcessId()) {
    wchar_t title[kMaximumTitleUnits + 1] = {};
    int written = GetWindowTextW(window, title, kMaximumTitleUnits + 1);
    if (written > 0 && IS_HIGH_SURROGATE(title[written - 1])) {
      written -= 1;
    }
    descriptor.hasTitle = true;
    descriptor.title = written > 0 ? ToUtf8(std::wstring_view(title, static_cast<std::size_t>(written))) : "";
  }
  return descriptor;
}

void WindowEventMonitor::Completion::Signal() {
  {
    const std::lock_guard<std::mutex> guard(mutex);
    done = true;
  }
  signal.notify_all();
}

bool WindowEventMonitor::Completion::Wait(unsigned int timeoutMs) {
  std::unique_lock<std::mutex> guard(mutex);
  return signal.wait_for(guard, std::chrono::milliseconds(timeoutMs), [this] { return done; });
}

WindowEventMonitor::~WindowEventMonitor() {
  DWORD target = 0;
  {
    const std::lock_guard<std::mutex> guard(taskMutex_);
    stopping_ = true;
    if (threadRunning_) {
      target = threadId_;
    }
  }
  if (thread_.joinable()) {
    if (target != 0) {
      PostThreadMessageW(target, WM_QUIT, 0, 0);
    }
    thread_.join();
  }
}

bool WindowEventMonitor::EnsureThread() {
  std::unique_lock<std::mutex> guard(taskMutex_);
  if (!threadStarted_) {
    try {
      thread_ = std::thread(&WindowEventMonitor::ThreadMain, this);
      threadStarted_ = true;
    } catch (...) {
      return false;
    }
  }
  threadSignal_.wait_for(guard, std::chrono::milliseconds(kMarshalTimeoutMs), [this] { return threadRunning_; });
  return threadRunning_;
}

void WindowEventMonitor::ThreadMain() {
  hookThreadMonitor = this;
  MSG message{};
  // Peeking creates the thread's message queue before anyone posts to it.
  PeekMessageW(&message, nullptr, WM_USER, WM_USER, PM_NOREMOVE);
  bool quit = false;
  {
    const std::lock_guard<std::mutex> guard(taskMutex_);
    threadId_ = GetCurrentThreadId();
    threadRunning_ = true;
    quit = stopping_;
  }
  threadSignal_.notify_all();

  while (!quit && GetMessageW(&message, nullptr, 0, 0) > 0) {
    if (message.hwnd == nullptr && message.message == kTaskMessage) {
      RunTasks();
      continue;
    }
    TranslateMessage(&message);
    DispatchMessageW(&message);
  }

  {
    const std::lock_guard<std::mutex> guard(taskMutex_);
    threadRunning_ = false;
  }
  for (const auto& entry : hookProcesses_) {
    UnhookWinEvent(entry.first);
  }
  hookProcesses_.clear();
  hooksByProcess_.clear();
  hookThreadMonitor = nullptr;
}

void WindowEventMonitor::RunTasks() {
  while (true) {
    std::function<void()> task;
    {
      const std::lock_guard<std::mutex> guard(taskMutex_);
      if (tasks_.empty()) {
        return;
      }
      task = std::move(tasks_.front());
      tasks_.pop_front();
    }
    task();
  }
}

bool WindowEventMonitor::RunOnThread(std::function<void()> task, unsigned int timeoutMs) {
  const auto completion = std::make_shared<Completion>();
  DWORD target = 0;
  {
    const std::lock_guard<std::mutex> guard(taskMutex_);
    if (!threadRunning_) {
      return false;
    }
    target = threadId_;
    tasks_.push_back([task = std::move(task), completion]() {
      try {
        task();
      } catch (...) {
        // A failed registration is reported through the process log.
      }
      completion->Signal();
    });
  }
  if (PostThreadMessageW(target, kTaskMessage, 0, 0) == FALSE) {
    return false;
  }
  return completion->Wait(timeoutMs);
}

void WindowEventMonitor::Observe(DWORD processId) {
  {
    const std::lock_guard<std::mutex> guard(stateMutex_);
    if (logs_[processId].observing) {
      return;
    }
  }
  if (!EnsureThread()) {
    RecordFailure(processId, "The window event thread did not start.");
    return;
  }
  if (!RunOnThread([this, processId]() { RegisterHooks(processId); }, kMarshalTimeoutMs)) {
    RecordFailure(processId, "Registering window event hooks did not complete within " +
                                 std::to_string(kMarshalTimeoutMs) + " ms.");
  }
}

void WindowEventMonitor::Stop(DWORD processId) {
  RunOnThread([this, processId]() { UnhookProcess(processId); }, kMarshalTimeoutMs);
  const std::lock_guard<std::mutex> guard(stateMutex_);
  logs_.erase(processId);
  for (auto known = knownWindows_.begin(); known != knownWindows_.end();) {
    known = known->second == processId ? knownWindows_.erase(known) : std::next(known);
  }
}

bool WindowEventMonitor::IsObserving(DWORD processId) const {
  const std::lock_guard<std::mutex> guard(stateMutex_);
  const auto found = logs_.find(processId);
  return found != logs_.end() && found->second.observing;
}

void WindowEventMonitor::RecordFailure(DWORD processId, std::string failure) {
  const std::lock_guard<std::mutex> guard(stateMutex_);
  logs_[processId].failures.push_back(std::move(failure));
}

void WindowEventMonitor::RegisterHooks(DWORD processId) {
  // A retry after a partial registration must not stack duplicate hooks.
  UnhookProcess(processId);
  const HookInstaller install = installer_ != nullptr ? installer_ : &InstallHook;
  std::vector<std::string> failures;
  bool lifetimeObserved = false;
  for (const HookRange& range : kHookRanges) {
    SetLastError(ERROR_SUCCESS);
    const HWINEVENTHOOK hook = install(range.first, range.last, processId, &WindowEventMonitor::HookProc);
    if (hook == nullptr) {
      failures.push_back(std::string("SetWinEventHook for ") + range.name + ": " +
                         DescribeHresult(HRESULT_FROM_WIN32(GetLastError())));
      continue;
    }
    hookProcesses_[hook] = processId;
    hooksByProcess_[processId].push_back(hook);
    lifetimeObserved = lifetimeObserved || range.lifetime;
  }

  // Windows that exist before the first lifetime event must still be known as
  // top-level windows so their destruction is recorded.
  ProcessWindows existing;
  existing.processId = processId;
  EnumWindows(CollectProcessWindow, reinterpret_cast<LPARAM>(&existing));
  for (const HWND window : existing.windows) {
    RememberWindow(window, processId);
  }

  const std::lock_guard<std::mutex> guard(stateMutex_);
  ProcessLog& log = logs_[processId];
  log.observing = lifetimeObserved;
  log.failures = std::move(failures);
}

void WindowEventMonitor::UnhookProcess(DWORD processId) {
  const auto found = hooksByProcess_.find(processId);
  if (found == hooksByProcess_.end()) {
    return;
  }
  for (const HWINEVENTHOOK hook : found->second) {
    UnhookWinEvent(hook);
    hookProcesses_.erase(hook);
  }
  hooksByProcess_.erase(found);
}

void CALLBACK WindowEventMonitor::HookProc(HWINEVENTHOOK hook, DWORD event, HWND window, LONG objectId, LONG childId,
                                           DWORD, DWORD) {
  WindowEventMonitor* const monitor = hookThreadMonitor;
  if (monitor == nullptr) {
    return;
  }
  try {
    monitor->OnWinEvent(hook, event, window, objectId, childId);
  } catch (...) {
    // A callback must never unwind into the system.
  }
}

void WindowEventMonitor::OnWinEvent(HWINEVENTHOOK hook, DWORD event, HWND window, LONG objectId, LONG childId) {
  const auto owner = hookProcesses_.find(hook);
  if (owner == hookProcesses_.end()) {
    return;
  }
  const bool objectEvent = event >= EVENT_OBJECT_CREATE;
  if (objectEvent && (objectId != OBJID_WINDOW || childId != kChildSelf || window == nullptr)) {
    return;
  }

  WindowNotification notification;
  notification.processId = owner->second;
  notification.event = event;
  notification.window = window;
  if (event == EVENT_OBJECT_DESTROY) {
    // The window is already gone, so only a window that was seen alive as a
    // top-level window is recorded; child controls are not.
    if (!TakeKnownWindow(window)) {
      return;
    }
  } else if (window != nullptr) {
    notification.descriptor = DescribeWindow(window);
    notification.hasDescriptor = true;
    if (notification.descriptor.topLevel) {
      RememberWindow(window, owner->second);
    } else if (objectEvent) {
      return;
    }
  }
  Ingest(std::move(notification));
}

bool WindowEventMonitor::TakeKnownWindow(HWND window) {
  const std::lock_guard<std::mutex> guard(stateMutex_);
  return knownWindows_.erase(window) > 0;
}

void WindowEventMonitor::RememberWindow(HWND window, DWORD processId) {
  const std::lock_guard<std::mutex> guard(stateMutex_);
  if (knownWindows_.size() >= kMaximumKnownWindows) {
    // Past the bound, windows seen earlier lose their destroy events, which
    // only narrows the advisory timeline; tracked windows keep their entry,
    // each with the process it was recorded for.
    std::unordered_map<HWND, DWORD> retained;
    for (const auto& tracked : trackedByWindow_) {
      const auto known = knownWindows_.find(tracked.first);
      if (known != knownWindows_.end()) {
        retained.emplace(known->first, known->second);
      }
    }
    knownWindows_ = std::move(retained);
  }
  knownWindows_[window] = processId;
}

void WindowEventMonitor::Track(HWND window, const std::string& windowId, DWORD processId) {
  {
    const std::lock_guard<std::mutex> guard(stateMutex_);
    const auto previous = trackedByWindow_.find(window);
    if (previous != trackedByWindow_.end() && previous->second != windowId) {
      trackedById_.erase(previous->second);
    }
    const auto owned = trackedById_.find(windowId);
    if (owned != trackedById_.end() && owned->second != window) {
      trackedByWindow_.erase(owned->second);
    }
    trackedByWindow_[window] = windowId;
    trackedById_[windowId] = window;
    closed_.erase(windowId);
  }
  RememberWindow(window, processId);
}

void WindowEventMonitor::Forget(const std::string& windowId) {
  const std::lock_guard<std::mutex> guard(stateMutex_);
  const auto tracked = trackedById_.find(windowId);
  if (tracked != trackedById_.end()) {
    const auto byWindow = trackedByWindow_.find(tracked->second);
    if (byWindow != trackedByWindow_.end() && byWindow->second == windowId) {
      trackedByWindow_.erase(byWindow);
    }
    trackedById_.erase(tracked);
  }
  closed_.erase(windowId);
}

bool WindowEventMonitor::IsClosed(const std::string& windowId) const {
  const std::lock_guard<std::mutex> guard(stateMutex_);
  return closed_.count(windowId) > 0;
}

void WindowEventMonitor::SetClosedPublisher(std::function<void(const std::string&)> publisher) {
  const std::lock_guard<std::mutex> guard(publisherMutex_);
  publisher_ = std::move(publisher);
}

void WindowEventMonitor::Publish(const std::string& windowId) {
  const std::lock_guard<std::mutex> guard(publisherMutex_);
  if (!publisher_) {
    return;
  }
  try {
    publisher_(windowId);
  } catch (...) {
    // Events are advisory, so a failed publication never fails observation.
  }
}

void WindowEventMonitor::Ingest(WindowNotification notification) {
  std::string closedWindowId;
  {
    const std::lock_guard<std::mutex> guard(stateMutex_);
    Event event;
    event.sequence = nextSequence_;
    nextSequence_ += 1;
    event.at = std::chrono::steady_clock::now();
    event.event = notification.event;
    event.element = DescribeWindowHandle(notification.window);
    event.hasDescriptor = notification.hasDescriptor;
    event.descriptor = std::move(notification.descriptor);

    const auto tracked = trackedByWindow_.find(notification.window);
    if (notification.window != nullptr && tracked != trackedByWindow_.end()) {
      event.windowId = tracked->second;
      if (notification.event == EVENT_OBJECT_DESTROY) {
        if (closed_.insert(event.windowId).second) {
          closedWindowId = event.windowId;
        }
        // The handle can be reused by a later window, which must not inherit
        // this identity.
        trackedByWindow_.erase(tracked);
      }
    }

    ProcessLog& log = logs_[notification.processId];
    log.events.push_back(std::move(event));
    if (log.events.size() > kMaximumEvents) {
      log.events.pop_front();
      log.dropped += 1;
    }
  }
  if (!closedWindowId.empty()) {
    Publish(closedWindowId);
  }
}

json::Value WindowEventMonitor::Diagnostic(DWORD processId, std::size_t limit) const {
  const auto now = std::chrono::steady_clock::now();
  json::Value events = json::Value::Array();
  bool observing = false;
  bool truncated = false;
  std::vector<std::string> failures;
  {
    const std::lock_guard<std::mutex> guard(stateMutex_);
    const auto found = logs_.find(processId);
    if (found != logs_.end()) {
      const ProcessLog& log = found->second;
      observing = log.observing;
      failures = log.failures;
      const std::size_t total = log.events.size();
      const std::size_t first = total > limit ? total - limit : 0;
      truncated = log.dropped > 0 || first > 0;
      for (std::size_t index = first; index < total; index += 1) {
        const Event& event = log.events[index];
        json::Value value = json::Value::Object();
        value.Set("ageMs", json::Value::Integer(MillisecondsSince(event.at, now)));
        if (event.hasDescriptor) {
          value.Set("descriptor", SerializeDescriptor(event.descriptor));
        }
        value.Set("element", json::Value::String(event.element));
        value.Set("notification", json::Value::String(WinEventName(event.event)));
        value.Set("sequence", json::Value::Integer(static_cast<std::int64_t>(event.sequence)));
        if (!event.windowId.empty()) {
          value.Set("windowId", json::Value::String(event.windowId));
        }
        events.Append(std::move(value));
      }
    }
  }
  json::Value result = json::Value::Object();
  result.Set("events", std::move(events));
  result.Set("eventsTruncated", json::Value::Bool(truncated));
  result.Set("observing", json::Value::Bool(observing));
  result.Set("source", json::Value::String(std::string("WinEvent")));
  if (!failures.empty()) {
    json::Value list = json::Value::Array();
    for (std::string& failure : failures) {
      list.Append(json::Value::String(BoundedText(failure, 512)));
    }
    result.Set("registrationFailures", std::move(list));
  }
  return result;
}

std::uint64_t CommandJournal::Begin(const std::string& command, json::Value detail) {
  const std::lock_guard<std::mutex> guard(mutex_);
  Entry entry;
  entry.sequence = nextSequence_;
  nextSequence_ += 1;
  entry.command = BoundedText(command, kMaximumCommandBytes);
  entry.startedAt = std::chrono::steady_clock::now();
  entry.outcome = "running";
  entry.detail = std::move(detail);
  const std::uint64_t sequence = entry.sequence;
  entries_.push_back(std::move(entry));
  while (entries_.size() > kMaximumEntries) {
    entries_.pop_front();
  }
  return sequence;
}

void CommandJournal::Finish(std::uint64_t sequence, const std::string& outcome, const json::Value& detail) {
  const std::lock_guard<std::mutex> guard(mutex_);
  const auto found = std::find_if(entries_.rbegin(), entries_.rend(),
                                  [sequence](const Entry& entry) { return entry.sequence == sequence; });
  if (found == entries_.rend()) {
    return;
  }
  found->finished = true;
  found->durationMs = MillisecondsSince(found->startedAt, std::chrono::steady_clock::now());
  found->outcome = BoundedText(outcome, kMaximumCommandBytes);
  if (detail.IsObject()) {
    if (!found->detail.IsObject()) {
      found->detail = json::Value::Object();
    }
    for (const auto& member : detail.Members()) {
      found->detail.Set(member.first, member.second);
    }
  }
}

json::Value CommandJournal::Diagnostic(std::size_t limit) const {
  const auto now = std::chrono::steady_clock::now();
  json::Value commands = json::Value::Array();
  const std::lock_guard<std::mutex> guard(mutex_);
  const std::size_t total = entries_.size();
  for (std::size_t index = total > limit ? total - limit : 0; index < total; index += 1) {
    const Entry& entry = entries_[index];
    json::Value value = json::Value::Object();
    value.Set("ageMs", json::Value::Integer(MillisecondsSince(entry.startedAt, now)));
    value.Set("command", json::Value::String(entry.command));
    if (entry.finished) {
      value.Set("durationMs", json::Value::Integer(entry.durationMs));
    }
    value.Set("outcome", json::Value::String(entry.outcome));
    value.Set("sequence", json::Value::Integer(static_cast<std::int64_t>(entry.sequence)));
    if (entry.detail.IsObject() && !entry.detail.Members().empty()) {
      value.Set("detail", entry.detail);
    }
    commands.Append(std::move(value));
  }
  return commands;
}

}  // namespace furn
