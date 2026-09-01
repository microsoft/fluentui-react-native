#pragma once

#include <windows.h>

#include <string>
#include <string_view>
#include <utility>
#include <vector>

#include "common.h"
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

ReleaseLedger ParseReleaseLedger(const json::Value& document);

// Owns every depressed key and pointer button that this helper injected. The
// ledger is the only sanctioned way to release input after failure,
// cancellation, or an explicit release request.
class InputController {
 public:
  bool PhysicalInputAvailable();

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
  // without touching the real input desktop.
  void UseTestSender(InputSender sender) {
    sender_ = sender;
    physicalInput_ = 1;
    pointerInitialized_ = true;
  }

 private:
  void RequirePhysicalInput();
  void Send(std::vector<INPUT>& inputs);
  void SendStroke(const KeyStroke& stroke, bool down);
  std::vector<KeyStroke> StrokesForValue(std::wstring_view value) const;

  std::vector<std::pair<std::wstring, std::vector<KeyStroke>>> pressedKeys_;
  std::vector<int> pressedButtons_;
  POINT pointer_{};
  bool pointerInitialized_{false};
  int physicalInput_{-1};
  InputSender sender_{nullptr};
};

bool TryMapWebDriverKey(std::wstring_view value, WORD& virtualKey, bool& extended);
INPUT MakeAbsoluteMouseInput(POINT screenPoint, DWORD flags, DWORD mouseData);
POINT NormalizeToVirtualDesktop(POINT screenPoint, RECT virtualDesktop);

}  // namespace furn
