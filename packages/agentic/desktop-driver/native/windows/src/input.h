#pragma once

#include <windows.h>

#include <functional>
#include <string>
#include <string_view>
#include <utility>
#include <vector>

#include "common.h"
#include "inputauthority.h"
#include "json.h"

namespace furn {

// One physical key stroke exactly as it was injected, so the release ledger can
// undo it with the matching flags instead of guessing.
struct KeyStroke {
  bool unicode{false};
  WORD code{0};
  bool extended{false};
};

using InputSender = UINT(WINAPI*)(UINT, LPINPUT, int);

// The exact set of depressed input that another helper instance reported. The
// Node adapter sends it on stdin so recovery releases those inputs and nothing
// else.
struct ReleaseLedger {
  std::vector<std::wstring> keys;
  std::vector<int> buttons;

  bool empty() const noexcept { return keys.empty() && buttons.empty(); }
};

struct ReleaseCounts {
  std::size_t keys{0};
  std::size_t buttons{0};
};

bool IsSingleWebDriverKeyValue(std::wstring_view value);
ReleaseLedger ParseReleaseLedger(const json::Value& document);

// Owns every depressed key and pointer button that this helper injected. The
// ledger is the only sanctioned way to release input after failure,
// cancellation, or an explicit release request.
class InputController {
 public:
  // Whether injected input can reach applications right now. The session,
  // lock, and input desktop are re-read on every call and on every physical
  // operation, so a success never outlives the state it observed.
  InputVerdict Availability();
  bool PhysicalInputAvailable() { return Availability().available; }
  // Whether Windows lets this helper inject into windows that `processId`
  // owns; it does not read the session.
  InputVerdict IntegrityFor(DWORD processId);
  void RequireIntegrityFor(DWORD processId);
  // Availability plus IntegrityFor.
  InputVerdict AvailabilityFor(DWORD processId);
  void RequireInputFor(DWORD processId);

  // Runs before each key press this helper injects (a key down, a typed
  // character, or a chord) and never before a release, so it can refuse to type
  // into the wrong application while releases of what is already down always
  // go through.
  using KeyboardGuard = std::function<void()>;
  void SetKeyboardGuard(KeyboardGuard guard) { keyboardGuard_ = std::move(guard); }

  POINT pointer() const noexcept { return pointer_; }
  void SyncPointerFromCursor();

  void MovePointer(POINT target, unsigned int durationMs, const CancellationToken& token);
  void PointerDown(int button, const CancellationToken& token);
  void PointerUp(int button, const CancellationToken& token);
  void PointerCancel();
  void ClickAt(POINT target, const CancellationToken& token);
  void Wheel(double deltaX, double deltaY, const CancellationToken& token);

  void KeyDown(std::wstring_view value, const CancellationToken& token);
  void KeyUp(std::wstring_view value, const CancellationToken& token);
  void TypeText(std::wstring_view text, const CancellationToken& token);
  void PressChord(const std::vector<WORD>& virtualKeys, const CancellationToken& token);

  void ReleaseAll();
  // Releases exactly the listed keys and buttons in reverse order, using the
  // same injection flags that pressed them.
  ReleaseCounts ReleaseExact(const ReleaseLedger& ledger);
  // Releases modifiers and buttons that the operating system still reports as
  // depressed. This is a diagnostics sweep, not the adapter recovery path.
  std::size_t ReleaseDesktopModifiers();
  bool HasDepressedInput() const noexcept { return !pressedKeys_.empty() || !pressedButtons_.empty(); }
  std::size_t DepressedKeyCount() const noexcept { return pressedKeys_.size(); }
  std::size_t DepressedButtonCount() const noexcept { return pressedButtons_.size(); }

  // Redirects injection so the built-in self-test can exercise the ledger
  // without touching the real input desktop. Unless a test installed its own
  // environment, the redirected controller sees an interactive one.
  void UseTestSender(InputSender sender) {
    sender_ = sender;
    if (!environmentReader_) {
      environmentReader_ = &InteractiveEnvironmentForTesting;
    }
  }
  using EnvironmentReader = std::function<InputEnvironment()>;
  using IntegrityReader = std::function<ProcessIntegrity(DWORD)>;
  void UseTestEnvironment(EnvironmentReader reader) { environmentReader_ = std::move(reader); }
  void UseTestIntegrity(IntegrityReader reader) { integrityReader_ = std::move(reader); }

 private:
  void RequirePhysicalInput();
  // Runs the keyboard guard. Called before a press is recorded in the ledger,
  // so a refused press leaves nothing to release.
  void GuardKeyPress();
  void PressStrokes(std::wstring ledgerKey, const std::vector<KeyStroke>& strokes);
  void PressAndRelease(std::wstring ledgerKey, const std::vector<KeyStroke>& strokes,
                       const CancellationToken& token);
  // Counted sends are primary mutations in the command's effect ledger. Pointer
  // placement and releases that clean up input pass `counted = false`, so
  // cleanup after a failure cannot turn a rejection into a partial effect.
  void Send(std::vector<INPUT>& inputs, bool counted = true);
  void SendStroke(const KeyStroke& stroke, bool down, bool counted = true);
  std::vector<KeyStroke> StrokesForValue(std::wstring_view value) const;

  std::vector<std::pair<std::wstring, std::vector<KeyStroke>>> pressedKeys_;
  std::vector<int> pressedButtons_;
  POINT pointer_{};
  bool pointerInitialized_{false};
  InputSender sender_{nullptr};
  KeyboardGuard keyboardGuard_;
  EnvironmentReader environmentReader_;
  IntegrityReader integrityReader_;
};

// Installs a keyboard guard for one scope, and always removes it.
class KeyboardGuardScope {
 public:
  KeyboardGuardScope(InputController& input, InputController::KeyboardGuard guard) : input_(input) {
    input_.SetKeyboardGuard(std::move(guard));
  }
  ~KeyboardGuardScope() { input_.SetKeyboardGuard(nullptr); }
  KeyboardGuardScope(const KeyboardGuardScope&) = delete;
  KeyboardGuardScope& operator=(const KeyboardGuardScope&) = delete;

 private:
  InputController& input_;
};

bool TryMapWebDriverKey(std::wstring_view value, WORD& virtualKey, bool& extended);
// The virtual key that types `character` without modifiers in the foreground keyboard layout, or 0.
WORD UnmodifiedLayoutKey(wchar_t character);
INPUT MakeAbsoluteMouseInput(POINT screenPoint, DWORD flags, DWORD mouseData);
// A positioned press and release injected as one batch for an atomic click.
std::vector<INPUT> MakeClickInputs(POINT screenPoint, int button);
POINT NormalizeToVirtualDesktop(POINT screenPoint, RECT virtualDesktop);

}  // namespace furn
