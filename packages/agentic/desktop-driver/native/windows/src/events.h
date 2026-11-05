#pragma once

#include <windows.h>

#include <chrono>
#include <condition_variable>
#include <cstddef>
#include <cstdint>
#include <deque>
#include <functional>
#include <memory>
#include <mutex>
#include <string>
#include <string_view>
#include <thread>
#include <unordered_map>
#include <unordered_set>
#include <vector>

#include "json.h"

namespace furn {

// Bounded facts about a window that stay meaningful after it is destroyed.
struct WindowDescriptor {
  std::string className;
  std::string title;
  bool hasTitle{false};
  bool visible{false};
  bool owned{false};
  bool topLevel{false};
};

// One WinEvent notification after the hook thread resolved what it can.
struct WindowNotification {
  DWORD processId{0};
  DWORD event{0};
  HWND window{nullptr};
  bool hasDescriptor{false};
  WindowDescriptor descriptor;
};

// Reads the descriptor of a window. Titles are read only for windows of other
// processes: their text is cached by the window manager, so the read never
// waits on the application, while a same-process read would send a message.
WindowDescriptor DescribeWindow(HWND window);

// Opaque correlation text for a window handle. The handle value itself never
// reaches the wire; two events about the same handle share the same text.
std::string DescribeWindowHandle(HWND window);

// The WinEvent constant name, such as "EVENT_OBJECT_DESTROY".
std::string WinEventName(DWORD event);

// Truncates diagnostic text at a UTF-8 code point boundary. The result,
// including the "..." marker added when text is cut, never exceeds
// `maximumBytes`.
std::string BoundedText(std::string_view value, std::size_t maximumBytes);

// Records WinEvent window notifications for leased applications.
//
// WinEvent hooks run out of context on one dedicated message-loop thread, so a
// callback never runs inside the application, never calls UI Automation, and
// never blocks the command worker. Events are advisory: queries stay
// authoritative. A destroy notification proves a tracked window closed (and
// keeps its handle from being mistaken for a later window that reuses it),
// and the bounded timeline explains failures after the fact. When hooks cannot
// be registered the monitor reports `observing: false` and the registration
// failures, and callers fall back to polling `IsWindow`.
class WindowEventMonitor {
 public:
  static constexpr std::size_t kMaximumEvents = 512;
  static constexpr std::size_t kDiagnosticEventLimit = 48;
  static constexpr std::size_t kMaximumKnownWindows = 4096;
  static constexpr unsigned int kMarshalTimeoutMs = 2000;

  // Test seam: replaces SetWinEventHook so registration failures are testable.
  using HookInstaller = HWINEVENTHOOK (*)(DWORD firstEvent, DWORD lastEvent, DWORD processId, WINEVENTPROC callback);

  WindowEventMonitor() = default;
  ~WindowEventMonitor();
  WindowEventMonitor(const WindowEventMonitor&) = delete;
  WindowEventMonitor& operator=(const WindowEventMonitor&) = delete;

  // Starts observing a process. Registration failures are recorded rather than
  // thrown because events only add diagnostics and close hints; automation must
  // not depend on them.
  void Observe(DWORD processId);

  // Stops observing a process and discards its events.
  void Stop(DWORD processId);

  bool IsObserving(DWORD processId) const;

  // Associates a registered window with its helper identifier so a destroy
  // notification for the handle closes exactly that identifier.
  void Track(HWND window, const std::string& windowId, DWORD processId);
  void Forget(const std::string& windowId);

  // True only when a destroy notification was seen for the tracked window.
  bool IsClosed(const std::string& windowId) const;

  // Receives each tracked window close once. Clearing the publisher waits for
  // an in-flight publication, so the target may be destroyed afterwards.
  void SetClosedPublisher(std::function<void(const std::string&)> publisher);

  // Records one notification. The hook callback and the self-tests enter here.
  void Ingest(WindowNotification notification);

  json::Value Diagnostic(DWORD processId, std::size_t limit = kDiagnosticEventLimit) const;

  void UseHookInstallerForTesting(HookInstaller installer) { installer_ = installer; }

 private:
  struct Event {
    std::uint64_t sequence{0};
    std::chrono::steady_clock::time_point at;
    DWORD event{0};
    std::string element;
    std::string windowId;
    bool hasDescriptor{false};
    WindowDescriptor descriptor;
  };

  struct ProcessLog {
    std::deque<Event> events;
    std::uint64_t dropped{0};
    bool observing{false};
    std::vector<std::string> failures;
  };

  struct Completion {
    std::mutex mutex;
    std::condition_variable signal;
    bool done{false};
    void Signal();
    bool Wait(unsigned int timeoutMs);
  };

  static void CALLBACK HookProc(HWINEVENTHOOK hook, DWORD event, HWND window, LONG objectId, LONG childId,
                                DWORD eventThread, DWORD eventTime);

  bool EnsureThread();
  void ThreadMain();
  void RunTasks();
  bool RunOnThread(std::function<void()> task, unsigned int timeoutMs);
  void RegisterHooks(DWORD processId);
  void UnhookProcess(DWORD processId);
  void OnWinEvent(HWINEVENTHOOK hook, DWORD event, HWND window, LONG objectId, LONG childId);
  bool TakeKnownWindow(HWND window);
  void RememberWindow(HWND window, DWORD processId);
  void RecordFailure(DWORD processId, std::string failure);
  void Publish(const std::string& windowId);

  mutable std::mutex stateMutex_;
  std::unordered_map<DWORD, ProcessLog> logs_;
  std::unordered_map<HWND, std::string> trackedByWindow_;
  std::unordered_map<std::string, HWND> trackedById_;
  std::unordered_set<std::string> closed_;
  std::unordered_map<HWND, DWORD> knownWindows_;
  std::uint64_t nextSequence_{1};

  std::mutex publisherMutex_;
  std::function<void(const std::string&)> publisher_;

  std::mutex taskMutex_;
  std::condition_variable threadSignal_;
  std::deque<std::function<void()>> tasks_;
  std::thread thread_;
  DWORD threadId_{0};
  bool threadStarted_{false};
  bool threadRunning_{false};
  bool stopping_{false};

  // Only the hook thread touches these, so they need no lock.
  std::unordered_map<HWINEVENTHOOK, DWORD> hookProcesses_;
  std::unordered_map<DWORD, std::vector<HWINEVENTHOOK>> hooksByProcess_;

  HookInstaller installer_{nullptr};
};

// A bounded journal of recent helper commands on the same monotonic clock as
// the window events. It records identifiers and outcomes only, never text or
// native handles.
class CommandJournal {
 public:
  static constexpr std::size_t kMaximumEntries = 128;

  std::uint64_t Begin(const std::string& command, json::Value detail);
  void Finish(std::uint64_t sequence, const std::string& outcome, const json::Value& detail = json::Value::Null());
  json::Value Diagnostic(std::size_t limit = 64) const;

 private:
  struct Entry {
    std::uint64_t sequence{0};
    std::string command;
    std::chrono::steady_clock::time_point startedAt;
    bool finished{false};
    std::int64_t durationMs{0};
    std::string outcome;
    json::Value detail;
  };

  mutable std::mutex mutex_;
  std::deque<Entry> entries_;
  std::uint64_t nextSequence_{1};
};

}  // namespace furn
