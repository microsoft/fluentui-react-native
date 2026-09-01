#include "automation.h"

#include <algorithm>
#include <array>
#include <atomic>
#include <functional>
#include <iterator>
#include <memory>
#include <thread>

namespace furn {
namespace {

constexpr std::size_t kMaximumAncestorWalk = 64;
// Provider mutations run on their application's UI thread, which a suspended or
// busy application can stall indefinitely. Every mutation therefore runs as a
// bounded step that reports an explicit failure instead of wedging the helper.
constexpr DWORD kMutationTimeoutMs = 5000;

struct BoundedState {
  std::atomic<HRESULT> result{E_PENDING};
  HANDLE done{nullptr};

  ~BoundedState() {
    if (done != nullptr) {
      CloseHandle(done);
    }
  }
};

HRESULT RunBounded(std::function<HRESULT()> call, DWORD timeoutMs, bool& completed) {
  const auto state = std::make_shared<BoundedState>();
  state->done = CreateEventW(nullptr, TRUE, FALSE, nullptr);
  if (state->done == nullptr) {
    completed = true;
    return call();
  }
  std::thread worker([state, call]() {
    const HRESULT initialized = CoInitializeEx(nullptr, COINIT_MULTITHREADED);
    state->result.store(call());
    SetEvent(state->done);
    if (SUCCEEDED(initialized)) {
      CoUninitialize();
    }
  });
  worker.detach();
  completed = WaitForSingleObject(state->done, timeoutMs) == WAIT_OBJECT_0;
  return completed ? state->result.load() : E_PENDING;
}

template <typename Fn>
HRESULT BoundedCall(Fn&& call, std::string_view operation, std::string code) {
  bool completed = false;
  const HRESULT result = RunBounded(std::function<HRESULT()>(std::forward<Fn>(call)), kMutationTimeoutMs, completed);
  if (!completed) {
    Fail(std::move(code),
         std::string(operation) + " did not complete within " + std::to_string(kMutationTimeoutMs) + " ms.");
  }
  return result;
}

// Small RAII wrapper so every cached property read clears its VARIANT.
class Variant {
 public:
  Variant() { VariantInit(&value_); }
  ~Variant() { VariantClear(&value_); }
  Variant(const Variant&) = delete;
  Variant& operator=(const Variant&) = delete;

  VARIANT* put() {
    VariantClear(&value_);
    VariantInit(&value_);
    return &value_;
  }

  const VARIANT& get() const noexcept { return value_; }
  VARTYPE type() const noexcept { return value_.vt; }

 private:
  VARIANT value_{};
};

struct RoleMapping {
  CONTROLTYPEID controlType;
  const char* role;
};

constexpr RoleMapping kRoleMappings[] = {
    {UIA_ButtonControlTypeId, "button"},         {UIA_CalendarControlTypeId, "calendar"},
    {UIA_CheckBoxControlTypeId, "checkbox"},     {UIA_ComboBoxControlTypeId, "combobox"},
    {UIA_EditControlTypeId, "textbox"},          {UIA_HyperlinkControlTypeId, "link"},
    {UIA_ImageControlTypeId, "image"},           {UIA_ListItemControlTypeId, "listitem"},
    {UIA_ListControlTypeId, "list"},             {UIA_MenuControlTypeId, "menu"},
    {UIA_MenuBarControlTypeId, "menubar"},       {UIA_MenuItemControlTypeId, "menuitem"},
    {UIA_ProgressBarControlTypeId, "progressbar"}, {UIA_RadioButtonControlTypeId, "radio"},
    {UIA_ScrollBarControlTypeId, "scrollbar"},   {UIA_SliderControlTypeId, "slider"},
    {UIA_SpinnerControlTypeId, "spinbutton"},    {UIA_StatusBarControlTypeId, "status"},
    {UIA_TabControlTypeId, "tablist"},           {UIA_TabItemControlTypeId, "tab"},
    {UIA_TextControlTypeId, "text"},             {UIA_ToolBarControlTypeId, "toolbar"},
    {UIA_ToolTipControlTypeId, "tooltip"},       {UIA_TreeControlTypeId, "tree"},
    {UIA_TreeItemControlTypeId, "treeitem"},     {UIA_CustomControlTypeId, "custom"},
    {UIA_GroupControlTypeId, "group"},           {UIA_ThumbControlTypeId, "thumb"},
    {UIA_DataGridControlTypeId, "grid"},         {UIA_DataItemControlTypeId, "dataitem"},
    {UIA_DocumentControlTypeId, "document"},     {UIA_SplitButtonControlTypeId, "splitbutton"},
    {UIA_WindowControlTypeId, "window"},         {UIA_PaneControlTypeId, "pane"},
    {UIA_HeaderControlTypeId, "header"},         {UIA_HeaderItemControlTypeId, "headeritem"},
    {UIA_TableControlTypeId, "table"},           {UIA_TitleBarControlTypeId, "titlebar"},
    {UIA_SeparatorControlTypeId, "separator"},   {UIA_SemanticZoomControlTypeId, "semanticzoom"},
    {UIA_AppBarControlTypeId, "appbar"},
};

struct RoleAlias {
  const char* query;
  const char* role;
};

constexpr RoleAlias kRoleAliases[] = {
    {"edit", "textbox"},     {"input", "textbox"},    {"textfield", "textbox"}, {"hyperlink", "link"},
    {"radiobutton", "radio"},{"checkbox", "checkbox"},{"combo box", "combobox"},{"listbox", "list"},
    {"statusbar", "status"}, {"tabitem", "tab"},      {"tablist", "tablist"},   {"progress", "progressbar"},
    {"spinner", "spinbutton"},{"application", "window"},
};

std::string BstrToUtf8(BSTR value) {
  if (value == nullptr) {
    return {};
  }
  return ToUtf8(std::wstring_view(value, SysStringLen(value)));
}

std::string VariantString(const VARIANT& value) {
  if (value.vt != VT_BSTR || value.bstrVal == nullptr) {
    return {};
  }
  return BstrToUtf8(value.bstrVal);
}

std::string EscapeXml(std::string_view value) {
  std::string output;
  output.reserve(value.size());
  for (const char character : value) {
    switch (character) {
      case '&':
        output += "&amp;";
        break;
      case '<':
        output += "&lt;";
        break;
      case '>':
        output += "&gt;";
        break;
      case '"':
        output += "&quot;";
        break;
      case '\'':
        output += "&apos;";
        break;
      default:
        if (static_cast<unsigned char>(character) < 0x20 && character != '\t' && character != '\n' &&
            character != '\r') {
          output += ' ';
        } else {
          output.push_back(character);
        }
        break;
    }
  }
  return output;
}

json::Value SerializeSupported(const SupportedBool& state) {
  json::Value value = json::Value::Object();
  if (state.supported) {
    value.Set("supported", json::Value::Bool(true));
    value.Set("value", json::Value::Bool(state.value));
  } else {
    value.Set("supported", json::Value::Bool(false));
    value.Set("reason", json::Value::String(state.reason));
  }
  return value;
}

json::Value SerializeChecked(const SupportedChecked& state) {
  json::Value value = json::Value::Object();
  if (!state.supported) {
    value.Set("supported", json::Value::Bool(false));
    value.Set("reason", json::Value::String(state.reason));
    return value;
  }
  value.Set("supported", json::Value::Bool(true));
  if (state.value == CheckedValue::Mixed) {
    value.Set("value", json::Value::String(std::string("mixed")));
  } else {
    value.Set("value", json::Value::Bool(state.value == CheckedValue::True));
  }
  return value;
}

SupportedBool Unsupported(std::string reason) {
  SupportedBool state;
  state.supported = false;
  state.reason = std::move(reason);
  return state;
}

std::string FormatNumber(double value) {
  return json::Value::Number(RoundToHundredths(value)).Serialize();
}

}  // namespace

std::string RoleForControlType(CONTROLTYPEID controlType) {
  for (const RoleMapping& mapping : kRoleMappings) {
    if (mapping.controlType == controlType) {
      return mapping.role;
    }
  }
  return "unknown";
}

std::string NormalizeRoleQuery(std::string_view value) {
  std::string normalized = ToLowerAscii(TrimAscii(value));
  for (const RoleAlias& alias : kRoleAliases) {
    if (normalized == alias.query) {
      return alias.role;
    }
  }
  return normalized;
}

const char* ScopeName(ElementScope scope) {
  switch (scope) {
    case ElementScope::Application:
      return "application";
    case ElementScope::Preview:
      return "preview";
    case ElementScope::SecondaryWindow:
      return "secondary-window";
    case ElementScope::Chrome:
    default:
      return "chrome";
  }
}

bool MatchesSelector(const ElementSnapshot& snapshot, const Selector& selector) {
  if (selector.strategy == "accessibility id") {
    return !snapshot.automationId.empty() && snapshot.automationId == selector.value;
  }
  if (selector.strategy == "tag name") {
    return snapshot.role == NormalizeRoleQuery(selector.value);
  }
  if (selector.strategy == "link text") {
    return snapshot.name == selector.value;
  }
  if (selector.strategy == "partial link text") {
    return !selector.value.empty() && snapshot.name.find(selector.value) != std::string::npos;
  }
  if (selector.strategy == "-furn:text") {
    return (snapshot.hasText && snapshot.text == selector.value) ||
           (snapshot.hasValue && snapshot.value == selector.value) || snapshot.name == selector.value;
  }
  Fail(kErrorInvalidParams, "Locator strategy \"" + selector.strategy + "\" is not supported.");
}

json::Value SerializeSnapshot(const ElementSnapshot& snapshot) {
  json::Value value = json::Value::Object();
  value.Set("id", json::Value::String(snapshot.id));
  if (!snapshot.automationId.empty()) {
    value.Set("automationId", json::Value::String(snapshot.automationId));
  }
  value.Set("checked", SerializeChecked(snapshot.checked));
  value.Set("enabled", SerializeSupported(snapshot.enabled));
  value.Set("expanded", SerializeSupported(snapshot.expanded));
  value.Set("focused", SerializeSupported(snapshot.focused));
  if (!snapshot.name.empty()) {
    value.Set("name", json::Value::String(snapshot.name));
  }
  if (!snapshot.parentId.empty()) {
    value.Set("parentId", json::Value::String(snapshot.parentId));
  }
  json::Value rect = json::Value::Object();
  rect.Set("height", json::Value::Number(snapshot.rect.height));
  rect.Set("width", json::Value::Number(snapshot.rect.width));
  rect.Set("x", json::Value::Number(snapshot.rect.x));
  rect.Set("y", json::Value::Number(snapshot.rect.y));
  value.Set("rect", rect);
  value.Set("role", json::Value::String(snapshot.role));
  value.Set("scope", json::Value::String(std::string(ScopeName(snapshot.scope))));
  value.Set("selected", SerializeSupported(snapshot.selected));
  if (snapshot.hasText) {
    value.Set("text", json::Value::String(snapshot.text));
  }
  if (snapshot.hasValue) {
    value.Set("value", json::Value::String(snapshot.value));
  }
  value.Set("visible", SerializeSupported(snapshot.visible));
  value.Set("windowId", json::Value::String(snapshot.windowId));
  return value;
}

void Automation::Initialize() {
  if (automation_) {
    return;
  }
  winrt::com_ptr<IUIAutomation> automation;
  HRESULT result = CoCreateInstance(CLSID_CUIAutomation8, nullptr, CLSCTX_INPROC_SERVER,
                                    IID_PPV_ARGS(automation.put()));
  if (FAILED(result)) {
    result = CoCreateInstance(CLSID_CUIAutomation, nullptr, CLSCTX_INPROC_SERVER, IID_PPV_ARGS(automation.put()));
  }
  CheckHresult(kErrorAutomationFailed, "Creating the UI Automation client", result);

  winrt::com_ptr<IUIAutomation2> automation2;
  if (SUCCEEDED(automation->QueryInterface(IID_PPV_ARGS(automation2.put())))) {
    // Bound every cross-process transaction so a hung provider cannot stall the
    // command worker indefinitely.
    automation2->put_ConnectionTimeout(2000);
    automation2->put_TransactionTimeout(5000);
  }

  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation control view",
               automation->get_ControlViewCondition(controlViewCondition_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation raw view",
               automation->get_RawViewCondition(rawViewCondition_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation raw walker",
               automation->get_RawViewWalker(rawWalker_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation not-supported sentinel",
               UiaGetReservedNotSupportedValue(notSupportedValue_.put()));
  automation_ = automation;
}

winrt::com_ptr<IUIAutomationElement> Automation::ParentOf(IUIAutomationElement* element) const {
  winrt::com_ptr<IUIAutomationElement> parent;
  if (!rawWalker_ || FAILED(rawWalker_->GetParentElement(element, parent.put()))) {
    return nullptr;
  }
  return parent;
}

bool Automation::IsNotSupported(const VARIANT& value) const {
  return value.vt == VT_UNKNOWN && value.punkVal != nullptr && notSupportedValue_ &&
         value.punkVal == notSupportedValue_.get();
}

winrt::com_ptr<IUIAutomationCacheRequest> Automation::CreateCacheRequest(TreeScope scope, bool controlViewOnly) const {
  winrt::com_ptr<IUIAutomationCacheRequest> request;
  CheckHresult(kErrorAutomationFailed, "Creating a UI Automation cache request",
               automation_->CreateCacheRequest(request.put()));
  constexpr PROPERTYID properties[] = {
      UIA_RuntimeIdPropertyId,
      UIA_AutomationIdPropertyId,
      UIA_NamePropertyId,
      UIA_ControlTypePropertyId,
      UIA_BoundingRectanglePropertyId,
      UIA_IsEnabledPropertyId,
      UIA_HasKeyboardFocusPropertyId,
      UIA_IsKeyboardFocusablePropertyId,
      UIA_IsOffscreenPropertyId,
      UIA_IsControlElementPropertyId,
      UIA_NativeWindowHandlePropertyId,
      UIA_ProcessIdPropertyId,
      UIA_ValueValuePropertyId,
      UIA_ValueIsReadOnlyPropertyId,
      UIA_LegacyIAccessibleStatePropertyId,
      UIA_LegacyIAccessibleValuePropertyId,
      UIA_ToggleToggleStatePropertyId,
      UIA_ExpandCollapseExpandCollapseStatePropertyId,
      UIA_SelectionItemIsSelectedPropertyId,
      UIA_IsInvokePatternAvailablePropertyId,
      UIA_IsLegacyIAccessiblePatternAvailablePropertyId,
      UIA_IsTogglePatternAvailablePropertyId,
      UIA_IsSelectionItemPatternAvailablePropertyId,
      UIA_IsExpandCollapsePatternAvailablePropertyId,
      UIA_IsValuePatternAvailablePropertyId,
  };
  for (const PROPERTYID property : properties) {
    CheckHresult(kErrorAutomationFailed, "Adding a cached UI Automation property", request->AddProperty(property));
  }
  CheckHresult(kErrorAutomationFailed, "Configuring the cache element mode",
               request->put_AutomationElementMode(AutomationElementMode_Full));
  CheckHresult(kErrorAutomationFailed, "Configuring the cache tree scope", request->put_TreeScope(scope));
  CheckHresult(kErrorAutomationFailed, "Configuring the cache tree filter",
               request->put_TreeFilter(controlViewOnly ? controlViewCondition_.get() : rawViewCondition_.get()));
  return request;
}

winrt::com_ptr<IUIAutomationElement> Automation::RootForWindow(HWND window) const {
  if (window == nullptr || IsWindow(window) == FALSE) {
    Fail(kErrorNoSuchWindow, "The requested window is no longer available.");
  }
  winrt::com_ptr<IUIAutomationElement> element;
  const HRESULT result = automation_->ElementFromHandle(window, element.put());
  if (FAILED(result) || !element) {
    FailHresult(kErrorNoSuchWindow, "Reading the window automation element", result);
  }
  return element;
}

std::wstring Automation::RuntimeKeyFromCache(IUIAutomationElement* element) const {
  Variant variant;
  if (FAILED(element->GetCachedPropertyValue(UIA_RuntimeIdPropertyId, variant.put()))) {
    return {};
  }
  if (variant.type() != (VT_ARRAY | VT_I4) || variant.get().parray == nullptr) {
    return {};
  }
  SAFEARRAY* array = variant.get().parray;
  LONG lower = 0;
  LONG upper = 0;
  if (FAILED(SafeArrayGetLBound(array, 1, &lower)) || FAILED(SafeArrayGetUBound(array, 1, &upper))) {
    return {};
  }
  std::wstring key;
  for (LONG index = lower; index <= upper; index += 1) {
    int component = 0;
    if (FAILED(SafeArrayGetElement(array, &index, &component))) {
      return {};
    }
    key += std::to_wstring(component);
    key += L'.';
  }
  return key;
}

std::wstring Automation::RuntimeKeyLive(IUIAutomationElement* element) const {
  SAFEARRAY* array = nullptr;
  if (FAILED(element->GetRuntimeId(&array)) || array == nullptr) {
    return {};
  }
  LONG lower = 0;
  LONG upper = 0;
  std::wstring key;
  if (SUCCEEDED(SafeArrayGetLBound(array, 1, &lower)) && SUCCEEDED(SafeArrayGetUBound(array, 1, &upper))) {
    for (LONG index = lower; index <= upper; index += 1) {
      int component = 0;
      if (FAILED(SafeArrayGetElement(array, &index, &component))) {
        key.clear();
        break;
      }
      key += std::to_wstring(component);
      key += L'.';
    }
  }
  SafeArrayDestroy(array);
  return key;
}

std::string Automation::RegisterElement(IUIAutomationElement* element, const std::wstring& runtimeKey,
                                        const std::string& windowId, HWND window, const std::string& parentId,
                                        ElementScope scope) {
  std::string id;
  if (!runtimeKey.empty()) {
    const auto existing = idsByRuntimeKey_.find(runtimeKey);
    if (existing != idsByRuntimeKey_.end()) {
      id = existing->second;
    }
  }
  if (id.empty()) {
    id = NextIdentifier("element");
    if (!runtimeKey.empty()) {
      idsByRuntimeKey_.emplace(runtimeKey, id);
    }
  }
  ElementRecord& record = recordsById_[id];
  record.id = id;
  record.element = nullptr;
  record.element.copy_from(element);
  record.windowId = windowId;
  record.window = window;
  record.parentId = parentId;
  record.scope = scope;
  return id;
}

const ElementRecord& Automation::RequireRecord(const std::string& elementId) const {
  const auto record = recordsById_.find(elementId);
  if (record == recordsById_.end()) {
    Fail(kErrorStaleElement, "Element \"" + elementId + "\" is no longer tracked by the native helper.");
  }
  return record->second;
}

ElementSnapshot Automation::ReadSnapshot(IUIAutomationElement* element, const std::string& windowId,
                                         const std::string& parentId, ElementScope scope,
                                         const std::string& knownId) {
  ElementSnapshot snapshot;
  snapshot.id = knownId;
  snapshot.windowId = windowId;
  snapshot.parentId = parentId;
  snapshot.scope = scope;

  Variant variant;
  if (SUCCEEDED(element->GetCachedPropertyValue(UIA_AutomationIdPropertyId, variant.put()))) {
    snapshot.automationId = VariantString(variant.get());
  }
  if (SUCCEEDED(element->GetCachedPropertyValue(UIA_NamePropertyId, variant.put()))) {
    snapshot.name = VariantString(variant.get());
  }

  CONTROLTYPEID controlType = UIA_CustomControlTypeId;
  if (FAILED(element->get_CachedControlType(&controlType))) {
    controlType = UIA_CustomControlTypeId;
  }
  snapshot.role = RoleForControlType(controlType);

  RECT bounds{};
  if (SUCCEEDED(element->get_CachedBoundingRectangle(&bounds))) {
    snapshot.physicalRect = bounds;
  }

  const auto readBool = [&](PROPERTYID property, const char* reason) {
    SupportedBool state;
    if (FAILED(element->GetCachedPropertyValueEx(property, TRUE, variant.put()))) {
      return Unsupported(reason);
    }
    if (IsNotSupported(variant.get()) || variant.type() != VT_BOOL) {
      return Unsupported(reason);
    }
    state.supported = true;
    state.value = variant.get().boolVal != VARIANT_FALSE;
    return state;
  };

  snapshot.enabled = readBool(UIA_IsEnabledPropertyId, "The provider does not report an enabled state.");
  snapshot.focused = readBool(UIA_HasKeyboardFocusPropertyId, "The provider does not report keyboard focus.");
  const SupportedBool focusable =
      readBool(UIA_IsKeyboardFocusablePropertyId, "The provider does not report keyboard focusability.");
  snapshot.keyboardFocusable = focusable.supported && focusable.value;

  const SupportedBool offscreen = readBool(UIA_IsOffscreenPropertyId, "The provider does not report visibility.");
  const bool hasBounds = bounds.right > bounds.left && bounds.bottom > bounds.top;
  snapshot.visible.supported = true;
  if (offscreen.supported) {
    snapshot.visible.value = !offscreen.value && hasBounds;
  } else {
    // The provider is silent about occlusion, so fall back to measured bounds
    // rather than inventing a default state.
    snapshot.visible.value = hasBounds;
  }

  const auto patternAvailable = [&](PROPERTYID property) {
    if (FAILED(element->GetCachedPropertyValueEx(property, TRUE, variant.put()))) {
      return false;
    }
    return !IsNotSupported(variant.get()) && variant.type() == VT_BOOL && variant.get().boolVal != VARIANT_FALSE;
  };

  snapshot.invokePattern = patternAvailable(UIA_IsInvokePatternAvailablePropertyId);
  snapshot.legacyPattern = patternAvailable(UIA_IsLegacyIAccessiblePatternAvailablePropertyId);
  snapshot.togglePattern = patternAvailable(UIA_IsTogglePatternAvailablePropertyId);
  snapshot.selectionItemPattern = patternAvailable(UIA_IsSelectionItemPatternAvailablePropertyId);
  snapshot.expandCollapsePattern = patternAvailable(UIA_IsExpandCollapsePatternAvailablePropertyId);
  snapshot.valuePattern = patternAvailable(UIA_IsValuePatternAvailablePropertyId);
  if (snapshot.role == "group" && snapshot.valuePattern && snapshot.keyboardFocusable) {
    snapshot.role = "textbox";
  }

  if (snapshot.valuePattern) {
    if (SUCCEEDED(element->GetCachedPropertyValueEx(UIA_ValueValuePropertyId, TRUE, variant.put())) &&
        !IsNotSupported(variant.get()) && variant.type() == VT_BSTR) {
      snapshot.value = VariantString(variant.get());
      snapshot.hasValue = true;
    }
    if (SUCCEEDED(element->GetCachedPropertyValueEx(UIA_ValueIsReadOnlyPropertyId, TRUE, variant.put())) &&
        !IsNotSupported(variant.get()) && variant.type() == VT_BOOL) {
      snapshot.valueReadOnly = variant.get().boolVal != VARIANT_FALSE;
    }
  }
  if (!snapshot.hasValue &&
      SUCCEEDED(element->GetCachedPropertyValueEx(UIA_LegacyIAccessibleValuePropertyId, TRUE, variant.put())) &&
      !IsNotSupported(variant.get()) && variant.type() == VT_BSTR) {
    const std::string legacy = VariantString(variant.get());
    if (!legacy.empty()) {
      snapshot.value = legacy;
      snapshot.hasValue = true;
    }
  }

  if (snapshot.role == "text") {
    snapshot.text = snapshot.name;
    snapshot.hasText = !snapshot.text.empty();
  } else if ((snapshot.role == "textbox" || snapshot.role == "document") && snapshot.hasValue) {
    snapshot.text = snapshot.value;
    snapshot.hasText = true;
  }

  if (snapshot.togglePattern &&
      SUCCEEDED(element->GetCachedPropertyValueEx(UIA_ToggleToggleStatePropertyId, TRUE, variant.put())) &&
      !IsNotSupported(variant.get()) && (variant.type() == VT_I4 || variant.type() == VT_INT)) {
    snapshot.checked.supported = true;
    switch (variant.get().lVal) {
      case ToggleState_On:
        snapshot.checked.value = CheckedValue::True;
        break;
      case ToggleState_Indeterminate:
        snapshot.checked.value = CheckedValue::Mixed;
        break;
      default:
        snapshot.checked.value = CheckedValue::False;
        break;
    }
  } else if (
      snapshot.role == "checkbox" && snapshot.legacyPattern &&
      SUCCEEDED(element->GetCachedPropertyValueEx(UIA_LegacyIAccessibleStatePropertyId, TRUE, variant.put())) &&
      !IsNotSupported(variant.get()) && (variant.type() == VT_I4 || variant.type() == VT_INT)) {
    snapshot.checked.supported = true;
    const LONG state = variant.get().lVal;
    if ((state & STATE_SYSTEM_MIXED) != 0) {
      snapshot.checked.value = CheckedValue::Mixed;
    } else {
      snapshot.checked.value = (state & STATE_SYSTEM_CHECKED) != 0 ? CheckedValue::True : CheckedValue::False;
    }
  } else {
    snapshot.checked.supported = false;
    snapshot.checked.reason =
        "The element does not expose Toggle or LegacyIAccessible checked state.";
  }

  if (snapshot.selectionItemPattern &&
      SUCCEEDED(element->GetCachedPropertyValueEx(UIA_SelectionItemIsSelectedPropertyId, TRUE, variant.put())) &&
      !IsNotSupported(variant.get()) && variant.type() == VT_BOOL) {
    snapshot.selected.supported = true;
    snapshot.selected.value = variant.get().boolVal != VARIANT_FALSE;
  } else {
    snapshot.selected = Unsupported("The element does not implement the UI Automation SelectionItem pattern.");
  }

  if (snapshot.expandCollapsePattern &&
      SUCCEEDED(element->GetCachedPropertyValueEx(UIA_ExpandCollapseExpandCollapseStatePropertyId, TRUE,
                                                  variant.put())) &&
      !IsNotSupported(variant.get()) && (variant.type() == VT_I4 || variant.type() == VT_INT)) {
    if (variant.get().lVal == ExpandCollapseState_LeafNode) {
      snapshot.expanded = Unsupported("The element is a leaf node that cannot expand or collapse.");
    } else {
      snapshot.expanded.supported = true;
      snapshot.expanded.value = variant.get().lVal == ExpandCollapseState_Expanded ||
                                variant.get().lVal == ExpandCollapseState_PartiallyExpanded;
    }
  } else {
    snapshot.expanded = Unsupported("The element does not implement the UI Automation ExpandCollapse pattern.");
  }

  return snapshot;
}

std::vector<ElementSnapshot> Automation::WalkCachedSubtree(IUIAutomationElement* root, const WindowContext& context,
                                                           ElementScope rootScope, const std::string& rootParentId,
                                                           const CancellationToken& token, bool controlViewOnly) {
  struct PendingNode {
    winrt::com_ptr<IUIAutomationElement> element;
    std::string parentId;
    ElementScope scope;
  };

  winrt::com_ptr<IUIAutomationElement> cachedRoot;
  const HRESULT result = root->BuildUpdatedCache(CreateCacheRequest(TreeScope_Subtree, controlViewOnly).get(),
                                                 cachedRoot.put());
  if (result == UIA_E_ELEMENTNOTAVAILABLE) {
    Fail(kErrorStaleElement, "The native element is no longer available.");
  }
  CheckHresult(kErrorAutomationFailed, "Reading the cached automation subtree", result);

  const WindowMetrics metrics = MeasureWindow(context.window);
  const std::string storyRootTestId = ToUtf8(context.storyRootTestId);
  std::vector<PendingNode> stack;
  stack.push_back(PendingNode{cachedRoot, rootParentId, rootScope});

  std::vector<ElementSnapshot> snapshots;
  std::size_t visited = 0;
  while (!stack.empty()) {
    if (visited >= kMaximumTreeNodes) {
      break;
    }
    if ((visited % 64) == 0) {
      token.ThrowIfCancelled();
    }
    visited += 1;
    const PendingNode node = stack.back();
    stack.pop_back();

    ElementScope scope = node.scope;
    const std::wstring runtimeKey = RuntimeKeyFromCache(node.element.get());
    const std::string id =
        RegisterElement(node.element.get(), runtimeKey, context.windowId, context.window, node.parentId, scope);
    ElementSnapshot snapshot = ReadSnapshot(node.element.get(), context.windowId, node.parentId, scope, id);

    ElementScope childScope = scope;
    if (context.primary && scope != ElementScope::Preview && !storyRootTestId.empty() &&
        snapshot.automationId == storyRootTestId) {
      scope = ElementScope::Preview;
      childScope = ElementScope::Preview;
      snapshot.scope = ElementScope::Preview;
      recordsById_[id].scope = ElementScope::Preview;
    } else if (context.primary && scope == ElementScope::Application) {
      childScope = ElementScope::Chrome;
    }

    winrt::com_ptr<IUIAutomationElementArray> children;
    if (SUCCEEDED(node.element->GetCachedChildren(children.put())) && children) {
      int count = 0;
      if (SUCCEEDED(children->get_Length(&count))) {
        for (int index = count - 1; index >= 0; index -= 1) {
          winrt::com_ptr<IUIAutomationElement> child;
          if (SUCCEEDED(children->GetElement(index, child.put())) && child) {
            stack.push_back(PendingNode{child, id, childScope});
          }
        }
      }
    }

    snapshot.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics);
    snapshots.push_back(std::move(snapshot));
  }
  return snapshots;
}

std::vector<ElementSnapshot> Automation::SnapshotWindowTree(const WindowContext& context,
                                                            const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();
  const winrt::com_ptr<IUIAutomationElement> root = RootForWindow(context.window);
  const ElementScope rootScope = context.primary ? ElementScope::Application : ElementScope::SecondaryWindow;
  return WalkCachedSubtree(root.get(), context, rootScope, std::string(), token, true);
}

std::vector<ElementSnapshot> Automation::Find(const WindowContext& context, const std::string& rootElementId,
                                              const Selector& selector, const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();

  winrt::com_ptr<IUIAutomationElement> searchRoot;
  std::string rootId;
  std::string rootParentId;
  ElementScope rootScope = context.primary ? ElementScope::Application : ElementScope::SecondaryWindow;
  if (!rootElementId.empty()) {
    const ElementRecord& record = RequireRecord(rootElementId);
    searchRoot = record.element;
    rootId = record.id;
    rootParentId = record.parentId;
    rootScope = record.scope;
  } else {
    searchRoot = RootForWindow(context.window);
  }

  // A test identifier can live on a node that the control view hides, so a
  // miss retries once through the raw view before reporting no matches.
  const bool allowRawView = selector.strategy == "accessibility id";
  std::vector<ElementSnapshot> matches;
  for (int pass = 0; pass < (allowRawView ? 2 : 1); pass += 1) {
    const std::vector<ElementSnapshot> snapshots =
        WalkCachedSubtree(searchRoot.get(), context, rootScope, rootParentId, token, pass == 0);
    for (const ElementSnapshot& snapshot : snapshots) {
      // A scoped search stays strictly beneath its root element.
      if (!rootId.empty() && snapshot.id == rootId) {
        continue;
      }
      if (MatchesSelector(snapshot, selector)) {
        matches.push_back(snapshot);
      }
    }
    if (!matches.empty()) {
      break;
    }
  }
  return matches;
}

ElementSnapshot Automation::SnapshotElement(const std::string& elementId, const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();
  const ElementRecord& record = RequireRecord(elementId);
  const std::string windowId = record.windowId;
  const std::string parentId = record.parentId;
  const ElementScope scope = record.scope;
  HWND window = record.window;
  winrt::com_ptr<IUIAutomationElement> refreshed;
  const HRESULT result =
      record.element->BuildUpdatedCache(CreateCacheRequest(TreeScope_Element, true).get(), refreshed.put());
  if (result == UIA_E_ELEMENTNOTAVAILABLE || (SUCCEEDED(result) && !refreshed)) {
    Fail(kErrorStaleElement, "Element \"" + elementId + "\" is no longer available.");
  }
  CheckHresult(kErrorAutomationFailed, "Refreshing the cached element", result);

  if (window == nullptr || IsWindow(window) == FALSE) {
    UIA_HWND nativeWindow = nullptr;
    if (SUCCEEDED(refreshed->get_CachedNativeWindowHandle(&nativeWindow))) {
      window = static_cast<HWND>(nativeWindow);
    }
  }
  ElementSnapshot snapshot = ReadSnapshot(refreshed.get(), windowId, parentId, scope, elementId);
  recordsById_[elementId].element = refreshed;

  const WindowMetrics metrics = MeasureWindow(window);
  snapshot.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics);
  return snapshot;
}

std::optional<ElementSnapshot> Automation::ActiveElement(const WindowContext& context, const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();
  winrt::com_ptr<IUIAutomationElement> focused;
  const HRESULT result =
      automation_->GetFocusedElementBuildCache(CreateCacheRequest(TreeScope_Element, true).get(), focused.put());
  if (FAILED(result) || !focused) {
    return std::nullopt;
  }
  winrt::com_ptr<IUIAutomationElement> cursor = focused;
  bool owned = false;
  for (std::size_t depth = 0; depth < kMaximumAncestorWalk && cursor; depth += 1) {
    token.ThrowIfCancelled();
    UIA_HWND handle = nullptr;
    if (SUCCEEDED(cursor->get_CurrentNativeWindowHandle(&handle)) && static_cast<HWND>(handle) == context.window) {
      owned = true;
      break;
    }
    const winrt::com_ptr<IUIAutomationElement> parent = ParentOf(cursor.get());
    if (!parent) {
      break;
    }
    cursor = parent;
  }
  if (!owned) {
    return std::nullopt;
  }
  const std::wstring runtimeKey = RuntimeKeyLive(focused.get());
  std::string parentId;
  ElementScope scope = context.primary ? ElementScope::Chrome : ElementScope::SecondaryWindow;
  if (!runtimeKey.empty()) {
    const auto existing = idsByRuntimeKey_.find(runtimeKey);
    if (existing != idsByRuntimeKey_.end()) {
      const auto record = recordsById_.find(existing->second);
      if (record != recordsById_.end()) {
        parentId = record->second.parentId;
        scope = record->second.scope;
      }
    }
  }
  const std::string id =
      RegisterElement(focused.get(), runtimeKey, context.windowId, context.window, parentId, scope);
  ElementSnapshot snapshot = ReadSnapshot(focused.get(), context.windowId, parentId, scope, id);
  const WindowMetrics metrics = MeasureWindow(context.window);
  snapshot.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics);
  return snapshot;
}

std::optional<ElementSnapshot> Automation::HitTest(const WindowContext& context, POINT screenPoint,
                                                   const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();
  DWORD targetProcessId = 0;
  GetWindowThreadProcessId(context.window, &targetProcessId);
  const HWND pointWindow = WindowFromPoint(screenPoint);
  DWORD pointProcessId = 0;
  if (pointWindow != nullptr) {
    GetWindowThreadProcessId(pointWindow, &pointProcessId);
  }
  if (pointProcessId != 0 && targetProcessId != 0 && pointProcessId != targetProcessId) {
    ElementSnapshot intercepted;
    intercepted.id = NextIdentifier("external-window");
    intercepted.windowId = context.windowId;
    intercepted.scope = ElementScope::Application;
    intercepted.role = "window";
    intercepted.name = "External desktop window";
    intercepted.enabled.supported = true;
    intercepted.enabled.value = true;
    intercepted.focused.supported = true;
    intercepted.focused.value = false;
    intercepted.visible.supported = true;
    intercepted.visible.value = true;
    RECT bounds{};
    if (GetWindowRect(GetAncestor(pointWindow, GA_ROOT), &bounds) != FALSE) {
      intercepted.physicalRect = bounds;
      intercepted.rect = PhysicalRectToClientDips(bounds, MeasureWindow(context.window));
    }
    return intercepted;
  }
  winrt::com_ptr<IUIAutomationElement> hit;
  const HRESULT result =
      automation_->ElementFromPointBuildCache(screenPoint, CreateCacheRequest(TreeScope_Element, true).get(),
                                              hit.put());
  if (FAILED(result) || !hit) {
    return std::nullopt;
  }

  // The point belongs to the deepest identity the client already knows about:
  // an inner presentation node of a known element never intercepts its own
  // owner, while an unrelated node still reports its own identity.
  winrt::com_ptr<IUIAutomationElement> resolved = hit;
  std::string resolvedId;
  std::string parentId;
  ElementScope scope = context.primary ? ElementScope::Chrome : ElementScope::SecondaryWindow;
  winrt::com_ptr<IUIAutomationElement> cursor = hit;
  for (std::size_t depth = 0; depth < kMaximumAncestorWalk && cursor; depth += 1) {
    token.ThrowIfCancelled();
    const std::wstring key = RuntimeKeyLive(cursor.get());
    if (!key.empty()) {
      const auto existing = idsByRuntimeKey_.find(key);
      if (existing != idsByRuntimeKey_.end()) {
        const auto record = recordsById_.find(existing->second);
        if (record != recordsById_.end()) {
          resolved = cursor;
          resolvedId = existing->second;
          parentId = record->second.parentId;
          scope = record->second.scope;
          break;
        }
      }
    }
    const winrt::com_ptr<IUIAutomationElement> parent = ParentOf(cursor.get());
    if (!parent) {
      break;
    }
    cursor = parent;
  }

  winrt::com_ptr<IUIAutomationElement> cached;
  const HRESULT refresh =
      resolved->BuildUpdatedCache(CreateCacheRequest(TreeScope_Element, true).get(), cached.put());
  if (FAILED(refresh) || !cached) {
    return std::nullopt;
  }
  const std::wstring runtimeKey = RuntimeKeyFromCache(cached.get());
  const std::string id =
      resolvedId.empty()
          ? RegisterElement(cached.get(), runtimeKey, context.windowId, context.window, parentId, scope)
          : resolvedId;
  recordsById_[id].element = cached;
  ElementSnapshot snapshot = ReadSnapshot(cached.get(), context.windowId, parentId, scope, id);
  const WindowMetrics metrics = MeasureWindow(context.window);
  snapshot.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics);
  return snapshot;
}

void Automation::SetFocus(const std::string& elementId) {
  const ElementRecord& record = RequireRecord(elementId);
  const winrt::com_ptr<IUIAutomationElement> element = record.element;
  const HRESULT result =
      BoundedCall([element]() { return element->SetFocus(); }, "Focusing the element", kErrorAutomationFailed);
  if (result == UIA_E_ELEMENTNOTAVAILABLE) {
    Fail(kErrorStaleElement, "Element \"" + elementId + "\" is no longer available.");
  }
  if (FAILED(result)) {
    FailHresult(kErrorNotInteractable, "Focusing the element", result);
  }
}

bool Automation::HasKeyboardFocus(const std::string& elementId) {
  const ElementRecord& record = RequireRecord(elementId);
  const winrt::com_ptr<IUIAutomationElement> element = record.element;
  const auto focused = std::make_shared<BOOL>(FALSE);
  const HRESULT result = BoundedCall([element, focused]() { return element->get_CurrentHasKeyboardFocus(focused.get()); },
                                     "Reading the element focus state", kErrorAutomationFailed);
  return SUCCEEDED(result) && *focused != FALSE;
}

void Automation::AccessibilityClick(const std::string& elementId, const CancellationToken& token) {
  const ElementRecord& record = RequireRecord(elementId);
  const winrt::com_ptr<IUIAutomationElement> element = record.element;
  token.ThrowIfCancelled();

  winrt::com_ptr<IUIAutomationInvokePattern> invoke;
  if (SUCCEEDED(element->GetCurrentPatternAs(UIA_InvokePatternId, IID_PPV_ARGS(invoke.put()))) && invoke) {
    CheckHresult(kErrorAutomationFailed, "Invoking the element",
                 BoundedCall([invoke]() { return invoke->Invoke(); }, "Invoking the element", kErrorAutomationFailed));
    return;
  }
  winrt::com_ptr<IUIAutomationTogglePattern> toggle;
  if (SUCCEEDED(element->GetCurrentPatternAs(UIA_TogglePatternId, IID_PPV_ARGS(toggle.put()))) && toggle) {
    CheckHresult(kErrorAutomationFailed, "Toggling the element",
                 BoundedCall([toggle]() { return toggle->Toggle(); }, "Toggling the element", kErrorAutomationFailed));
    return;
  }
  winrt::com_ptr<IUIAutomationSelectionItemPattern> selection;
  if (SUCCEEDED(element->GetCurrentPatternAs(UIA_SelectionItemPatternId, IID_PPV_ARGS(selection.put()))) &&
      selection) {
    CheckHresult(
        kErrorAutomationFailed, "Selecting the element",
        BoundedCall([selection]() { return selection->Select(); }, "Selecting the element", kErrorAutomationFailed));
    return;
  }
  winrt::com_ptr<IUIAutomationExpandCollapsePattern> expand;
  if (SUCCEEDED(element->GetCurrentPatternAs(UIA_ExpandCollapsePatternId, IID_PPV_ARGS(expand.put()))) && expand) {
    const auto state = std::make_shared<ExpandCollapseState>(ExpandCollapseState_Collapsed);
    CheckHresult(kErrorAutomationFailed, "Reading the expand state",
                 BoundedCall([expand, state]() { return expand->get_CurrentExpandCollapseState(state.get()); },
                             "Reading the expand state", kErrorAutomationFailed));
    if (*state == ExpandCollapseState_LeafNode) {
      Fail(kErrorUnsupported, "The element is a leaf node and cannot be activated through accessibility.");
    }
    const bool collapse = *state == ExpandCollapseState_Expanded;
    CheckHresult(kErrorAutomationFailed, "Expanding or collapsing the element",
                 BoundedCall([expand, collapse]() { return collapse ? expand->Collapse() : expand->Expand(); },
                             "Expanding or collapsing the element", kErrorAutomationFailed));
    return;
  }
  winrt::com_ptr<IUIAutomationLegacyIAccessiblePattern> legacy;
  if (SUCCEEDED(element->GetCurrentPatternAs(UIA_LegacyIAccessiblePatternId, IID_PPV_ARGS(legacy.put()))) && legacy) {
    CheckHresult(
        kErrorAutomationFailed, "Invoking the legacy accessibility default action",
        BoundedCall([legacy]() { return legacy->DoDefaultAction(); }, "Invoking the legacy accessibility default action",
                    kErrorAutomationFailed));
    return;
  }
  Fail(kErrorUnsupported,
       "The element does not implement an Invoke, Toggle, SelectionItem, ExpandCollapse, or LegacyIAccessible pattern, so an "
       "accessibility click is unavailable.");
}

bool Automation::TryClearValue(const std::string& elementId) {
  const ElementRecord& record = RequireRecord(elementId);
  winrt::com_ptr<IUIAutomationValuePattern> value;
  if (FAILED(record.element->GetCurrentPatternAs(UIA_ValuePatternId, IID_PPV_ARGS(value.put()))) || !value) {
    return false;
  }
  const auto readOnly = std::make_shared<BOOL>(TRUE);
  const HRESULT state = BoundedCall([value, readOnly]() { return value->get_CurrentIsReadOnly(readOnly.get()); },
                                    "Reading the element value state", kErrorAutomationFailed);
  if (FAILED(state) || *readOnly != FALSE) {
    return false;
  }
  const HRESULT result = BoundedCall(
      [value]() {
        const BSTR empty = SysAllocString(L"");
        const HRESULT assigned = value->SetValue(empty);
        SysFreeString(empty);
        return assigned;
      },
      "Clearing the element value", kErrorAutomationFailed);
  return SUCCEEDED(result);
}

void Automation::ForgetWindow(const std::string& windowId) {
  for (auto iterator = recordsById_.begin(); iterator != recordsById_.end();) {
    if (iterator->second.windowId == windowId) {
      for (auto key = idsByRuntimeKey_.begin(); key != idsByRuntimeKey_.end();) {
        key = key->second == iterator->first ? idsByRuntimeKey_.erase(key) : std::next(key);
      }
      iterator = recordsById_.erase(iterator);
      continue;
    }
    ++iterator;
  }
}

void Automation::Reset() {
  recordsById_.clear();
  idsByRuntimeKey_.clear();
}

std::string Automation::SerializeSourceXml(const std::vector<ElementSnapshot>& snapshots) const {
  std::unordered_map<std::string, std::vector<const ElementSnapshot*>> children;
  std::vector<const ElementSnapshot*> roots;
  for (const ElementSnapshot& snapshot : snapshots) {
    if (snapshot.parentId.empty()) {
      roots.push_back(&snapshot);
    } else {
      children[snapshot.parentId].push_back(&snapshot);
    }
  }

  std::string output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><application>";
  struct Frame {
    const ElementSnapshot* snapshot;
    bool open;
  };
  std::vector<Frame> stack;
  for (auto iterator = roots.rbegin(); iterator != roots.rend(); ++iterator) {
    stack.push_back(Frame{*iterator, true});
  }
  while (!stack.empty()) {
    const Frame frame = stack.back();
    stack.pop_back();
    if (!frame.open) {
      output += "</element>";
      continue;
    }
    const ElementSnapshot& snapshot = *frame.snapshot;
    output += "<element automationId=\"" + EscapeXml(snapshot.automationId) + "\"";
    output += " enabled=\"" + std::string(snapshot.enabled.supported && snapshot.enabled.value ? "true" : "false") + "\"";
    output += " height=\"" + FormatNumber(snapshot.rect.height) + "\"";
    output += " name=\"" + EscapeXml(snapshot.name) + "\"";
    output += " role=\"" + EscapeXml(snapshot.role) + "\"";
    output += " scope=\"" + std::string(ScopeName(snapshot.scope)) + "\"";
    if (snapshot.hasValue) {
      output += " value=\"" + EscapeXml(snapshot.value) + "\"";
    }
    output += " visible=\"" + std::string(snapshot.visible.supported && snapshot.visible.value ? "true" : "false") + "\"";
    output += " width=\"" + FormatNumber(snapshot.rect.width) + "\"";
    output += " x=\"" + FormatNumber(snapshot.rect.x) + "\"";
    output += " y=\"" + FormatNumber(snapshot.rect.y) + "\"";
    output += ">";
    stack.push_back(Frame{frame.snapshot, false});
    const auto entry = children.find(snapshot.id);
    if (entry != children.end()) {
      for (auto child = entry->second.rbegin(); child != entry->second.rend(); ++child) {
        stack.push_back(Frame{*child, true});
      }
    }
  }
  output += "</application>";
  return output;
}

}  // namespace furn
