#include "driver.h"

#include <algorithm>
#include <cmath>

namespace furn {
namespace {

json::Value SerializeRect(const RectD& rect) {
  json::Value value = json::Value::Object();
  value.Set("height", json::Value::Number(rect.height));
  value.Set("width", json::Value::Number(rect.width));
  value.Set("x", json::Value::Number(rect.x));
  value.Set("y", json::Value::Number(rect.y));
  return value;
}

std::string RequireString(const json::Value& params, std::string_view key) {
  const json::Value* value = params.Find(key);
  if (value == nullptr || !value->IsString() || value->AsString().empty()) {
    Fail(kErrorInvalidParams, "The request is missing the required \"" + std::string(key) + "\" parameter.");
  }
  return value->AsString();
}

int ActionButton(const json::Value& action) {
  const json::Value* button = action.Find("button");
  if (button == nullptr || !button->IsNumber()) {
    return 0;
  }
  return static_cast<int>(button->AsInteger(0));
}

unsigned int ActionDuration(const json::Value& action) {
  const json::Value* duration = action.Find("duration");
  if (duration == nullptr || !duration->IsNumber()) {
    return 0;
  }
  const std::int64_t value = duration->AsInteger(0);
  return value <= 0 ? 0u : static_cast<unsigned int>(std::min<std::int64_t>(value, 30000));
}

}  // namespace

WindowContext Driver::ContextForWindow(const std::string& windowId, HWND& window) {
  const WindowInfo info = applications_.RequireWindow(windowId);
  window = info.window;
  WindowContext context;
  context.windowId = info.id;
  context.window = info.window;
  context.primary = info.primary;
  if (const ApplicationLease* lease = applications_.LeaseForWindow(info.window); lease != nullptr) {
    context.storyRootTestId = ToWide(lease->storyRootTestId);
    context.primary = info.primary || info.window == lease->primaryWindow;
  }
  return context;
}

HWND Driver::ReferenceWindow() {
  const ApplicationLease* lease = applications_.PrimaryLease();
  if (lease != nullptr && lease->primaryWindow != nullptr && IsWindow(lease->primaryWindow) != FALSE) {
    return lease->primaryWindow;
  }
  Fail(kErrorInvalidParams, "The helper does not hold an application window to resolve viewport coordinates against.");
}

json::Value Driver::ProbeResult(const json::Value& params) {
  const bool physical = input_.PhysicalInputAvailable();
  const bool screenshot = capture_.Available();
  json::Value features = json::Value::Object();
  features.Set("accessibilityClick", json::Value::Bool(true));
  features.Set("elementScreenshot", json::Value::Bool(screenshot));
  features.Set("focus", json::Value::Bool(true));
  features.Set("keyboard", json::Value::Bool(physical));
  features.Set("physicalClick", json::Value::Bool(physical));
  features.Set("screenshot", json::Value::Bool(screenshot));
  features.Set("setWindowRect", json::Value::Bool(true));
  features.Set("wheel", json::Value::Bool(physical));

  json::Value result = json::Value::Object();
  result.Set("endpoint", json::Value::String(params.StringField("endpoint", "windows")));
  result.Set("features", features);
  result.Set("platformName", json::Value::String(std::string("windows")));
  result.Set("protocolVersion", json::Value::Integer(1));
  return result;
}

json::Value Driver::WindowSummary(const WindowInfo& info) {
  const WindowMetrics metrics = MeasureWindow(info.window);
  json::Value value = json::Value::Object();
  value.Set("id", json::Value::String(info.id));
  value.Set("rect", SerializeRect(ClientRectInScreenDips(metrics)));
  value.Set("title", json::Value::String(info.title));
  return value;
}

ElementSnapshot Driver::RequireLiveElement(const std::string& elementId, const CancellationToken& token) {
  return automation_.SnapshotElement(elementId, token);
}

POINT Driver::ResolveActionPoint(const json::Value& action, const CancellationToken& token) {
  const double x = action.NumberField("x", 0.0);
  const double y = action.NumberField("y", 0.0);
  const json::Value* origin = action.Find("origin");
  if (origin != nullptr && origin->IsObject()) {
    const std::string elementId = origin->StringField("elementId");
    if (elementId.empty()) {
      Fail(kErrorInvalidParams, "An action element origin is missing its element identifier.");
    }
    const ElementSnapshot snapshot = RequireLiveElement(elementId, token);
    const ElementRecord& record = automation_.RequireRecord(elementId);
    const WindowMetrics metrics = MeasureWindow(record.window);
    POINT point{};
    point.x = (snapshot.physicalRect.left + snapshot.physicalRect.right) / 2 +
              RoundToPixel(PhysicalFromDips(x, metrics.dpi));
    point.y = (snapshot.physicalRect.top + snapshot.physicalRect.bottom) / 2 +
              RoundToPixel(PhysicalFromDips(y, metrics.dpi));
    return point;
  }
  const HWND window = ReferenceWindow();
  const WindowMetrics metrics = MeasureWindow(window);
  if (origin != nullptr && origin->IsString() && origin->AsString() == "pointer") {
    POINT point = input_.pointer();
    point.x += RoundToPixel(PhysicalFromDips(x, metrics.dpi));
    point.y += RoundToPixel(PhysicalFromDips(y, metrics.dpi));
    return point;
  }
  return ClientDipsToPhysicalPoint(x, y, metrics);
}

void Driver::PerformActions(const json::Value& actions, const CancellationToken& token) {
  if (!actions.IsArray()) {
    Fail(kErrorInvalidParams, "The performActions request requires an array of input sources.");
  }
  std::size_t ticks = 0;
  for (const json::Value& source : actions.Items()) {
    const json::Value* list = source.Find("actions");
    if (list != nullptr && list->IsArray()) {
      ticks = std::max(ticks, list->Items().size());
    }
  }
  for (std::size_t tick = 0; tick < ticks; tick += 1) {
    token.ThrowIfCancelled();
    unsigned int pause = 0;
    for (const json::Value& source : actions.Items()) {
      const json::Value* list = source.Find("actions");
      if (list == nullptr || !list->IsArray() || tick >= list->Items().size()) {
        continue;
      }
      const json::Value& action = list->Items()[tick];
      const std::string type = action.StringField("type");
      const std::string sourceType = source.StringField("type", "none");
      if (type == "pause") {
        pause = std::max(pause, ActionDuration(action));
        continue;
      }
      if (sourceType == "key") {
        const std::wstring value = action.WideField("value");
        if (value.empty()) {
          Fail(kErrorInvalidParams, "A key action is missing its \"value\".");
        }
        if (!IsSingleWebDriverKeyValue(value)) {
          Fail(kErrorInvalidParams, "A key action value must contain exactly one Unicode code point.");
        }
        if (type == "keyDown") {
          input_.KeyDown(value, token);
        } else if (type == "keyUp") {
          input_.KeyUp(value, token);
        } else {
          Fail(kErrorInvalidParams, "Key input sources support only keyDown, keyUp, and pause.");
        }
        continue;
      }
      if (sourceType == "pointer") {
        if (type == "pointerMove") {
          input_.MovePointer(ResolveActionPoint(action, token), ActionDuration(action), token);
        } else if (type == "pointerDown") {
          input_.PointerDown(ActionButton(action), token);
        } else if (type == "pointerUp") {
          input_.PointerUp(ActionButton(action), token);
        } else if (type == "pointerCancel") {
          input_.PointerCancel();
        } else {
          Fail(kErrorInvalidParams, "Pointer input sources support only move, down, up, cancel, and pause.");
        }
        continue;
      }
      if (sourceType == "wheel") {
        if (type != "scroll") {
          Fail(kErrorInvalidParams, "Wheel input sources support only scroll and pause.");
        }
        input_.MovePointer(ResolveActionPoint(action, token), 0, token);
        input_.Wheel(action.NumberField("deltaX", 0.0), action.NumberField("deltaY", 0.0), token);
        continue;
      }
      if (sourceType != "none") {
        Fail(kErrorInvalidParams, "Input source type \"" + sourceType + "\" is not supported.");
      }
    }
    if (pause > 0) {
      token.Wait(pause);
    }
  }
}

CommandResult Driver::EncodeCapture(HWND window, const RECT& cropScreen, bool cropToElement,
                                    const CancellationToken& token) {
  const RawFrame frame = capture_.CaptureWindow(window, token);
  token.ThrowIfCancelled();
  RECT crop{0, 0, static_cast<long>(frame.width), static_cast<long>(frame.height)};
  if (cropToElement) {
    crop.left = cropScreen.left - frame.origin.x;
    crop.top = cropScreen.top - frame.origin.y;
    crop.right = cropScreen.right - frame.origin.x;
    crop.bottom = cropScreen.bottom - frame.origin.y;
  }
  const EncodedImage image = capture_.Encode(frame, crop);

  CommandResult result;
  result.result = json::Value::Object();
  result.result.Set("height", json::Value::Integer(image.height));
  result.result.Set("mimeType", json::Value::String(std::string("image/png")));
  result.result.Set("scaleFactor", json::Value::Number(RoundToHundredths(image.scaleFactor)));
  result.result.Set("width", json::Value::Integer(image.width));
  result.hasBinary = true;
  result.binaryId = NextIdentifier("image");
  result.binaryData = image.png;
  result.binaryMetadata = json::Value::Object();
  result.binaryMetadata.Set("id", json::Value::String(result.binaryId));
  result.binaryMetadata.Set("mimeType", json::Value::String(std::string("image/png")));
  result.binaryMetadata.Set("height", json::Value::Integer(image.height));
  result.binaryMetadata.Set("width", json::Value::Integer(image.width));
  result.binaryMetadata.Set("scaleFactor", json::Value::Number(RoundToHundredths(image.scaleFactor)));
  return result;
}

void Driver::ReleaseInput() noexcept {
  try {
    if (!input_.HasDepressedInput()) {
      return;
    }
    const CancellationToken idle;
    try {
      const PhysicalInputScope scope(idle, kPhysicalInputCleanupWaitMs, AbandonPolicy::Adopt);
      input_.ReleaseAll();
      return;
    } catch (const HelperError&) {
      // Depressed input must never outlive a cancelled command, so recovery
      // proceeds even when the cross-process lock could not be acquired.
      input_.ReleaseAll();
    }
  } catch (...) {
    // Releasing input must never mask the original failure.
  }
}

CommandResult Driver::Execute(const std::string& command, const json::Value& params, const CancellationToken& token) {
  CommandResult result;
  token.ThrowIfCancelled();

  if (command == "probe") {
    result.result = ProbeResult(params);
    return result;
  }
  if (command == "launch" || command == "attach") {
    const ApplicationLease& lease =
        command == "launch" ? applications_.Launch(params, token) : applications_.Attach(params, token);
    result.result = applications_.SerializeLease(lease);
    return result;
  }
  if (command == "closeApplication") {
    const json::Value* lease = params.Find("lease");
    if (lease == nullptr || !lease->IsObject()) {
      Fail(kErrorInvalidParams, "The closeApplication request is missing its lease.");
    }
    const std::string leaseId = lease->StringField("id");
    for (const std::string& windowId : applications_.WindowIdsForLease(leaseId)) {
      automation_.ForgetWindow(windowId);
    }
    applications_.CloseApplication(leaseId, token);
    result.result = json::Value::Null();
    return result;
  }
  if (command == "windows") {
    const json::Value* lease = params.Find("lease");
    if (lease == nullptr || !lease->IsObject()) {
      Fail(kErrorInvalidParams, "The windows request is missing its lease.");
    }
    result.result = json::Value::Array();
    for (const WindowInfo& info : applications_.Windows(lease->StringField("id"), token)) {
      result.result.Append(WindowSummary(info));
    }
    return result;
  }
  if (command == "closeWindow") {
    const std::string windowId = RequireString(params, "windowId");
    HWND window = nullptr;
    ContextForWindow(windowId, window);
    PostMessageW(window, WM_CLOSE, 0, 0);
    automation_.ForgetWindow(windowId);
    applications_.ForgetWindow(windowId);
    result.result = json::Value::Null();
    return result;
  }
  if (command == "activate") {
    HWND window = nullptr;
    ContextForWindow(RequireString(params, "windowId"), window);
    ActivateWindow(window, token);
    result.result = json::Value::Null();
    return result;
  }
  if (command == "getWindowRect") {
    HWND window = nullptr;
    ContextForWindow(RequireString(params, "windowId"), window);
    result.result = SerializeRect(ClientRectInScreenDips(MeasureWindow(window)));
    return result;
  }
  if (command == "setWindowRect") {
    HWND window = nullptr;
    ContextForWindow(RequireString(params, "windowId"), window);
    const json::Value* rect = params.Find("rect");
    if (rect == nullptr || !rect->IsObject()) {
      Fail(kErrorInvalidParams, "The setWindowRect request is missing its rectangle.");
    }
    if (IsZoomed(window) != FALSE || IsIconic(window) != FALSE) {
      ShowWindow(window, SW_RESTORE);
    }
    WindowMetrics metrics = MeasureWindow(window);
    const RectD current = ClientRectInScreenDips(metrics);
    RECT target{};
    target.left = RoundToPixel(PhysicalFromDips(rect->NumberField("x", current.x), metrics.dpi));
    target.top = RoundToPixel(PhysicalFromDips(rect->NumberField("y", current.y), metrics.dpi));
    target.right = target.left + RoundToPixel(PhysicalFromDips(rect->NumberField("width", current.width), metrics.dpi));
    target.bottom =
        target.top + RoundToPixel(PhysicalFromDips(rect->NumberField("height", current.height), metrics.dpi));
    const DWORD style = static_cast<DWORD>(GetWindowLongPtrW(window, GWL_STYLE));
    const DWORD exStyle = static_cast<DWORD>(GetWindowLongPtrW(window, GWL_EXSTYLE));
    RECT frame = target;
    if (AdjustWindowRectExForDpi(&frame, style, GetMenu(window) != nullptr ? TRUE : FALSE, exStyle, metrics.dpi) ==
        FALSE) {
      FailLastError(kErrorInvalidParams, "Computing the window frame for the requested client size", GetLastError());
    }
    // DWM frames, custom title bars, and per-window minimums make the computed
    // frame an estimate, so converge on the requested client area by measuring.
    for (int attempt = 0; attempt < 4; attempt += 1) {
      token.ThrowIfCancelled();
      if (SetWindowPos(window, nullptr, frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top,
                       SWP_NOZORDER | SWP_NOACTIVATE) == FALSE) {
        FailLastError(kErrorInvalidParams, "Moving the window", GetLastError());
      }
      token.Wait(16);
      metrics = MeasureWindow(window);
      const long deltaX = target.left - metrics.clientOrigin.x;
      const long deltaY = target.top - metrics.clientOrigin.y;
      const long deltaWidth = (target.right - target.left) - metrics.clientSize.cx;
      const long deltaHeight = (target.bottom - target.top) - metrics.clientSize.cy;
      if (deltaX == 0 && deltaY == 0 && deltaWidth == 0 && deltaHeight == 0) {
        break;
      }
      const RECT adjusted{frame.left + deltaX, frame.top + deltaY, frame.right + deltaX + deltaWidth,
                          frame.bottom + deltaY + deltaHeight};
      if (adjusted.left == frame.left && adjusted.top == frame.top && adjusted.right == frame.right &&
          adjusted.bottom == frame.bottom) {
        break;
      }
      frame = adjusted;
    }
    result.result = SerializeRect(ClientRectInScreenDips(MeasureWindow(window)));
    return result;
  }
  if (command == "find") {
    const json::Value* root = params.Find("root");
    const json::Value* selector = params.Find("selector");
    if (root == nullptr || !root->IsObject() || selector == nullptr || !selector->IsObject()) {
      Fail(kErrorInvalidParams, "The find request requires a root and a selector.");
    }
    HWND window = nullptr;
    const WindowContext context = ContextForWindow(RequireString(*root, "windowId"), window);
    Selector parsed;
    parsed.strategy = selector->StringField("strategy");
    parsed.value = selector->StringField("value");
    result.result = json::Value::Array();
    for (const ElementSnapshot& snapshot :
         automation_.Find(context, root->StringField("elementId"), parsed, token)) {
      result.result.Append(SerializeSnapshot(snapshot));
    }
    return result;
  }
  if (command == "snapshot") {
    result.result = SerializeSnapshot(RequireLiveElement(RequireString(params, "elementId"), token));
    return result;
  }
  if (command == "activeElement") {
    HWND window = nullptr;
    const WindowContext context = ContextForWindow(RequireString(params, "windowId"), window);
    const std::optional<ElementSnapshot> snapshot = automation_.ActiveElement(context, token);
    result.result = snapshot ? SerializeSnapshot(*snapshot) : json::Value::Null();
    return result;
  }
  if (command == "hitTest") {
    HWND window = nullptr;
    const WindowContext context = ContextForWindow(RequireString(params, "windowId"), window);
    const WindowMetrics metrics = MeasureWindow(window);
    const POINT point =
        ClientDipsToPhysicalPoint(params.NumberField("x", 0.0), params.NumberField("y", 0.0), metrics);
    const std::optional<ElementSnapshot> snapshot = automation_.HitTest(context, point, token);
    result.result = snapshot ? SerializeSnapshot(*snapshot) : json::Value::Null();
    return result;
  }
  if (command == "click") {
    const std::string elementId = RequireString(params, "elementId");
    const std::string mode = params.StringField("mode", "auto");
    RequireLiveElement(elementId, token);
    if (mode == "accessibility") {
      automation_.AccessibilityClick(elementId, token);
      result.result = json::Value::Null();
      return result;
    }
    if (mode != "physical" && mode != "auto") {
      Fail(kErrorInvalidParams, "Click mode \"" + mode + "\" is not supported.");
    }
    if (!input_.PhysicalInputAvailable()) {
      if (mode == "auto") {
        automation_.AccessibilityClick(elementId, token);
        result.result = json::Value::Null();
        return result;
      }
      Fail(kErrorInputUnavailable, "Physical pointer input is unavailable on this desktop.");
    }
    RunPhysical(token, [&]() {
      const ElementRecord& record = automation_.RequireRecord(elementId);
      if (record.window != nullptr) {
        // The server activates the window explicitly before a click; this is a
        // best-effort refresh that must not mask the click failure itself.
        TryActivateWindow(record.window, token);
      }
      const ElementSnapshot snapshot = RequireLiveElement(elementId, token);
      if (IsEmptyRect(snapshot.physicalRect)) {
        Fail(kErrorNotInteractable, "The element does not occupy a clickable area.");
      }
      POINT center{};
      center.x = (snapshot.physicalRect.left + snapshot.physicalRect.right) / 2;
      center.y = (snapshot.physicalRect.top + snapshot.physicalRect.bottom) / 2;
      input_.ClickAt(center, token);
    });
    result.result = json::Value::Null();
    return result;
  }
  if (command == "focus") {
    const std::string elementId = RequireString(params, "elementId");
    const ElementRecord& record = automation_.RequireRecord(elementId);
    const ElementSnapshot snapshot = RequireLiveElement(elementId, token);
    if (snapshot.enabled.supported && !snapshot.enabled.value) {
      Fail(kErrorNotInteractable, "The element is disabled and cannot receive keyboard focus.");
    }
    if (record.window != nullptr) {
      TryActivateWindow(record.window, token);
    }
    automation_.SetFocus(elementId);
    for (int attempt = 0; attempt < 10 && !automation_.HasKeyboardFocus(elementId); attempt += 1) {
      token.Wait(20);
    }
    if (!automation_.HasKeyboardFocus(elementId)) {
      Fail(kErrorNotInteractable, "The element did not take keyboard focus.");
    }
    result.result = json::Value::Null();
    return result;
  }
  if (command == "clear") {
    const std::string elementId = RequireString(params, "elementId");
    RequireLiveElement(elementId, token);
    if (!automation_.TryClearValue(elementId)) {
      // Only take focus when the physical fallback can actually run, so a
      // failed clear never leaves the application in a changed focus state.
      if (!input_.PhysicalInputAvailable()) {
        Fail(kErrorInputUnavailable,
             "The element does not expose a writable value and physical input is unavailable on this desktop.");
      }
      RunPhysical(token, [&]() {
        automation_.SetFocus(elementId);
        token.Wait(16);
        input_.PressChord({VK_CONTROL, 'A'}, token);
        input_.PressChord({VK_DELETE}, token);
      });
    }
    result.result = json::Value::Null();
    return result;
  }
  if (command == "sendKeys") {
    const std::string elementId = RequireString(params, "elementId");
    const json::Value* text = params.Find("text");
    if (text == nullptr || !text->IsString()) {
      Fail(kErrorInvalidParams, "The sendKeys request requires a string \"text\".");
    }
    if (!input_.PhysicalInputAvailable()) {
      Fail(kErrorInputUnavailable, "Physical keyboard input is unavailable on this desktop.");
    }
    RequireLiveElement(elementId, token);
    RunPhysical(token, [&]() {
      const ElementRecord& record = automation_.RequireRecord(elementId);
      if (record.window != nullptr) {
        TryActivateWindow(record.window, token);
      }
      automation_.SetFocus(elementId);
      for (int attempt = 0; attempt < 10 && !automation_.HasKeyboardFocus(elementId); attempt += 1) {
        token.Wait(20);
      }
      if (!automation_.HasKeyboardFocus(elementId)) {
        Fail(kErrorNotInteractable, "The element did not take keyboard focus, so text could not be typed.");
      }
      input_.TypeText(text->AsWide(), token);
    });
    result.result = json::Value::Null();
    return result;
  }
  if (command == "performActions") {
    const json::Value* actions = params.Find("actions");
    if (actions == nullptr) {
      Fail(kErrorInvalidParams, "The performActions request is missing its actions.");
    }
    // One command owns physical input for its entire tick sequence.
    RunPhysical(token, [&]() { PerformActions(*actions, token); });
    result.result = json::Value::Null();
    return result;
  }
  if (command == "releaseActions") {
    RunPhysical(token, [&]() { input_.ReleaseAll(); });
    result.result = json::Value::Null();
    return result;
  }
  if (command == "captureWindow") {
    HWND window = nullptr;
    ContextForWindow(RequireString(params, "windowId"), window);
    return EncodeCapture(window, RECT{}, false, token);
  }
  if (command == "captureElement") {
    const std::string elementId = RequireString(params, "elementId");
    const ElementSnapshot snapshot = RequireLiveElement(elementId, token);
    const ElementRecord& record = automation_.RequireRecord(elementId);
    if (record.window == nullptr || IsWindow(record.window) == FALSE) {
      Fail(kErrorStaleElement, "The element no longer belongs to a live window.");
    }
    if (IsEmptyRect(snapshot.physicalRect)) {
      Fail(kErrorUnsupported, "The element does not occupy a capturable area.");
    }
    return EncodeCapture(record.window, snapshot.physicalRect, true, token);
  }
  if (command == "source") {
    HWND window = nullptr;
    const WindowContext context = ContextForWindow(RequireString(params, "windowId"), window);
    result.result =
        json::Value::String(automation_.SerializeSourceXml(automation_.SnapshotWindowTree(context, token)));
    return result;
  }
  if (command == "tree") {
    HWND window = nullptr;
    const WindowContext context = ContextForWindow(RequireString(params, "windowId"), window);
    result.result = json::Value::Array();
    for (const ElementSnapshot& snapshot : automation_.SnapshotWindowTree(context, token)) {
      result.result.Append(SerializeSnapshot(snapshot));
    }
    return result;
  }
  if (command == "dispose") {
    ReleaseInput();
    applications_.Dispose(token);
    automation_.Reset();
    result.result = json::Value::Null();
    return result;
  }

  Fail(kErrorUnsupported, "The Windows helper does not implement the \"" + command + "\" command.");
}

}  // namespace furn
