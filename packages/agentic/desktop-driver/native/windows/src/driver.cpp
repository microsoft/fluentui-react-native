#include "driver.h"

#include <algorithm>
#include <cmath>

#include <psapi.h>

#include "settlement.h"

namespace furn {
namespace {

// Commands that change application or window state. Observation, input
// release, lifecycle cleanup, and disposal stay available while a mutation is
// unsettled so the session can be re-observed and shut down safely.
bool IsGuardedMutation(const std::string& command) {
  return command == "click" || command == "clear" || command == "sendKeys" || command == "performActions" ||
         command == "activate" || command == "setWindowRect" || command == "performAccessibilityAction";
}

json::Value EffectDetail(MutationEffect effect) {
  json::Value detail = json::Value::Object();
  detail.Set("effect", json::Value::String(std::string(MutationEffectName(effect))));
  return detail;
}

json::Value SerializeRect(const RectD& rect) {
  json::Value value = json::Value::Object();
  value.Set("height", json::Value::Number(rect.height));
  value.Set("width", json::Value::Number(rect.width));
  value.Set("x", json::Value::Number(rect.x));
  value.Set("y", json::Value::Number(rect.y));
  return value;
}

constexpr unsigned int kPostedMoveSettleMs = 250;

// Waits until a move posted with SWP_ASYNCWINDOWPOS changes the window frame.
// A window may clamp or refuse a move, so a frame that stays put is accepted
// once the window answers messages; one that stops answering fails instead.
void AwaitPostedMove(HWND window, const RECT& before, const CancellationToken& token) {
  const Deadline deadline(kPostedMoveSettleMs);
  while (true) {
    RECT now{};
    if (GetWindowRect(window, &now) == FALSE || EqualRect(&now, &before) == FALSE) {
      return;
    }
    if (deadline.Expired()) {
      RequireWindowResponds(window, token);
      return;
    }
    token.Wait(16);
  }
}

std::string RequireString(const json::Value& params, std::string_view key) {
  const json::Value* value = params.Find(key);
  if (value == nullptr || !value->IsString() || value->AsString().empty()) {
    Fail(kErrorInvalidParams, "The request is missing the required \"" + std::string(key) + "\" parameter.");
  }
  return value->AsString();
}

// The clear mechanism a request names, or empty when the helper may choose.
// Anything else is refused before dispatch.
std::string RequireClearMechanism(const json::Value& params) {
  const json::Value* mechanism = params.Find("mechanism");
  if (mechanism == nullptr) {
    return {};
  }
  if (!mechanism->IsString() || (mechanism->AsString() != "semantic" && mechanism->AsString() != "keyboard")) {
    Fail(kErrorInvalidParams, "The clear mechanism must be \"semantic\" or \"keyboard\".");
  }
  return mechanism->AsString();
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

// Journals only the identifiers that correlate a command with window events,
// never text or native handles.
json::Value JournalDetail(const json::Value& params) {
  json::Value detail = json::Value::Object();
  for (const char* key : {"elementId", "windowId", "mode"}) {
    const json::Value* value = params.Find(key);
    if (value != nullptr && value->IsString()) {
      detail.Set(key, json::Value::String(BoundedText(value->AsString(), 128)));
    }
  }
  return detail;
}

json::Value JournalResult(const std::string& command, const json::Value& result) {
  json::Value detail = json::Value::Object();
  if (command != "windows" || !result.IsArray()) {
    return detail;
  }
  json::Value windowIds = json::Value::Array();
  for (const json::Value& window : result.Items()) {
    const json::Value* id = window.Find("id");
    if (id != nullptr && id->IsString()) {
      windowIds.Append(json::Value::String(id->AsString()));
    }
  }
  detail.Set("windowIds", std::move(windowIds));
  return detail;
}

// Retention evidence for qualification runs: what the helper tracks and what it
// holds. The memory figures are left out when the system does not report them.
json::Value RetentionDiagnostic(const Automation& automation) {
  json::Value retention = json::Value::Object();
  PROCESS_MEMORY_COUNTERS_EX counters{};
  counters.cb = sizeof(counters);
  const bool measured = GetProcessMemoryInfo(GetCurrentProcess(), reinterpret_cast<PROCESS_MEMORY_COUNTERS*>(&counters),
                                             sizeof(counters)) != FALSE;
  if (measured) {
    retention.Set("privateBytes", json::Value::Integer(static_cast<std::int64_t>(counters.PrivateUsage)));
  }
  retention.Set("retainedElementLimit",
                json::Value::Integer(static_cast<std::int64_t>(automation.RetainedElementLimit())));
  retention.Set("retainedElements", json::Value::Integer(static_cast<std::int64_t>(automation.RetainedElementCount())));
  if (measured) {
    retention.Set("workingSetBytes", json::Value::Integer(static_cast<std::int64_t>(counters.WorkingSetSize)));
  }
  return retention;
}

}  // namespace

bool IsTrackedMutation(const std::string& command) {
  return IsGuardedMutation(command) || command == "closeWindow" || command == "releaseActions";
}

ClickRoute RouteClick(const std::string& mode, bool physicalAvailable) {
  if (mode == "accessibility") {
    return ClickRoute::Accessibility;
  }
  if (mode != "physical" && mode != "auto") {
    Fail(kErrorInvalidParams, "Click mode \"" + mode + "\" is not supported.");
  }
  if (physicalAvailable) {
    return ClickRoute::Physical;
  }
  return mode == "auto" ? ClickRoute::Accessibility : ClickRoute::Unavailable;
}

bool ActionsPressKeys(const json::Value& actions) {
  if (!actions.IsArray()) {
    return false;
  }
  for (const json::Value& source : actions.Items()) {
    const json::Value* list = source.Find("actions");
    if (source.StringField("type", "none") != "key" || list == nullptr || !list->IsArray()) {
      continue;
    }
    for (const json::Value& action : list->Items()) {
      // The null key releases everything instead of pressing a key, and an
      // empty value is rejected by validation before anything is sent.
      const std::wstring value = action.WideField("value");
      if (action.StringField("type") == "keyDown" && !value.empty() && value != L"\uE000") {
        return true;
      }
    }
  }
  return false;
}

void RequireKeyboardTarget(const ApplicationManager& applications, InputController& input, HWND window,
                           HWND foreground) {
  applications.RequireForegroundOwnedBy(window, foreground);
  DWORD processId = 0;
  GetWindowThreadProcessId(foreground, &processId);
  input.RequireIntegrityFor(processId);
}

void RequireClickPointOwnedBy(HWND window, POINT point, ClickHitTester hitTest) {
  if (window == nullptr) {
    return;
  }
  const HWND hit = hitTest(point);
  if (hit == nullptr || GetAncestor(hit, GA_ROOTOWNER) == GetAncestor(window, GA_ROOTOWNER)) {
    return;
  }
  DWORD hitProcess = 0;
  DWORD windowProcess = 0;
  GetWindowThreadProcessId(hit, &hitProcess);
  GetWindowThreadProcessId(window, &windowProcess);
  if (hitProcess == windowProcess) {
    return;
  }
  Fail(kErrorNotInteractable, "A window of another application, " + DescribeWindowHandle(hit) +
                                  ", covers the point where the element would be clicked, so the click was not "
                                  "sent.");
}

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

InputVerdict Driver::ClickAvailability(const std::string& elementId) {
  DWORD processId = 0;
  if (const HWND window = automation_.RequireRecord(elementId).window; window != nullptr) {
    GetWindowThreadProcessId(window, &processId);
  }
  return input_.AvailabilityFor(processId);
}

std::string Driver::LeaseIdForElement(const std::string& elementId) {
  try {
    const ApplicationLease* lease = applications_.LeaseForWindow(automation_.RequireRecord(elementId).window);
    return lease == nullptr ? std::string() : lease->id;
  } catch (const HelperError&) {
    return {};
  }
}

HWND Driver::FocusForKeyboard(const std::string& elementId, const CancellationToken& token) {
  const HWND window = automation_.RequireRecord(elementId).window;
  if (window == nullptr || IsWindow(window) == FALSE) {
    Fail(kErrorStaleElement, "The element no longer belongs to a live window.");
  }
  DWORD processId = 0;
  GetWindowThreadProcessId(window, &processId);
  input_.RequireInputFor(processId);
  // Keys follow the foreground window, so a window that did not become the
  // foreground fails here instead of typing into whatever is.
  ActivateWindow(window, token);
  automation_.SetFocus(elementId);
  HRESULT focusFailure = S_OK;
  for (int attempt = 0; attempt < 10 && !automation_.HasKeyboardFocus(elementId, focusFailure); attempt += 1) {
    token.Wait(20);
  }
  if (!automation_.HasKeyboardFocus(elementId, focusFailure)) {
    if (FAILED(focusFailure)) {
      FailHresult(kErrorAutomationFailed, "Reading the element focus state", focusFailure);
    }
    Fail(kErrorNotInteractable, "The element did not take keyboard focus, so keys were not sent.");
  }
  return window;
}

InputController::KeyboardGuard Driver::KeyboardGuardFor(HWND window) {
  return [this, window]() { RequireKeyboardTarget(applications_, input_, window, ForegroundWindow()); };
}

void Driver::ClickPhysically(const std::string& elementId, const CancellationToken& token) {
  // Copied because resolving the element again can change the record table.
  const HWND window = automation_.RequireRecord(elementId).window;
  if (window != nullptr) {
    // The server activates the window explicitly before a click; this is a
    // best-effort refresh that must not mask the click failure itself.
    ActivateBestEffort(window, token);
  }
  const ElementSnapshot snapshot = RequireLiveElement(elementId, token);
  if (IsEmptyRect(snapshot.physicalRect)) {
    Fail(kErrorNotInteractable, "The element does not occupy a clickable area.");
  }
  POINT center{};
  center.x = (snapshot.physicalRect.left + snapshot.physicalRect.right) / 2;
  center.y = (snapshot.physicalRect.top + snapshot.physicalRect.bottom) / 2;
  RequireClickPointOwnedBy(window, center, hitTester_);
  input_.ClickAt(center, token);
}

void Driver::RequirePointerOverLeasedApplication(POINT point) const {
  if (applications_.PrimaryLease() == nullptr) {
    return;
  }
  const HWND hit = hitTester_(point);
  if (hit == nullptr || applications_.ForegroundBelongsToApplication(nullptr, hit)) {
    return;
  }
  // A frame host, such as the one around a packaged application, can own the
  // top-level window above the application's own content.
  const HWND root = GetAncestor(hit, GA_ROOT);
  if (root != nullptr && root != hit && applications_.ForegroundBelongsToApplication(nullptr, root)) {
    return;
  }
  Fail(kErrorNotInteractable, "A window of another application, " + DescribeWindowHandle(hit) +
                                  ", covers the pointer position, so the pointer input was not sent.");
}

json::Value Driver::ProbeResult(const json::Value& params) {
  // Re-read on every probe: a session that is locked now can be unlocked when
  // the next probe runs.
  const bool physical = input_.Availability().available;
  const bool screenshot = capture_.Available();
  json::Value features = json::Value::Object();
  features.Set("accessibilityActions", json::Value::Bool(true));
  features.Set("performAccessibilityAction", json::Value::Bool(true));
  features.Set("accessibilityClick", json::Value::Bool(true));
  features.Set("boundedObservation", json::Value::Bool(true));
  features.Set("elementScreenshot", json::Value::Bool(screenshot));
  features.Set("focus", json::Value::Bool(true));
  features.Set("keyboard", json::Value::Bool(physical));
  features.Set("physicalClick", json::Value::Bool(physical));
  features.Set("screenshot", json::Value::Bool(screenshot));
  features.Set("setWindowRect", json::Value::Bool(true));
  features.Set("strictClear", json::Value::Bool(true));
  features.Set("wheel", json::Value::Bool(physical));
  features.Set("windowEvents", json::Value::Bool(true));

  json::Value result = json::Value::Object();
  result.Set("endpoint", json::Value::String(params.StringField("endpoint", "windows")));
  result.Set("features", features);
  result.Set("platformName", json::Value::String(std::string("windows")));
  result.Set("protocolVersion", json::Value::Integer(1));
  return result;
}

json::Value Driver::WindowSummary(const WindowInfo& info) {
  if (windowSummaryHook_) {
    windowSummaryHook_(info.window);
  }
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
          RequirePointerOverLeasedApplication(input_.pointer());
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
        const POINT scrollPoint = ResolveActionPoint(action, token);
        RequirePointerOverLeasedApplication(scrollPoint);
        input_.MovePointer(scrollPoint, 0, token);
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
    if (input_.HasDepressedInput()) {
      const CancellationToken idle;
      try {
        const PhysicalInputScope scope(idle, kPhysicalInputCleanupWaitMs, AbandonPolicy::Adopt);
        input_.ReleaseAll();
      } catch (const HelperError&) {
        // Continue attempting cleanup even if the cross-process lock could not
        // be acquired.
        input_.ReleaseAll();
      }
    }
  } catch (...) {
    // Releasing input must never mask the original failure.
  }
  // Input that could not be released keeps the lock while the worker lives.
  if (!input_.HasDepressedInput()) {
    heldInput_.Release();
  }
}

json::Value Driver::AdoptWindowForTesting(HWND window, const std::wstring& title) {
  return applications_.SerializeLease(applications_.AdoptWindowForTesting(window, title));
}

void Driver::ForgetRetiredWindows() noexcept {
  try {
    for (const std::string& windowId : applications_.TakeRetiredWindowIds()) {
      automation_.ForgetWindow(windowId);
    }
  } catch (...) {
    // Dropping cached elements must never mask the command outcome.
  }
}

CommandResult Driver::Execute(const std::string& command, const json::Value& params, const CancellationToken& token) {
  // Windows retired by the previous command, or by a destroy notification in
  // between, no longer have addressable elements.
  ForgetRetiredWindows();
  const std::uint64_t entry = journal_.Begin(command, JournalDetail(params));
  const bool tracked = IsTrackedMutation(command);
  effects_.Reset();
  const EffectScope effectScope(effects_);
  const CancellationScope cancellationScope(token);
  // A provider deadline that passed is always unknown, whatever the ledger
  // recorded before it.
  const auto effectOf = [this](const std::string& code) {
    return code == kErrorMutationIndeterminate ? MutationEffect::Unknown : effects_.Effect();
  };
  try {
    CommandResult result = ExecuteCommand(command, params, token);
    ForgetRetiredWindows();
    journal_.Finish(entry, "ok", JournalResult(command, result.result));
    return result;
  } catch (HelperError& error) {
    ForgetRetiredWindows();
    if (!tracked) {
      journal_.Finish(entry, error.code());
      throw;
    }
    error.SetEffect(effectOf(error.code()));
    journal_.Finish(entry, error.code(), EffectDetail(*error.effect()));
    throw;
  } catch (CancelledError& cancelled) {
    ForgetRetiredWindows();
    if (!tracked) {
      journal_.Finish(entry, "cancelled");
      throw;
    }
    cancelled.SetEffect(effects_.Effect());
    journal_.Finish(entry, "cancelled", EffectDetail(*cancelled.effect()));
    throw;
  } catch (const winrt::hresult_error& error) {
    ForgetRetiredWindows();
    journal_.Finish(entry, kErrorInternal, tracked ? EffectDetail(effects_.Effect()) : json::Value::Null());
    if (!tracked) {
      throw;
    }
    HelperError failure(kErrorInternal, ToUtf8(error.message().c_str()));
    failure.SetEffect(effects_.Effect());
    throw failure;
  } catch (const std::exception& error) {
    ForgetRetiredWindows();
    journal_.Finish(entry, kErrorInternal, tracked ? EffectDetail(effects_.Effect()) : json::Value::Null());
    if (!tracked) {
      throw;
    }
    HelperError failure(kErrorInternal, error.what());
    failure.SetEffect(effects_.Effect());
    throw failure;
  } catch (...) {
    ForgetRetiredWindows();
    journal_.Finish(entry, kErrorInternal, tracked ? EffectDetail(effects_.Effect()) : json::Value::Null());
    if (!tracked) {
      throw;
    }
    HelperError failure(kErrorInternal, "The native command failed with an unknown error.");
    failure.SetEffect(effects_.Effect());
    throw failure;
  }
}

CommandResult Driver::ExecuteCommand(const std::string& command, const json::Value& params,
                                     const CancellationToken& token) {
  CommandResult result;
  token.ThrowIfCancelled();
  if (IsGuardedMutation(command)) {
    RequireMutationsAllowed();
  }

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
    for (const WindowInfo& info : applications_.Windows(
             lease->StringField("id"), token,
             [&](HWND window, DWORD processId, ULONGLONG expiresAt) {
               return automation_.HasWindowContent(window, processId, expiresAt, token);
             })) {
      try {
        result.result.Append(WindowSummary(info));
      } catch (const HelperError& error) {
        // A popup can finish closing after enumeration, before its geometry is read.
        if (error.code() != kErrorNoSuchWindow || IsWindow(info.window) != FALSE) {
          throw;
        }
      }
    }
    return result;
  }
  if (command == "windowEvents") {
    const json::Value* lease = params.Find("lease");
    if (lease == nullptr || !lease->IsObject()) {
      Fail(kErrorInvalidParams, "The windowEvents request is missing its lease.");
    }
    result.result = applications_.WindowEventLog(RequireString(*lease, "id"));
    result.result.Set("commands", journal_.Diagnostic());
    result.result.Set("retention", RetentionDiagnostic(automation_));
    return result;
  }
  if (command == "closeWindow") {
    const std::string windowId = RequireString(params, "windowId");
    HWND window = nullptr;
    ContextForWindow(windowId, window);
    automation_.ForgetWindow(windowId);
    applications_.ForgetWindow(windowId);
    if (PostMessageW(window, WM_CLOSE, 0, 0) != FALSE) {
      RecordDelivered();
    }
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
    // Every change below is posted to the window's thread, so a window that
    // stops answering leaves the effect unknown instead of blocking the helper.
    RequireWindowResponds(window, token);
    if (IsZoomed(window) != FALSE || IsIconic(window) != FALSE) {
      RecordDispatching();
      const bool restored = RestoreWindow(window, token);
      if (!restored) {
        RequireWindowResponds(window, token);
      }
      RecordSettled(S_OK);
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
      RECT before{};
      if (GetWindowRect(window, &before) == FALSE || EqualRect(&before, &frame) == FALSE) {
        if (SetWindowPos(window, nullptr, frame.left, frame.top, frame.right - frame.left, frame.bottom - frame.top,
                         SWP_NOZORDER | SWP_NOACTIVATE | SWP_ASYNCWINDOWPOS) == FALSE) {
          FailLastError(kErrorInvalidParams, "Moving the window", GetLastError());
        }
        RecordDispatching();
        AwaitPostedMove(window, before, token);
        RecordSettled(S_OK);
      }
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
  if (command == "observe") {
    const ObserveRequest request = ParseObserveRequest(params);
    HWND window = nullptr;
    const WindowContext context = ContextForWindow(request.windowId, window);
    result.result = automation_.Observe(context, request, token).ToJson();
    return result;
  }
  if (command == "releaseElements") {
    const std::vector<std::string> ids = ParseReleaseElementsRequest(params);
    json::Value released = json::Value::Object();
    released.Set("released", json::Value::Integer(static_cast<std::int64_t>(automation_.ReleaseElements(ids))));
    result.result = std::move(released);
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
    const MutationScope scope(LeaseIdForElement(elementId));
    InputVerdict availability;
    if (mode != "accessibility") {
      availability = ClickAvailability(elementId);
    }
    switch (RouteClick(mode, availability.available)) {
      case ClickRoute::Accessibility:
        automation_.AccessibilityClick(elementId, token);
        break;
      case ClickRoute::Unavailable:
        Fail(kErrorInputUnavailable, availability.reason);
      case ClickRoute::Physical:
        try {
          RunPhysical(token, [&]() { ClickPhysically(elementId, token); });
        } catch (const HelperError& error) {
          // The environment can change between the check and the click. When
          // it refused before any click was delivered, automatic mode still
          // has the accessibility click.
          if (mode != "auto" || error.code() != kErrorInputUnavailable || input_.HasDepressedInput()) {
            throw;
          }
          automation_.AccessibilityClick(elementId, token);
        }
        break;
    }
    result.result = json::Value::Null();
    return result;
  }
  if (command == "accessibilityActions") {
    result.result = automation_.AccessibilityActions(RequireString(params, "elementId"), token);
    return result;
  }
  if (command == "performAccessibilityAction") {
    const std::string elementId = RequireString(params, "elementId");
    const std::string key = RequireString(params, "key");
    if (key.size() > 128) {
      Fail(kErrorInvalidParams, "The action key exceeds 128 bytes.");
    }
    RequireLiveElement(elementId, token);
    const MutationScope scope(LeaseIdForElement(elementId));
    automation_.PerformAccessibilityAction(elementId, key, token);
    result.result = json::Value::Null();
    return result;
  }
  if (command == "clear") {
    const std::string elementId = RequireString(params, "elementId");
    const std::string mechanism = RequireClearMechanism(params);
    RequireLiveElement(elementId, token);
    const MutationScope scope(LeaseIdForElement(elementId));
    const bool semantic = mechanism != "keyboard" && automation_.TryClearValue(elementId, mechanism == "semantic");
    if (!semantic && mechanism == "semantic") {
      Fail(kErrorInternal, "The semantic clear ended without clearing or failing.");
    }
    if (!semantic) {
      RunPhysical(token, [&]() {
        const HWND window = FocusForKeyboard(elementId, token);
        const KeyboardGuardScope guard(input_, KeyboardGuardFor(window));
        input_.PressChord({VK_CONTROL, 'A'}, token);
        input_.PressChord({VK_DELETE}, token);
      });
    }
    result.result = json::Value::Object();
    result.result.Set("mechanism", json::Value::String(std::string(semantic ? "semantic" : "keyboard")));
    return result;
  }
  if (command == "sendKeys") {
    const std::string elementId = RequireString(params, "elementId");
    const json::Value* text = params.Find("text");
    if (text == nullptr || !text->IsString()) {
      Fail(kErrorInvalidParams, "The sendKeys request requires a string \"text\".");
    }
    RequireLiveElement(elementId, token);
    const MutationScope scope(LeaseIdForElement(elementId));
    RunPhysical(token, [&]() {
      const HWND window = FocusForKeyboard(elementId, token);
      const KeyboardGuardScope guard(input_, KeyboardGuardFor(window));
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
    RunPhysical(token, [&]() {
      if (!ActionsPressKeys(*actions)) {
        PerformActions(*actions, token);
        return;
      }
      // Keys go to the foreground window. Bring the application forward only
      // when something else holds it, so a popup the application owns keeps its
      // focus, and refuse every press that would reach another application.
      if (!applications_.ForegroundBelongsToApplication(nullptr, ForegroundWindow())) {
        if (const ApplicationLease* lease = applications_.PrimaryLease();
            lease != nullptr && lease->primaryWindow != nullptr && IsWindow(lease->primaryWindow) != FALSE) {
          ActivateBestEffort(lease->primaryWindow, token);
        }
      }
      const KeyboardGuardScope guard(input_, KeyboardGuardFor(nullptr));
      PerformActions(*actions, token);
    });
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
    if (input_.HasDepressedInput()) {
      Fail(kErrorInputFailed, "The helper could not release all held physical input during disposal.");
    }
    applications_.Dispose(token);
    automation_.Reset();
    result.result = json::Value::Null();
    return result;
  }

  Fail(kErrorUnsupported, "The Windows helper does not implement the \"" + command + "\" command.");
}

}  // namespace furn
