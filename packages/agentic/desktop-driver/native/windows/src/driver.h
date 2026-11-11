#pragma once

#include <cstdint>
#include <functional>
#include <string>
#include <vector>

#include "application.h"
#include "automation.h"
#include "capture.h"
#include "common.h"
#include "events.h"
#include "input.h"
#include "inputlock.h"
#include "json.h"
#include "settlement.h"

namespace furn {

struct CommandResult {
  json::Value result;
  bool hasBinary{false};
  std::string binaryId;
  std::vector<std::uint8_t> binaryData;
  json::Value binaryMetadata;
};

// Whether a failed or cancelled `command` reports an `effect`: the protocol's
// mutating commands. Reads and lifecycle commands never do.
bool IsTrackedMutation(const std::string& command);

// How a click reaches its element: the requested mode against whether physical
// input can be delivered. Automatic mode substitutes the accessibility click
// for physical input; an explicit physical request never does.
enum class ClickRoute { Accessibility, Physical, Unavailable };
ClickRoute RouteClick(const std::string& mode, bool physicalAvailable);

// Whether any input source presses a key, which types into whichever window
// holds the foreground.
bool ActionsPressKeys(const json::Value& actions);

// Fails unless `foreground` belongs to the application that owns `window` and
// Windows lets the helper inject into it, so keys are never typed into another
// application.
void RequireKeyboardTarget(const ApplicationManager& applications, InputController& input, HWND window,
                           HWND foreground);

// Fails with element-not-interactable when a window of another application is
// on top at `point`, where a physical click would land. The hit tester is a
// seam for tests; it defaults to the real desktop.
using ClickHitTester = HWND(WINAPI*)(POINT);
void RequireClickPointOwnedBy(HWND window, POINT point, ClickHitTester hitTest = &WindowFromPoint);

// Executes one protocol command at a time on the dedicated UI Automation
// worker. Every entry point observes cancellation between bounded native steps.
class Driver {
 public:
  CommandResult Execute(const std::string& command, const json::Value& params, const CancellationToken& token);

  // Releases depressed input and, once nothing stays down, the physical input
  // lock held between commands. Call it on the thread that runs commands.
  void ReleaseInput() noexcept;
  bool HasDepressedInput() const noexcept { return input_.HasDepressedInput(); }

  // Receives each tracked window close once, from the event thread. Clearing
  // it waits for an in-flight publication, so the receiver may be destroyed.
  void SetWindowClosedPublisher(std::function<void(const std::string&)> publisher) {
    applications_.SetWindowClosedPublisher(std::move(publisher));
  }

  // Self-test seams: leases a window of this process so commands run against
  // windows the test created. Returns the serialized lease.
  json::Value AdoptWindowForTesting(HWND window, const std::wstring& title);
  WindowEventMonitor& WindowEventsForTesting() { return applications_.WindowEventsForTesting(); }
  InputController& InputForTesting() { return input_; }
  Automation& AutomationForTesting() { return automation_; }
  // Replaces foreground detection and best-effort activation so key routing
  // runs without moving the real foreground.
  using ForegroundReader = std::function<HWND()>;
  using WindowActivator = std::function<bool(HWND, const CancellationToken&)>;
  void UseTestForeground(ForegroundReader reader, WindowActivator activator) {
    foregroundReader_ = std::move(reader);
    activator_ = std::move(activator);
  }
  // Replaces the hit test that checks where a pointer press or scroll lands.
  void UseTestHitTester(ClickHitTester hitTest) { hitTester_ = hitTest; }

 private:
  CommandResult ExecuteCommand(const std::string& command, const json::Value& params, const CancellationToken& token);
  void ForgetRetiredWindows() noexcept;
  // Holds the cross-process physical input mutex for a whole action chain.
  // Failed cleanup retains both the unreleased input and lock while this
  // worker lives; successful cleanup releases the lock.
  template <typename Fn>
  void RunPhysical(const CancellationToken& token, Fn&& body) {
    PhysicalInputScope scope(token);
    input_.SyncPointerFromCursor();
    try {
      body();
    } catch (...) {
      if (input_.HasDepressedInput()) {
        try {
          input_.ReleaseAll();
        } catch (...) {
          // Preserve the original failure.
        }
      }
      if (input_.HasDepressedInput()) {
        // A failed cleanup leaves the command's physical-input state uncertain.
        RecordDispatching();
      }
      HoldInputWhileDepressed(scope);
      throw;
    }
    HoldInputWhileDepressed(scope);
  }
  // Called on the thread that runs commands, which owns the mutex.
  void HoldInputWhileDepressed(PhysicalInputScope& scope) noexcept {
    if (!input_.HasDepressedInput()) {
      heldInput_.Release();
      return;
    }
    if (!heldInput_.owns()) {
      heldInput_ = std::move(scope);
    }
  }

  WindowContext ContextForWindow(const std::string& windowId, HWND& window);
  HWND ReferenceWindow();
  HWND ForegroundWindow() const { return foregroundReader_ ? foregroundReader_() : GetForegroundWindow(); }
  bool ActivateBestEffort(HWND window, const CancellationToken& token) {
    return activator_ ? activator_(window, token) : TryActivateWindow(window, token);
  }
  // Activates the element's window, confirms that Windows lets the helper
  // inject into it, and focuses the element, so typed keys reach it. Returns
  // the window. Nothing changes before the input checks have passed.
  HWND FocusForKeyboard(const std::string& elementId, const CancellationToken& token);
  InputVerdict ClickAvailability(const std::string& elementId);
  // The lease of the application the element belongs to, or empty when the
  // element or its window is unknown; the command itself then reports why.
  std::string LeaseIdForElement(const std::string& elementId);
  // Refuses each key press unless the foreground belongs to the application of
  // `window`, or to any leased application when `window` is null.
  InputController::KeyboardGuard KeyboardGuardFor(HWND window);
  void ClickPhysically(const std::string& elementId, const CancellationToken& token);
  // Refuses a pointer press or scroll whose point a window of an application
  // this helper did not launch or attach to covers. Without a lease the
  // pointer has no application to stay within, so nothing is checked.
  void RequirePointerOverLeasedApplication(POINT point) const;
  json::Value ProbeResult(const json::Value& params);
  json::Value WindowSummary(const WindowInfo& info);
  void PerformActions(const json::Value& actions, const CancellationToken& token);
  POINT ResolveActionPoint(const json::Value& action, const CancellationToken& token);
  ElementSnapshot RequireLiveElement(const std::string& elementId, const CancellationToken& token);
  CommandResult EncodeCapture(HWND window, const RECT& cropScreen, bool cropToElement, const CancellationToken& token);

  ApplicationManager applications_;
  Automation automation_;
  InputController input_;
  CaptureEngine capture_;
  CommandJournal journal_;
  // What the running mutating command has handed to the application.
  EffectLedger effects_;
  // Physical input held between commands while keys or buttons stay down.
  PhysicalInputScope heldInput_;
  ForegroundReader foregroundReader_;
  WindowActivator activator_;
  ClickHitTester hitTester_{&WindowFromPoint};
};

}  // namespace furn
