#include "input.h"

#include <algorithm>
#include <cmath>

#include "geometry.h"

namespace furn {
namespace {

struct SpecialKey {
  wchar_t value;
  WORD virtualKey;
  bool extended;
};

// W3C WebDriver key code table, restricted to keys the desktop server can
// actually deliver on Windows.
constexpr SpecialKey kSpecialKeys[] = {
    {0xE001, VK_CANCEL, false},  {0xE002, VK_HELP, false},     {0xE003, VK_BACK, false},
    {0xE004, VK_TAB, false},     {0xE005, VK_CLEAR, false},    {0xE006, VK_RETURN, false},
    {0xE007, VK_RETURN, true},   {0xE008, VK_SHIFT, false},    {0xE009, VK_CONTROL, false},
    {0xE00A, VK_MENU, false},    {0xE00B, VK_PAUSE, false},    {0xE00C, VK_ESCAPE, false},
    {0xE00D, VK_SPACE, false},   {0xE00E, VK_PRIOR, true},     {0xE00F, VK_NEXT, true},
    {0xE010, VK_END, true},      {0xE011, VK_HOME, true},      {0xE012, VK_LEFT, true},
    {0xE013, VK_UP, true},       {0xE014, VK_RIGHT, true},     {0xE015, VK_DOWN, true},
    {0xE016, VK_INSERT, true},   {0xE017, VK_DELETE, true},    {0xE018, VK_OEM_1, false},
    {0xE019, VK_OEM_PLUS, false}, {0xE01A, VK_NUMPAD0, false}, {0xE01B, VK_NUMPAD1, false},
    {0xE01C, VK_NUMPAD2, false}, {0xE01D, VK_NUMPAD3, false},  {0xE01E, VK_NUMPAD4, false},
    {0xE01F, VK_NUMPAD5, false}, {0xE020, VK_NUMPAD6, false},  {0xE021, VK_NUMPAD7, false},
    {0xE022, VK_NUMPAD8, false}, {0xE023, VK_NUMPAD9, false},  {0xE024, VK_MULTIPLY, false},
    {0xE025, VK_ADD, false},     {0xE026, VK_SEPARATOR, false}, {0xE027, VK_SUBTRACT, false},
    {0xE028, VK_DECIMAL, false}, {0xE029, VK_DIVIDE, true},    {0xE031, VK_F1, false},
    {0xE032, VK_F2, false},      {0xE033, VK_F3, false},       {0xE034, VK_F4, false},
    {0xE035, VK_F5, false},      {0xE036, VK_F6, false},       {0xE037, VK_F7, false},
    {0xE038, VK_F8, false},      {0xE039, VK_F9, false},       {0xE03A, VK_F10, false},
    {0xE03B, VK_F11, false},     {0xE03C, VK_F12, false},      {0xE03D, VK_LWIN, true},
    {0xE050, VK_RSHIFT, false},  {0xE051, VK_RCONTROL, true},  {0xE052, VK_RMENU, true},
    {0xE053, VK_RWIN, true},     {0xE054, VK_PRIOR, false},    {0xE055, VK_NEXT, false},
    {0xE056, VK_END, false},     {0xE057, VK_HOME, false},     {0xE058, VK_LEFT, false},
    {0xE059, VK_UP, false},      {0xE05A, VK_RIGHT, false},    {0xE05B, VK_DOWN, false},
    {0xE05C, VK_INSERT, false},  {0xE05D, VK_DELETE, false},
};

RECT VirtualDesktopRect() {
  RECT rect{};
  rect.left = GetSystemMetrics(SM_XVIRTUALSCREEN);
  rect.top = GetSystemMetrics(SM_YVIRTUALSCREEN);
  rect.right = rect.left + GetSystemMetrics(SM_CXVIRTUALSCREEN);
  rect.bottom = rect.top + GetSystemMetrics(SM_CYVIRTUALSCREEN);
  if (rect.right <= rect.left || rect.bottom <= rect.top) {
    rect.left = 0;
    rect.top = 0;
    rect.right = std::max(1, GetSystemMetrics(SM_CXSCREEN));
    rect.bottom = std::max(1, GetSystemMetrics(SM_CYSCREEN));
  }
  return rect;
}

void ButtonFlags(int button, DWORD& downFlag, DWORD& upFlag, DWORD& mouseData) {
  downFlag = MOUSEEVENTF_LEFTDOWN;
  upFlag = MOUSEEVENTF_LEFTUP;
  mouseData = 0;
  switch (button) {
    case 0:
      return;
    case 1:
      downFlag = MOUSEEVENTF_MIDDLEDOWN;
      upFlag = MOUSEEVENTF_MIDDLEUP;
      return;
    case 2:
      downFlag = MOUSEEVENTF_RIGHTDOWN;
      upFlag = MOUSEEVENTF_RIGHTUP;
      return;
    case 3:
    case 4:
      downFlag = MOUSEEVENTF_XDOWN;
      upFlag = MOUSEEVENTF_XUP;
      mouseData = button == 3 ? XBUTTON1 : XBUTTON2;
      return;
    default:
      Fail(kErrorInvalidParams, "Pointer button " + std::to_string(button) + " is not supported on Windows.");
  }
}

}  // namespace

// A WebDriver key value names exactly one code point, either a printable
// character or a private-use special key.
bool IsSingleWebDriverKeyValue(std::wstring_view value) {
  if (value.size() == 1) {
    return value[0] < 0xd800 || value[0] > 0xdfff;
  }
  if (value.size() == 2) {
    return value[0] >= 0xd800 && value[0] <= 0xdbff && value[1] >= 0xdc00 && value[1] <= 0xdfff;
  }
  return false;
}

ReleaseLedger ParseReleaseLedger(const json::Value& document) {
  if (!document.IsObject()) {
    Fail(kErrorInvalidParams, "The release ledger must be a JSON object.");
  }
  for (const auto& member : document.Members()) {
    if (member.first != "keys" && member.first != "buttons") {
      Fail(kErrorInvalidParams, "The release ledger contains the unknown field \"" + member.first + "\".");
    }
  }

  ReleaseLedger ledger;
  if (const json::Value* keys = document.Find("keys"); keys != nullptr) {
    if (!keys->IsArray()) {
      Fail(kErrorInvalidParams, "The release ledger field \"keys\" must be an array.");
    }
    for (const json::Value& key : keys->Items()) {
      if (!key.IsString()) {
        Fail(kErrorInvalidParams, "Every release ledger key must be a string.");
      }
      const std::wstring value = ToWide(key.AsString());
      if (!IsSingleWebDriverKeyValue(value)) {
        Fail(kErrorInvalidParams,
             "Release ledger key \"" + key.AsString() + "\" is not a single WebDriver key value.");
      }
      ledger.keys.push_back(value);
    }
  }
  if (const json::Value* buttons = document.Find("buttons"); buttons != nullptr) {
    if (!buttons->IsArray()) {
      Fail(kErrorInvalidParams, "The release ledger field \"buttons\" must be an array.");
    }
    for (const json::Value& button : buttons->Items()) {
      if (!button.IsNumber()) {
        Fail(kErrorInvalidParams, "Every release ledger button must be a number.");
      }
      const double raw = button.AsNumber();
      const std::int64_t value = button.AsInteger(-1);
      if (static_cast<double>(value) != raw || value < 0 || value > 4) {
        Fail(kErrorInvalidParams, "Release ledger buttons must be W3C pointer buttons between 0 and 4.");
      }
      ledger.buttons.push_back(static_cast<int>(value));
    }
  }
  return ledger;
}

POINT NormalizeToVirtualDesktop(POINT screenPoint, RECT virtualDesktop) {
  const double width = static_cast<double>(virtualDesktop.right - virtualDesktop.left);
  const double height = static_cast<double>(virtualDesktop.bottom - virtualDesktop.top);
  POINT normalized{};
  normalized.x = RoundToPixel((static_cast<double>(screenPoint.x - virtualDesktop.left) * 65535.0) /
                              std::max(1.0, width - 1.0));
  normalized.y = RoundToPixel((static_cast<double>(screenPoint.y - virtualDesktop.top) * 65535.0) /
                              std::max(1.0, height - 1.0));
  normalized.x = std::clamp<long>(normalized.x, 0, 65535);
  normalized.y = std::clamp<long>(normalized.y, 0, 65535);
  return normalized;
}

INPUT MakeAbsoluteMouseInput(POINT screenPoint, DWORD flags, DWORD mouseData) {
  const POINT normalized = NormalizeToVirtualDesktop(screenPoint, VirtualDesktopRect());
  INPUT input{};
  input.type = INPUT_MOUSE;
  input.mi.dx = normalized.x;
  input.mi.dy = normalized.y;
  input.mi.mouseData = mouseData;
  input.mi.dwFlags = flags | MOUSEEVENTF_ABSOLUTE | MOUSEEVENTF_VIRTUALDESK;
  return input;
}

bool TryMapWebDriverKey(std::wstring_view value, WORD& virtualKey, bool& extended) {
  if (value.size() != 1) {
    return false;
  }
  for (const SpecialKey& key : kSpecialKeys) {
    if (key.value == value[0]) {
      virtualKey = key.virtualKey;
      extended = key.extended;
      return true;
    }
  }
  return false;
}

bool InputController::PhysicalInputAvailable() {
  if (physicalInput_ == 1) {
    return true;
  }
  const HDESK desktop = OpenInputDesktop(0, FALSE, DESKTOP_READOBJECTS);
  if (desktop != nullptr) {
    CloseDesktop(desktop);
    physicalInput_ = 1;
    return true;
  }
  // Some hosted and packaged launch contexts deny an input-desktop handle even
  // while the process shares the active interactive session. A live foreground
  // window or active-console session is the non-mutating fallback; SendInput
  // remains authoritative and still fails explicitly if UIPI or the desktop
  // blocks it.
  DWORD sessionId = 0;
  return GetForegroundWindow() != nullptr ||
         (ProcessIdToSessionId(GetCurrentProcessId(), &sessionId) != FALSE &&
          sessionId == WTSGetActiveConsoleSessionId());
}

void InputController::RequirePhysicalInput() {
  if (!PhysicalInputAvailable()) {
    Fail(kErrorInputUnavailable,
         "Physical input is unavailable because the helper is not attached to an interactive input desktop.");
  }
}

void InputController::SyncPointerFromCursor() {
  POINT position{};
  if (GetCursorPos(&position) != FALSE) {
    pointer_ = position;
    pointerInitialized_ = true;
  }
}

void InputController::Send(std::vector<INPUT>& inputs) {
  if (inputs.empty()) {
    return;
  }
  const InputSender send = sender_ != nullptr ? sender_ : &SendInput;
  const UINT sent = send(static_cast<UINT>(inputs.size()), inputs.data(), sizeof(INPUT));
  if (sent != inputs.size()) {
    FailLastError(kErrorInputFailed, "Injecting physical input", GetLastError());
  }
}

void InputController::MovePointer(POINT target, unsigned int durationMs, const CancellationToken& token) {
  RequirePhysicalInput();
  if (!pointerInitialized_) {
    SyncPointerFromCursor();
    pointerInitialized_ = true;
  }
  const POINT start = pointer_;
  const unsigned int steps = durationMs == 0 ? 1 : std::max(1u, std::min(60u, durationMs / 16u));
  for (unsigned int step = 1; step <= steps; step += 1) {
    token.ThrowIfCancelled();
    const double progress = static_cast<double>(step) / static_cast<double>(steps);
    POINT position{};
    position.x = start.x + RoundToPixel(static_cast<double>(target.x - start.x) * progress);
    position.y = start.y + RoundToPixel(static_cast<double>(target.y - start.y) * progress);
    std::vector<INPUT> inputs{MakeAbsoluteMouseInput(position, MOUSEEVENTF_MOVE, 0)};
    Send(inputs);
    pointer_ = position;
    if (step < steps) {
      token.Wait(durationMs / steps);
    }
  }
  pointer_ = target;
  token.Wait(16);
  POINT observed{};
  if (GetCursorPos(&observed) == FALSE || std::abs(observed.x - target.x) > 2 || std::abs(observed.y - target.y) > 2) {
    Fail(kErrorInputFailed,
         "Windows did not move the pointer to the requested native element coordinate.");
  }
}

void InputController::PointerDown(int button, const CancellationToken& token) {
  RequirePhysicalInput();
  token.ThrowIfCancelled();
  DWORD downFlag = 0;
  DWORD upFlag = 0;
  DWORD mouseData = 0;
  ButtonFlags(button, downFlag, upFlag, mouseData);
  if (std::find(pressedButtons_.begin(), pressedButtons_.end(), button) != pressedButtons_.end()) {
    return;
  }
  std::vector<INPUT> inputs{MakeAbsoluteMouseInput(pointer_, downFlag, mouseData)};
  Send(inputs);
  pressedButtons_.push_back(button);
}

void InputController::PointerUp(int button, const CancellationToken& token) {
  token.ThrowIfCancelled();
  const auto position = std::find(pressedButtons_.begin(), pressedButtons_.end(), button);
  if (position == pressedButtons_.end()) {
    return;
  }
  DWORD downFlag = 0;
  DWORD upFlag = 0;
  DWORD mouseData = 0;
  ButtonFlags(button, downFlag, upFlag, mouseData);
  std::vector<INPUT> inputs{MakeAbsoluteMouseInput(pointer_, upFlag, mouseData)};
  Send(inputs);
  pressedButtons_.erase(position);
}

void InputController::PointerCancel() {
  for (auto iterator = pressedButtons_.rbegin(); iterator != pressedButtons_.rend(); ++iterator) {
    DWORD downFlag = 0;
    DWORD upFlag = 0;
    DWORD mouseData = 0;
    ButtonFlags(*iterator, downFlag, upFlag, mouseData);
    std::vector<INPUT> inputs{MakeAbsoluteMouseInput(pointer_, upFlag, mouseData)};
    try {
      Send(inputs);
    } catch (const HelperError&) {
      // Release as much as possible; the remaining ledger entries still drop.
    }
  }
  pressedButtons_.clear();
}

void InputController::ClickAt(POINT target, const CancellationToken& token) {
  MovePointer(target, 0, token);
  token.Wait(50);
  PointerDown(0, token);
  token.Wait(50);
  PointerUp(0, token);
}

void InputController::Wheel(double deltaX, double deltaY, const CancellationToken& token) {
  RequirePhysicalInput();
  token.ThrowIfCancelled();
  std::vector<INPUT> inputs;
  if (deltaY != 0.0) {
    // WebDriver scrolls down with a positive delta; Windows scrolls up with a
    // positive wheel value.
    inputs.push_back(MakeAbsoluteMouseInput(pointer_, MOUSEEVENTF_WHEEL,
                                            static_cast<DWORD>(static_cast<int>(-RoundToPixel(deltaY)))));
  }
  if (deltaX != 0.0) {
    inputs.push_back(MakeAbsoluteMouseInput(pointer_, MOUSEEVENTF_HWHEEL,
                                            static_cast<DWORD>(static_cast<int>(RoundToPixel(deltaX)))));
  }
  Send(inputs);
}

std::vector<KeyStroke> InputController::StrokesForValue(std::wstring_view value) const {
  std::vector<KeyStroke> strokes;
  WORD virtualKey = 0;
  bool extended = false;
  if (TryMapWebDriverKey(value, virtualKey, extended)) {
    strokes.push_back(KeyStroke{false, virtualKey, extended});
    return strokes;
  }
  for (const wchar_t unit : value) {
    strokes.push_back(KeyStroke{true, static_cast<WORD>(unit), false});
  }
  return strokes;
}

void InputController::SendStroke(const KeyStroke& stroke, bool down) {
  INPUT input{};
  input.type = INPUT_KEYBOARD;
  if (stroke.unicode) {
    input.ki.wVk = 0;
    input.ki.wScan = stroke.code;
    input.ki.dwFlags = KEYEVENTF_UNICODE | (down ? 0u : KEYEVENTF_KEYUP);
  } else {
    input.ki.wVk = stroke.code;
    input.ki.wScan = static_cast<WORD>(MapVirtualKeyW(stroke.code, MAPVK_VK_TO_VSC));
    input.ki.dwFlags = (stroke.extended ? KEYEVENTF_EXTENDEDKEY : 0u) | (down ? 0u : KEYEVENTF_KEYUP);
  }
  std::vector<INPUT> inputs{input};
  Send(inputs);
}

void InputController::KeyDown(std::wstring_view value, const CancellationToken& token) {
  RequirePhysicalInput();
  token.ThrowIfCancelled();
  if (!IsSingleWebDriverKeyValue(value)) {
    Fail(kErrorInvalidParams, "A keyDown value must contain exactly one Unicode code point.");
  }
  if (value == L"\uE000") {
    ReleaseAll();
    return;
  }
  const std::vector<KeyStroke> strokes = StrokesForValue(value);
  // The ledger records the press before injection so a partially injected
  // sequence is still released by the ledger.
  pressedKeys_.emplace_back(std::wstring(value), strokes);
  for (const KeyStroke& stroke : strokes) {
    SendStroke(stroke, true);
  }
}

void InputController::KeyUp(std::wstring_view value, const CancellationToken& token) {
  token.ThrowIfCancelled();
  if (!IsSingleWebDriverKeyValue(value)) {
    Fail(kErrorInvalidParams, "A keyUp value must contain exactly one Unicode code point.");
  }
  if (value == L"\uE000") {
    ReleaseAll();
    return;
  }
  for (auto iterator = pressedKeys_.rbegin(); iterator != pressedKeys_.rend(); ++iterator) {
    if (iterator->first != value) {
      continue;
    }
    RequirePhysicalInput();
    for (auto stroke = iterator->second.rbegin(); stroke != iterator->second.rend(); ++stroke) {
      SendStroke(*stroke, false);
    }
    pressedKeys_.erase(std::next(iterator).base());
    return;
  }
  // A key that this helper never pressed still produces the physical release so
  // the application observes a well-formed key sequence.
  RequirePhysicalInput();
  const std::vector<KeyStroke> strokes = StrokesForValue(value);
  for (auto stroke = strokes.rbegin(); stroke != strokes.rend(); ++stroke) {
    SendStroke(*stroke, false);
  }
}

void InputController::TypeText(std::wstring_view text, const CancellationToken& token) {
  RequirePhysicalInput();
  for (std::size_t index = 0; index < text.size(); index += 1) {
    token.ThrowIfCancelled();
    const std::wstring_view unit = text.substr(index, 1);
    WORD virtualKey = 0;
    bool extended = false;
    if (TryMapWebDriverKey(unit, virtualKey, extended)) {
      PressAndRelease(std::wstring(unit), {KeyStroke{false, virtualKey, extended}}, token);
      continue;
    }
    if (text[index] == L'\n') {
      PressAndRelease(L"\uE006", {KeyStroke{false, VK_RETURN, false}}, token);
      continue;
    }
    if (text[index] == L'\r') {
      continue;
    }
    PressAndRelease(std::wstring(unit), {KeyStroke{true, static_cast<WORD>(text[index]), false}}, token);
  }
}

void InputController::PressAndRelease(std::wstring ledgerKey, const std::vector<KeyStroke>& strokes,
                                      const CancellationToken& token) {
  token.ThrowIfCancelled();
  pressedKeys_.emplace_back(std::move(ledgerKey), strokes);
  for (const KeyStroke& stroke : strokes) {
    SendStroke(stroke, true);
  }
  const std::vector<KeyStroke>& recorded = pressedKeys_.back().second;
  for (auto stroke = recorded.rbegin(); stroke != recorded.rend(); ++stroke) {
    SendStroke(*stroke, false);
  }
  pressedKeys_.pop_back();
}

void InputController::PressChord(const std::vector<WORD>& virtualKeys, const CancellationToken& token) {
  RequirePhysicalInput();
  token.ThrowIfCancelled();
  const std::size_t base = pressedKeys_.size();
  for (const WORD key : virtualKeys) {
    const KeyStroke stroke{false, key, false};
    // Chord keys enter the ledger under a synthetic name that can never
    // collide with a WebDriver key value, so a failed chord still releases.
    pressedKeys_.emplace_back(L"chord:" + std::to_wstring(key), std::vector<KeyStroke>{stroke});
    SendStroke(stroke, true);
  }
  while (pressedKeys_.size() > base) {
    const std::vector<KeyStroke>& strokes = pressedKeys_.back().second;
    for (auto stroke = strokes.rbegin(); stroke != strokes.rend(); ++stroke) {
      SendStroke(*stroke, false);
    }
    pressedKeys_.pop_back();
  }
}

ReleaseCounts InputController::ReleaseExact(const ReleaseLedger& ledger) {
  ReleaseCounts counts;
  if (ledger.empty()) {
    return counts;
  }
  RequirePhysicalInput();
  SyncPointerFromCursor();
  for (auto key = ledger.keys.rbegin(); key != ledger.keys.rend(); ++key) {
    const std::vector<KeyStroke> strokes = StrokesForValue(*key);
    for (auto stroke = strokes.rbegin(); stroke != strokes.rend(); ++stroke) {
      SendStroke(*stroke, false);
    }
    counts.keys += 1;
  }
  for (auto button = ledger.buttons.rbegin(); button != ledger.buttons.rend(); ++button) {
    DWORD downFlag = 0;
    DWORD upFlag = 0;
    DWORD mouseData = 0;
    ButtonFlags(*button, downFlag, upFlag, mouseData);
    std::vector<INPUT> inputs{MakeAbsoluteMouseInput(pointer_, upFlag, mouseData)};
    Send(inputs);
    counts.buttons += 1;
  }
  return counts;
}

std::size_t InputController::ReleaseDesktopModifiers() {
  static constexpr WORD kStickyKeys[] = {VK_LSHIFT, VK_RSHIFT, VK_LCONTROL, VK_RCONTROL,
                                         VK_LMENU,  VK_RMENU,  VK_LWIN,     VK_RWIN};
  static constexpr WORD kStickyButtons[] = {VK_LBUTTON, VK_RBUTTON, VK_MBUTTON, VK_XBUTTON1, VK_XBUTTON2};
  std::size_t released = 0;
  for (const WORD key : kStickyKeys) {
    if ((GetAsyncKeyState(key) & 0x8000) == 0) {
      continue;
    }
    const bool extended = key == VK_RCONTROL || key == VK_RMENU || key == VK_LWIN || key == VK_RWIN;
    SendStroke(KeyStroke{false, key, extended}, false);
    released += 1;
  }
  for (const WORD button : kStickyButtons) {
    if ((GetAsyncKeyState(button) & 0x8000) == 0) {
      continue;
    }
    DWORD downFlag = 0;
    DWORD upFlag = 0;
    DWORD mouseData = 0;
    const int index = button == VK_LBUTTON  ? 0
                      : button == VK_MBUTTON ? 1
                      : button == VK_RBUTTON ? 2
                      : button == VK_XBUTTON1 ? 3
                                              : 4;
    ButtonFlags(index, downFlag, upFlag, mouseData);
    SyncPointerFromCursor();
    std::vector<INPUT> inputs{MakeAbsoluteMouseInput(pointer_, upFlag, mouseData)};
    Send(inputs);
    released += 1;
  }
  return released;
}

void InputController::ReleaseAll() {
  for (auto iterator = pressedKeys_.rbegin(); iterator != pressedKeys_.rend(); ++iterator) {
    for (auto stroke = iterator->second.rbegin(); stroke != iterator->second.rend(); ++stroke) {
      try {
        SendStroke(*stroke, false);
      } catch (const HelperError&) {
        // Continue releasing the remaining ledger entries.
      }
    }
  }
  pressedKeys_.clear();
  PointerCancel();
}

}  // namespace furn
