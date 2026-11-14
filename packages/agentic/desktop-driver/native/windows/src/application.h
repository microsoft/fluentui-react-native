#pragma once

#include <windows.h>

#include <deque>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <unordered_map>
#include <unordered_set>
#include <utility>
#include <vector>
#include <winrt/base.h>

#include "common.h"
#include "events.h"
#include "inputauthority.h"
#include "json.h"

namespace furn {

struct WindowInfo {
  std::string id;
  HWND window{nullptr};
  DWORD processId{0};
  std::wstring title;
  bool primary{false};
};

// How far the helper's ownership of a leased application reaches.
//   kContainmentJobObject: an unpackaged launch and every descendant run in a
//     Job Object this helper created, which ends them on close or helper exit.
//   kContainmentUncontained: a packaged activation. Windows creates the process,
//     so only the activated process or verified descendant whose window is
//     leased is owned, without a containment job.
//   kContainmentExternal: an attached application this helper never owns.
inline constexpr char kContainmentJobObject[] = "job-object";
inline constexpr char kContainmentUncontained[] = "uncontained";
inline constexpr char kContainmentExternal[] = "external";

struct ApplicationControlLock {
  ApplicationControlLock(HANDLE value, DWORD pid, FILETIME started) : handle(value), processId(pid), startTime(started) {}
  ApplicationControlLock(const ApplicationControlLock&) = delete;
  ApplicationControlLock& operator=(const ApplicationControlLock&) = delete;
  ~ApplicationControlLock();
  HANDLE handle{nullptr};
  DWORD processId{0};
  FILETIME startTime{};
};

struct ApplicationLease {
  std::string id;
  std::string ownership;  // "attached" or "launched"
  std::string containment;
  std::string endpoint;
  std::string storyRootTestId;
  DWORD processId{0};
  FILETIME startTime{};
  std::wstring executablePath;
  std::wstring aumid;
  std::string interactiveSession;
  std::string launchKind;
  std::shared_ptr<ApplicationControlLock> control;
  std::shared_ptr<ApplicationControlLock> launchRootControl;
  std::wstring windowTitle;
  HANDLE process{nullptr};
  // The containment Job Object of a kContainmentJobObject launch, else null.
  HANDLE job{nullptr};
  HWND primaryWindow{nullptr};
};

// Owns application identity, launch/attach leases, and the opaque window table.
// Attached applications are never terminated or placed in a Job Object; owned
// launches close only the exact windows, process, and contained descendants
// that this helper created.
class ApplicationManager {
 public:
  ~ApplicationManager();

  const ApplicationLease& Launch(const json::Value& params, const CancellationToken& token);
  const ApplicationLease& Attach(const json::Value& params, const CancellationToken& token);
  json::Value InspectApplication(const json::Value& params, const CancellationToken& token);
  json::Value RecoverApplication(const json::Value& params, const CancellationToken& token);
  void CloseApplication(const std::string& leaseId, const CancellationToken& token);
  void Dispose(const CancellationToken& token);
  std::vector<WindowInfo> Windows(
      const std::string& leaseId, const CancellationToken& token,
      const std::function<bool(HWND, DWORD, ULONGLONG)>& hasContent = {});

  WindowInfo RequireWindow(const std::string& windowId);
  const ApplicationLease* FindLease(const std::string& leaseId) const;
  const ApplicationLease* LeaseForWindow(HWND window) const;
  const ApplicationLease* PrimaryLease() const;
  // Whether `foreground` is `window`, a window that owns it or hosts it, or a
  // window of the application that runs it. A null `window` accepts any leased
  // application.
  bool ForegroundBelongsToApplication(HWND window, HWND foreground) const;
  // Fails with window-activation-failed unless it does, so keys are never
  // typed into another application.
  void RequireForegroundOwnedBy(HWND window, HWND foreground) const;
  std::vector<std::string> WindowIdsForLease(const std::string& leaseId) const;
  void ForgetWindow(const std::string& windowId);
  json::Value SerializeLease(const ApplicationLease& lease) const;

  // Window identifiers dropped since the last call because their window closed
  // or a different window reused its handle. The caller discards whatever it
  // cached for them.
  std::vector<std::string> TakeRetiredWindowIds();

  // The bounded WinEvent timeline for the lease's process, the current native
  // window publication, and the lease's tracked windows.
  json::Value WindowEventLog(const std::string& leaseId);

  // Receives each tracked window close once, on the event thread.
  void SetWindowClosedPublisher(std::function<void(const std::string&)> publisher);

  // Test seams: adopt a window of this process as an attached lease so the real
  // lease paths run against windows the self-test creates, and reach the
  // monitor to inject notifications.
  const ApplicationLease& AdoptWindowForTesting(HWND window, const std::wstring& title);
  WindowEventMonitor& WindowEventsForTesting() { return windowEvents_; }
  void UseLeaseRegistrationHookForTesting(std::function<void(HANDLE, HANDLE)> hook) {
    leaseRegistrationHookForTesting_ = std::move(hook);
  }

 private:
  struct ResolvedAttachment {
    DWORD processId{0};
    winrt::handle process;
    HWND window{nullptr};
    std::wstring title;
  };
  ResolvedAttachment ResolveAttachment(const json::Value& params, const CancellationToken& token);
  const ApplicationLease& LaunchImpl(const json::Value& params, const CancellationToken& token);
  json::Value launchFailureData_{json::Value::Object()};
  static constexpr std::size_t kMaximumRetiredWindowIds = 256;

  struct WindowRecord {
    std::string id;
    HWND window{nullptr};
    DWORD processId{0};
    // A handle value can be reused by a later window, so the creating thread
    // and class, which never change for a live window, fingerprint the window
    // this identifier was issued for.
    DWORD threadId{0};
    std::wstring className;
    std::wstring title;
    std::string leaseId;
    bool primary{false};
  };

  std::string RegisterWindow(HWND window, DWORD processId, const std::string& leaseId, bool primary,
                             const std::wstring& title);
  void RetireWindow(const std::string& windowId);
  void RetireClosedWindows(const std::string& leaseId);
  bool IsWindowClosed(const WindowRecord& record) const;
  bool HasRegisteredWindowIdentity(HWND window, const ApplicationLease& lease) const;
  bool ForegroundBelongsToLease(const ApplicationLease& lease, HWND foreground) const;
  json::Value PublicationDiagnostic(const ApplicationLease& lease) const;
  ApplicationLease& CreateLease(std::string ownership, DWORD processId, HANDLE process, HWND primaryWindow,
                                const std::wstring& title, const json::Value& params,
                                std::string containment, HANDLE job = nullptr,
                                std::shared_ptr<ApplicationControlLock> launchRootControl = {});
  void TrackPendingCleanupProcess(DWORD processId, HANDLE process);

  struct PendingCleanupProcess {
    DWORD processId{0};
    FILETIME startTime{};
    HANDLE process{nullptr};
  };

  std::unordered_map<std::string, ApplicationLease> leases_;
  std::vector<std::string> leaseOrder_;
  std::unordered_map<std::string, WindowRecord> windowsById_;
  std::unordered_map<HWND, std::string> windowIdsByHandle_;
  std::vector<PendingCleanupProcess> pendingCleanupProcesses_;
  // Identifiers are never reissued, so a retired one keeps reporting that its
  // window closed instead of reading as unknown.
  std::deque<std::string> retiredOrder_;
  std::unordered_set<std::string> retiredIds_;
  std::vector<std::string> pendingRetirements_;
  WindowEventMonitor windowEvents_;
  std::function<void(HANDLE, HANDLE)> leaseRegistrationHookForTesting_;
};

std::vector<HWND> EnumerateTopLevelWindows(DWORD processId);
std::vector<HWND> FindWindowsWithTitle(const std::wstring& title);
std::wstring ReadWindowTitle(HWND window);
bool TryReadProcessStartTime(HANDLE process, FILETIME& startTime);
std::wstring ReadProcessImagePath(HANDLE process);
std::wstring QuoteWindowsCommandLineArgument(std::wstring_view value);
// Fails with `failureCode` unless `processId` runs in this helper's Windows
// session. An unreadable session is refused rather than assumed.
void RequireProcessInHelperSession(DWORD processId, std::string_view failureCode);
void ActivateWindow(HWND window, const CancellationToken& token);
bool TryActivateWindow(HWND window, const CancellationToken& token);
// Fails with automation-failed and reason `target-non-response` when the
// thread that owns `window` does not answer window messages within a bound.
// A probe that Windows refuses for another reason, such as UIPI, passes.
void RequireWindowResponds(HWND window, const CancellationToken& token);
// Posts SW_RESTORE so a hung window cannot block the helper, then waits a
// bounded time for it. Returns false when the window did not restore in time.
bool RestoreWindow(HWND window, const CancellationToken& token);

// What the helper saw when Windows kept the foreground away from a window it
// tried to activate. Foreign windows are named only by an opaque handle and
// their process id, never by title or class.
struct ActivationRefusal {
  bool sawForeground{false};
  // Empty when no window held the foreground at the end of the attempt.
  std::string foreground;
  DWORD foregroundProcess{0};
  bool foregroundInTargetProcess{false};
  bool foregroundHung{false};
  ProcessIntegrity foregroundIntegrity;
  ProcessIntegrity helperIntegrity;
  // The Windows error of the latest refused input-queue attachment, or 0.
  DWORD attachError{0};
};

std::string DescribeActivationRefusal(const ActivationRefusal& refusal);

}  // namespace furn
