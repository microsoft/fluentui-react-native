#include "automation.h"

#include <algorithm>
#include <array>
#include <atomic>
#include <functional>
#include <iterator>
#include <memory>
#include <thread>

#include <bcrypt.h>

#include "settlement.h"
namespace furn {
namespace {

constexpr std::size_t kMaximumAncestorWalk = 64;
// Provider calls run on their application's UI thread, which a suspended or
// busy application can stall indefinitely. Every call therefore runs as a
// bounded step that reports an explicit failure instead of wedging the helper;
// a mutation that cannot settle also quarantines later mutations (settlement.h).
constexpr DWORD kProviderCallTimeoutMs = 5000;
// The UI Automation client's own bounds on reaching a provider and on one
// cross-process transaction.
constexpr DWORD kConnectionTimeoutMs = 2000;
constexpr DWORD kTransactionTimeoutMs = 5000;
constexpr char kTreeTooLargeMessage[] = "The native accessibility tree exceeds the 5000-node limit.";

struct ActionMapping {
  const char* name;
  const char* identity;
  bool ElementSnapshot::*available;
};

constexpr ActionMapping kAccessibilityActions[] = {
    {"Invoke", "UIA.Invoke.Invoke", &ElementSnapshot::invokePattern},
    {"Toggle", "UIA.Toggle.Toggle", &ElementSnapshot::togglePattern},
    {"Expand", "UIA.ExpandCollapse.Expand", &ElementSnapshot::expandCollapsePattern},
    {"Collapse", "UIA.ExpandCollapse.Collapse", &ElementSnapshot::expandCollapsePattern},
    {"Select", "UIA.SelectionItem.Select", &ElementSnapshot::selectionItemPattern},
    {"AddToSelection", "UIA.SelectionItem.AddToSelection", &ElementSnapshot::selectionItemPattern},
    {"RemoveFromSelection", "UIA.SelectionItem.RemoveFromSelection", &ElementSnapshot::selectionItemPattern},
    {"ScrollIntoView", "UIA.ScrollItem.ScrollIntoView", &ElementSnapshot::scrollItemPattern},
};

std::string ActionKey(const ActionMapping& action) {
  static auto secret = []() {
    std::array<unsigned char, 32> bytes{};
    if (BCryptGenRandom(nullptr, bytes.data(), static_cast<ULONG>(bytes.size()), BCRYPT_USE_SYSTEM_PREFERRED_RNG) < 0) {
      Fail(kErrorInternal, "Could not initialize accessibility action keys.");
    }
    return bytes;
  }();
  std::string identity(action.identity);
  std::array<unsigned char, 32> digest{};
  if (BCryptHash(BCRYPT_HMAC_SHA256_ALG_HANDLE, secret.data(), static_cast<ULONG>(secret.size()),
                 reinterpret_cast<PUCHAR>(identity.data()), static_cast<ULONG>(identity.size()),
                 digest.data(), static_cast<ULONG>(digest.size())) < 0) {
    Fail(kErrorInternal, "Could not identify the accessibility action.");
  }
  constexpr char hex[] = "0123456789abcdef";
  std::string key;
  for (std::size_t index = 0; index < 16; ++index) {
    key += hex[digest[index] >> 4];
    key += hex[digest[index] & 15];
  }
  return key;
}

std::vector<std::string> ActionNames(const ElementSnapshot& snapshot) {
  std::vector<std::string> names;
  for (const auto& action : kAccessibilityActions) {
    if (snapshot.*(action.available)) {
      names.emplace_back(action.name);
    }
  }
  return names;
}

[[noreturn]] void ActionChanged() {
  throw HelperError(kErrorNotInteractable, "The element no longer publishes exactly one matching action.", "action-changed");
}

template <typename Fn>
HRESULT BoundedMutation(Fn&& call, std::string_view operation) {
  return RunBoundedProviderCall(ProviderCall::Mutation, std::function<HRESULT()>(std::forward<Fn>(call)),
                                kProviderCallTimeoutMs, operation, kErrorAutomationFailed);
}

// A primary mutation, recorded in the command's effect ledger: a refusal before
// dispatch leaves no effect, and a call that never returns stays unresolved.
template <typename Fn>
HRESULT CountedMutation(Fn&& call, std::string_view operation) {
  RequireMutationsAllowed();
  RecordDispatching();
  const HRESULT result = BoundedMutation(std::forward<Fn>(call), operation);
  RecordSettled(result);
  return result;
}

enum class PatternStatus { Available, Absent, Stale, Failed };

template <typename Pattern>
struct PatternQuery {
  PatternStatus status{PatternStatus::Absent};
  HRESULT result{S_OK};
  winrt::com_ptr<Pattern> pattern;
};

// Only a pattern the element does not implement is a missing capability; an
// element that went away or a provider that failed must not be reported as one.
template <typename Pattern>
PatternQuery<Pattern> QueryPattern(IUIAutomationElement* element, PATTERNID patternId) {
  PatternQuery<Pattern> query;
  query.result = element->GetCurrentPatternAs(patternId, IID_PPV_ARGS(query.pattern.put()));
  if (query.result == UIA_E_ELEMENTNOTAVAILABLE) {
    query.status = PatternStatus::Stale;
  } else if (SUCCEEDED(query.result)) {
    query.status = query.pattern ? PatternStatus::Available : PatternStatus::Absent;
  } else if (query.result == UIA_E_NOTSUPPORTED || query.result == E_NOINTERFACE || query.result == E_NOTIMPL ||
             query.result == E_FAIL) {
    query.status = PatternStatus::Absent;
  } else {
    query.status = PatternStatus::Failed;
  }
  return query;
}

// Returns whether the element implements the pattern, and fails for a stale
// element or a failed query.
template <typename Pattern>
bool RequirePatternQuery(const PatternQuery<Pattern>& query, std::string_view operation) {
  if (query.status == PatternStatus::Stale) {
    Fail(kErrorStaleElement, "The element is no longer available.");
  }
  if (query.status == PatternStatus::Failed) {
    FailHresult(kErrorAutomationFailed, operation, query.result);
  }
  return query.status == PatternStatus::Available;
}

template <typename Pattern>
void PerformPatternAction(IUIAutomationElement* element, PATTERNID patternId, HRESULT (STDMETHODCALLTYPE Pattern::*method)(),
                          const CancellationToken& token) {
  const PatternQuery<Pattern> query = QueryPattern<Pattern>(element, patternId);
  if (!RequirePatternQuery(query, "Reading the accessibility action pattern")) {
    ActionChanged();
  }
  const winrt::com_ptr<Pattern> pattern = query.pattern;
  token.ThrowIfCancelled();
  const HRESULT result = CountedMutation([pattern, method]() { return (pattern.get()->*method)(); },
                                         "Performing the accessibility action");
  if (result == UIA_E_ELEMENTNOTAVAILABLE) {
    Fail(kErrorStaleElement, "The element is no longer available.");
  }
  CheckHresult(result == UIA_E_ELEMENTNOTENABLED ? kErrorNotInteractable : kErrorAutomationFailed,
               "Performing the accessibility action", result);
}

template <typename Fn>
HRESULT BoundedRead(Fn&& call, std::string_view operation) {
  return RunBoundedProviderCall(ProviderCall::Read, std::function<HRESULT()>(std::forward<Fn>(call)),
                                kProviderCallTimeoutMs, operation, kErrorAutomationFailed);
}

// A whole-subtree cache is one provider transaction that a busy application can
// hold for the full transaction timeout, so it runs on a bounded worker that a
// cancelled command stops waiting for. The bound only backs up the client's
// own timeouts, which still decide how a slow provider fails.
HRESULT BuildCacheAbandonably(IUIAutomationElement* element, const winrt::com_ptr<IUIAutomationCacheRequest>& request,
                              winrt::com_ptr<IUIAutomationElement>& cached) {
  winrt::com_ptr<IUIAutomationElement> source;
  source.copy_from(element);
  const auto output = std::make_shared<winrt::com_ptr<IUIAutomationElement>>();
  const HRESULT result = RunBoundedProviderCall(
      ProviderCall::Read, [source, request, output]() { return source->BuildUpdatedCache(request.get(), output->put()); },
      kConnectionTimeoutMs + kTransactionTimeoutMs + 1000, "Reading the cached automation subtree",
      kErrorAutomationFailed);
  cached = *output;
  return result;
}

// UI Automation reports a disabled element, such as a control of an owner window
// while its modal dialog is open, as a failed pattern call. That is the element
// refusing interaction, not an automation fault.
void CheckClickResult(std::string_view operation, HRESULT result) {
  CheckHresult(result == UIA_E_ELEMENTNOTENABLED ? kErrorNotInteractable : kErrorAutomationFailed, operation, result);
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

std::string TakeBstr(BSTR value) {
  const std::string text = BstrToUtf8(value);
  SysFreeString(value);
  return text;
}

// The cached form reads what the element's cache request already fetched; the
// live form asks the provider, for ancestors that were never cached.
ElementFingerprint ReadFingerprint(IUIAutomationElement* element, bool cached) {
  ElementFingerprint fingerprint;
  int processId = 0;
  if (SUCCEEDED(cached ? element->get_CachedProcessId(&processId) : element->get_CurrentProcessId(&processId)) &&
      processId > 0) {
    fingerprint.processId = static_cast<DWORD>(processId);
  }
  CONTROLTYPEID controlType = 0;
  if (SUCCEEDED(cached ? element->get_CachedControlType(&controlType) : element->get_CurrentControlType(&controlType))) {
    fingerprint.controlType = controlType;
  }
  BSTR automationId = nullptr;
  if (SUCCEEDED(cached ? element->get_CachedAutomationId(&automationId)
                       : element->get_CurrentAutomationId(&automationId))) {
    fingerprint.automationId = TakeBstr(automationId);
  }
  BSTR className = nullptr;
  if (SUCCEEDED(cached ? element->get_CachedClassName(&className) : element->get_CurrentClassName(&className))) {
    fingerprint.className = TakeBstr(className);
  }
  return fingerprint;
}

ElementFingerprint FingerprintFromCache(IUIAutomationElement* element) {
  return ReadFingerprint(element, true);
}

ElementFingerprint FingerprintLive(IUIAutomationElement* element) {
  return ReadFingerprint(element, false);
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
  value.Set("helpText", SerializeSupported(snapshot.helpText));
  value.Set("required", SerializeSupported(snapshot.required));
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
    automation2->put_ConnectionTimeout(kConnectionTimeoutMs);
    automation2->put_TransactionTimeout(kTransactionTimeoutMs);
  }

  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation control view",
               automation->get_ControlViewCondition(controlViewCondition_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation raw view",
               automation->get_RawViewCondition(rawViewCondition_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation raw walker",
               automation->get_RawViewWalker(rawWalker_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation control walker",
               automation->get_ControlViewWalker(controlWalker_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation content walker",
               automation->get_ContentViewWalker(contentWalker_.put()));
  CheckHresult(kErrorAutomationFailed, "Reading the UI Automation not-supported sentinel",
               UiaGetReservedNotSupportedValue(notSupportedValue_.put()));
  automation_ = automation;
}

bool Automation::HasWindowContent(HWND window, DWORD processId, const CancellationToken& token) {
  token.ThrowIfCancelled();
  const auto automation = automation_;
  const auto walker = contentWalker_;
  const auto content = std::make_shared<bool>(false);
  try {
    const HRESULT result = BoundedRead(
        [automation, walker, window, processId, content]() {
          winrt::com_ptr<IUIAutomationElement> root;
          HRESULT result = automation->ElementFromHandle(window, root.put());
          if (FAILED(result) || !root) return FAILED(result) ? result : E_FAIL;
          int rootProcessId = 0;
          result = root->get_CurrentProcessId(&rootProcessId);
          if (FAILED(result)) return result;
          if (rootProcessId != static_cast<int>(processId)) return S_FALSE;
          UIA_HWND rootWindow{};
          result = root->get_CurrentNativeWindowHandle(&rootWindow);
          if (FAILED(result)) return result;
          if (rootWindow != window) return S_FALSE;
          CONTROLTYPEID rootType = 0;
          result = root->get_CurrentControlType(&rootType);
          if (FAILED(result)) return result;
          if (rootType == UIA_ToolTipControlTypeId) return S_FALSE;
          winrt::com_ptr<IUIAutomationElement> child;
          result = walker->GetFirstChildElement(root.get(), child.put());
          if (FAILED(result) || !child) return FAILED(result) ? result : S_FALSE;
          int childProcessId = 0;
          result = child->get_CurrentProcessId(&childProcessId);
          if (FAILED(result)) return result;
          BOOL isContent = FALSE;
          result = child->get_CurrentIsContentElement(&isContent);
          if (FAILED(result)) return result;
          CONTROLTYPEID type = 0;
          result = child->get_CurrentControlType(&type);
          if (FAILED(result)) return result;
          *content = childProcessId == static_cast<int>(processId) && isContent != FALSE &&
                     type != UIA_ToolTipControlTypeId;
          return S_OK;
        },
        "Reading the owned window content");
    token.ThrowIfCancelled();
    return SUCCEEDED(result) && *content;
  } catch (const HelperError&) {
    token.ThrowIfCancelled();
    return false;
  }
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
      UIA_HelpTextPropertyId,
      UIA_ControlTypePropertyId,
      UIA_BoundingRectanglePropertyId,
      UIA_IsEnabledPropertyId,
      UIA_IsRequiredForFormPropertyId,
      UIA_HasKeyboardFocusPropertyId,
      UIA_IsKeyboardFocusablePropertyId,
      UIA_IsOffscreenPropertyId,
      UIA_IsControlElementPropertyId,
      UIA_NativeWindowHandlePropertyId,
      UIA_ProcessIdPropertyId,
      UIA_ClassNamePropertyId,
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
      UIA_IsScrollItemPatternAvailablePropertyId,
      UIA_IsValuePatternAvailablePropertyId,
      UIA_IsPasswordPropertyId,
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
    // A window that still exists but cannot be read is busy or unresponsive, not gone.
    FailHresult(IsWindow(window) != FALSE ? kErrorAutomationFailed : kErrorNoSuchWindow,
                "Reading the window automation element", result);
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
                                        ElementScope scope, std::uint64_t generation) {
  ElementRecord candidate;
  candidate.element.copy_from(element);
  candidate.windowId = windowId;
  candidate.window = window;
  candidate.parentId = parentId;
  candidate.scope = scope;
  candidate.fingerprint = FingerprintFromCache(element);
  candidate.runtimeKey = runtimeKey;
  return registry_.Register(std::move(candidate), generation);
}

ElementRecord Automation::RequireRecord(const std::string& elementId) {
  return registry_.Require(elementId);
}

ElementRecord Automation::RefreshElement(const std::string& elementId,
                                         winrt::com_ptr<IUIAutomationElement>& refreshed) {
  ElementRecord record = registry_.Require(elementId);
  const HRESULT result =
      record.element->BuildUpdatedCache(CreateCacheRequest(TreeScope_Element, true).get(), refreshed.put());
  if (result == UIA_E_ELEMENTNOTAVAILABLE || (SUCCEEDED(result) && !refreshed)) {
    Fail(kErrorStaleElement, "Element \"" + elementId + "\" is no longer available.");
  }
  CheckHresult(kErrorAutomationFailed, "Refreshing the cached element", result);

  // A refresh can succeed against a different element: a destroyed window's
  // handle that was reused still resolves. A known property that disagrees
  // means the id no longer addresses what it was issued for.
  const ElementFingerprint observed = FingerprintFromCache(refreshed.get());
  if (FingerprintsConflict(record.fingerprint, observed)) {
    registry_.Erase(elementId);
    Fail(kErrorStaleElement,
         "Element \"" + elementId +
             "\" now reports a different process, control type, automation id, or class, so a different element has "
             "reused its native identity.");
  }
  registry_.Refresh(elementId, refreshed, observed);
  return record;
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
  if (SUCCEEDED(element->GetCachedPropertyValueEx(UIA_HelpTextPropertyId, TRUE, variant.put())) &&
      !IsNotSupported(variant.get()) && variant.type() == VT_BSTR) {
    snapshot.helpText = SupportedString{true, VariantString(variant.get()), {}};
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
  snapshot.required = readBool(UIA_IsRequiredForFormPropertyId, "The provider does not report required-form state.");
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
  snapshot.scrollItemPattern = patternAvailable(UIA_IsScrollItemPatternAvailablePropertyId);
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
  HRESULT result = BuildCacheAbandonably(root, CreateCacheRequest(TreeScope_Subtree, controlViewOnly), cachedRoot);
  // The whole-subtree cache is one provider transaction, so a tree past the node limit can outlast the transaction
  // timeout before the walk below gets to refuse it. Count such a tree child by child so it is still refused as too
  // large rather than reported as a provider failure or retried.
  if (FAILED(result) && result != UIA_E_ELEMENTNOTAVAILABLE &&
      SubtreeExceeds(root, kMaximumTreeNodes, controlViewOnly, token)) {
    Fail(kErrorTreeTooLarge, kTreeTooLargeMessage);
  }
  // A descendant can disappear while its subtree is cached, for example when an owned popup island closes; a closing
  // island's provider can also report a timeout or unspecified failure. Retry while the root itself remains
  // available; only an unavailable root is a stale element.
  const auto isTransient = [](HRESULT value) {
    return value == UIA_E_ELEMENTNOTAVAILABLE || value == UIA_E_TIMEOUT || value == E_FAIL;
  };
  for (int attempt = 0; isTransient(result) && attempt < 5; attempt += 1) {
    winrt::com_ptr<IUIAutomationElement> probe;
    if (FAILED(BuildCacheAbandonably(root, CreateCacheRequest(TreeScope_Element, controlViewOnly), probe)) || !probe) {
      break;
    }
    token.Wait(20);
    result = BuildCacheAbandonably(root, CreateCacheRequest(TreeScope_Subtree, controlViewOnly), cachedRoot);
  }
  if (result == UIA_E_ELEMENTNOTAVAILABLE) {
    Fail(kErrorStaleElement, "The native element is no longer available.");
  }
  CheckHresult(kErrorAutomationFailed, "Reading the cached automation subtree", result);

  const WindowMetrics metrics = MeasureWindow(context.window);
  const std::string storyRootTestId = ToUtf8(context.storyRootTestId);
  const std::uint64_t generation = registry_.BeginObservation();
  std::vector<PendingNode> stack;
  stack.push_back(PendingNode{cachedRoot, rootParentId, rootScope});

  std::vector<ElementSnapshot> snapshots;
  std::size_t visited = 0;
  while (!stack.empty()) {
    if (visited >= kMaximumTreeNodes) {
      Fail(kErrorTreeTooLarge, kTreeTooLargeMessage);
    }
    if ((visited % 64) == 0) {
      token.ThrowIfCancelled();
    }
    visited += 1;
    const PendingNode node = stack.back();
    stack.pop_back();

    ElementScope scope = node.scope;
    const std::wstring runtimeKey = RuntimeKeyFromCache(node.element.get());
    const std::string id = RegisterElement(node.element.get(), runtimeKey, context.windowId, context.window,
                                           node.parentId, scope, generation);
    ElementSnapshot snapshot = ReadSnapshot(node.element.get(), context.windowId, node.parentId, scope, id);

    ElementScope childScope = scope;
    if (context.primary && scope != ElementScope::Preview && !storyRootTestId.empty() &&
        snapshot.automationId == storyRootTestId) {
      scope = ElementScope::Preview;
      childScope = ElementScope::Preview;
      snapshot.scope = ElementScope::Preview;
      registry_.SetScope(id, ElementScope::Preview);
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

bool Automation::SubtreeExceeds(IUIAutomationElement* root, std::size_t limit, bool controlViewOnly,
                                const CancellationToken& token) const {
  // Uses the walker that matches the cache request's tree filter, so it counts the nodes the cached walk would visit.
  IUIAutomationTreeWalker* walker = controlViewOnly ? controlWalker_.get() : rawWalker_.get();
  std::vector<winrt::com_ptr<IUIAutomationElement>> parents;
  winrt::com_ptr<IUIAutomationElement> first;
  first.copy_from(root);
  parents.push_back(std::move(first));
  std::size_t counted = 1;
  while (!parents.empty()) {
    const winrt::com_ptr<IUIAutomationElement> parent = std::move(parents.back());
    parents.pop_back();
    token.ThrowIfCancelled();
    winrt::com_ptr<IUIAutomationElement> child;
    if (FAILED(walker->GetFirstChildElement(parent.get(), child.put()))) {
      return false;
    }
    while (child) {
      // Counting each child as it is found bounds the provider calls by the limit, even for one very wide level.
      counted += 1;
      if (counted > limit) {
        return true;
      }
      token.ThrowIfCancelled();
      winrt::com_ptr<IUIAutomationElement> next;
      if (FAILED(walker->GetNextSiblingElement(child.get(), next.put()))) {
        return false;
      }
      parents.push_back(std::move(child));
      child = std::move(next);
    }
  }
  return false;
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
    // The search must stay beneath the element the id was issued for, so a
    // replaced or vanished root fails here instead of searching its successor.
    const ElementRecord record = RefreshElement(rootElementId, searchRoot);
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

// Feeds SampleObservation from UI Automation. Every element it hands out came
// from a control-view walker call that cached the snapshot properties, so a
// read never calls the provider; only paging does.
class UiaObservationSource final : public ObservationSource {
 public:
  UiaObservationSource(Automation& automation, const WindowContext& context,
                       winrt::com_ptr<IUIAutomationElement> root, std::optional<std::string> rootId)
      : automation_(automation),
        context_(context),
        storyRootTestId_(ToUtf8(context.storyRootTestId)),
        rootId_(std::move(rootId)),
        metrics_(MeasureWindow(context.window)),
        cacheRequest_(automation.CreateCacheRequest(TreeScope_Element, true)),
        generation_(automation.registry_.BeginObservation()) {
    elements_.push_back(std::move(root));
  }

  std::vector<ObserveFact> UnsupportedFacts() const override {
    return {};
  }

  ObservedFacts Read(ObservationHandle handle) override {
    IUIAutomationElement* element = elements_.at(handle).get();
    const ElementSnapshot snapshot = automation_.ReadSnapshot(element, context_.windowId, {}, ElementScope::Chrome, {});
    ObservedFacts facts;
    facts.role = snapshot.role;
    facts.name = snapshot.name;
    facts.automationId = snapshot.automationId;
    facts.actions = ActionNames(snapshot);
    Variant password;
    facts.secure = SUCCEEDED(element->GetCachedPropertyValueEx(UIA_IsPasswordPropertyId, TRUE, password.put())) &&
                   password.type() == VT_BOOL && password.get().boolVal != VARIANT_FALSE;
    facts.checked = snapshot.checked;
    facts.enabled = snapshot.enabled;
    facts.expanded = snapshot.expanded;
    facts.focused = snapshot.focused;
    facts.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics_);
    facts.helpText = snapshot.helpText;
    facts.required = snapshot.required;
    facts.selected = snapshot.selected;
    if (snapshot.hasText) {
      facts.text = snapshot.text;
    }
    if (snapshot.hasValue) {
      facts.value = snapshot.value;
    }
    facts.visible = snapshot.visible;
    return facts;
  }

  std::unique_ptr<ObservationChildCursor> Children(ObservationHandle handle) override {
    return std::make_unique<Cursor>(*this, elements_.at(handle));
  }

  std::wstring Key(ObservationHandle handle) const override {
    return automation_.RuntimeKeyFromCache(elements_.at(handle).get());
  }

  // The scopes a tree walk assigns: the story root and everything beneath it
  // are the preview; the primary window's descendants are its chrome.
  ObservedScopes Scopes(ElementScope inherited, const ObservedFacts& facts) const override {
    if (context_.primary && inherited != ElementScope::Preview && !storyRootTestId_.empty() &&
        facts.automationId == storyRootTestId_) {
      return {ElementScope::Preview, ElementScope::Preview};
    }
    if (context_.primary && inherited == ElementScope::Application) {
      return {ElementScope::Application, ElementScope::Chrome};
    }
    return {inherited, inherited};
  }

  std::optional<std::string> Identify(ObservationHandle handle, const std::string& parentId,
                                      ElementScope scope) override {
    ElementRegistry& registry = automation_.registry_;
    if (handle == 0 && rootId_) {
      // A requested root keeps the id it was requested by, even when its
      // provider reports no runtime identity.
      if (!registry.Pin(*rootId_, generation_)) {
        Fail(kErrorStaleElement, "Element \"" + *rootId_ + "\" is no longer available.");
      }
      registry.SetScope(*rootId_, scope);
      return rootId_;
    }
    IUIAutomationElement* element = elements_.at(handle).get();
    ElementRecord candidate;
    candidate.element.copy_from(element);
    candidate.windowId = context_.windowId;
    candidate.window = context_.window;
    candidate.parentId = parentId;
    candidate.scope = scope;
    candidate.fingerprint = FingerprintFromCache(element);
    candidate.runtimeKey = automation_.RuntimeKeyFromCache(element);
    return registry.RegisterPinned(std::move(candidate), generation_);
  }

 private:
  class Cursor final : public ObservationChildCursor {
   public:
    Cursor(UiaObservationSource& source, winrt::com_ptr<IUIAutomationElement> parent)
        : source_(source), parent_(std::move(parent)) {}

    std::optional<ObservationHandle> Next() override {
      if (done_) {
        return std::nullopt;
      }
      IUIAutomationTreeWalker* walker = source_.automation_.controlWalker_.get();
      IUIAutomationCacheRequest* cache = source_.cacheRequest_.get();
      winrt::com_ptr<IUIAutomationElement> next;
      const HRESULT result = current_ ? walker->GetNextSiblingElementBuildCache(current_.get(), cache, next.put())
                                      : walker->GetFirstChildElementBuildCache(parent_.get(), cache, next.put());
      if (result == UIA_E_ELEMENTNOTAVAILABLE) {
        done_ = true;
        Fail(kErrorStaleElement, "The element whose children were being read is no longer available.");
      }
      if (FAILED(result)) {
        done_ = true;
        FailHresult(kErrorAutomationFailed, "Reading the next control-view child", result);
      }
      if (!next) {
        done_ = true;
        return std::nullopt;
      }
      current_ = next;
      source_.elements_.push_back(std::move(next));
      return source_.elements_.size() - 1;
    }

   private:
    UiaObservationSource& source_;
    winrt::com_ptr<IUIAutomationElement> parent_;
    winrt::com_ptr<IUIAutomationElement> current_;
    bool done_{false};
  };

  Automation& automation_;
  const WindowContext& context_;
  std::string storyRootTestId_;
  std::optional<std::string> rootId_;
  WindowMetrics metrics_;
  winrt::com_ptr<IUIAutomationCacheRequest> cacheRequest_;
  std::uint64_t generation_;
  std::vector<winrt::com_ptr<IUIAutomationElement>> elements_;
};

ObservedSample Automation::Observe(const WindowContext& context, const ObserveRequest& request,
                                   const CancellationToken& token) {
  const std::int64_t startedAt = SteadyMilliseconds();
  Initialize();
  token.ThrowIfCancelled();

  ObservationRoot root;
  winrt::com_ptr<IUIAutomationElement> rootElement;
  if (request.rootId) {
    const ElementRecord known = registry_.Require(*request.rootId);
    if (known.windowId != context.windowId) {
      Fail(kErrorStaleElement, "Element \"" + *request.rootId + "\" does not belong to window \"" + context.windowId +
                                   "\".");
    }
    const ElementRecord record = RefreshElement(*request.rootId, rootElement);
    root.parentId = record.parentId;
    root.scope = record.scope;
  } else {
    const winrt::com_ptr<IUIAutomationElement> window = RootForWindow(context.window);
    const HRESULT result =
        window->BuildUpdatedCache(CreateCacheRequest(TreeScope_Element, true).get(), rootElement.put());
    if (FAILED(result) || !rootElement) {
      FailHresult(IsWindow(context.window) != FALSE ? kErrorAutomationFailed : kErrorNoSuchWindow,
                  "Reading the window automation element", result);
    }
    root.scope = context.primary ? ElementScope::Application : ElementScope::SecondaryWindow;
  }

  UiaObservationSource source(*this, context, std::move(rootElement), request.rootId);
  return SampleObservation(source, root, request, token, SteadyMilliseconds, startedAt);
}

std::size_t Automation::ReleaseElements(const std::vector<std::string>& ids) {
  return registry_.Release(ids);
}

ElementSnapshot Automation::SnapshotElement(const std::string& elementId, const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();
  winrt::com_ptr<IUIAutomationElement> refreshed;
  const ElementRecord record = RefreshElement(elementId, refreshed);
  HWND window = record.window;
  if (window == nullptr || IsWindow(window) == FALSE) {
    UIA_HWND nativeWindow = nullptr;
    if (SUCCEEDED(refreshed->get_CachedNativeWindowHandle(&nativeWindow))) {
      window = static_cast<HWND>(nativeWindow);
    }
  }
  ElementSnapshot snapshot = ReadSnapshot(refreshed.get(), record.windowId, record.parentId, record.scope, elementId);

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
  // The element inherits what is already known about it only while the known
  // record is plausibly the same element.
  if (const ElementRecord* known = registry_.FindByRuntimeKey(runtimeKey);
      known != nullptr && !FingerprintsConflict(known->fingerprint, FingerprintFromCache(focused.get()))) {
    parentId = known->parentId;
    scope = known->scope;
  }
  const std::string id = RegisterElement(focused.get(), runtimeKey, context.windowId, context.window, parentId, scope,
                                         registry_.BeginObservation());
  ElementSnapshot snapshot = ReadSnapshot(focused.get(), context.windowId, parentId, scope, id);
  const WindowMetrics metrics = MeasureWindow(context.window);
  snapshot.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics);
  return snapshot;
}

namespace {

// A hit outside the target's process is described as an opaque external window
// and never registered, so no foreign element enters the registry under a window
// it does not belong to.
ElementSnapshot ExternalWindowSnapshot(const WindowContext& context, const std::optional<RECT>& bounds) {
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
  intercepted.checked.supported = false;
  intercepted.checked.reason = "An external desktop window does not expose checked state.";
  intercepted.selected = Unsupported("An external desktop window does not expose selected state.");
  intercepted.expanded = Unsupported("An external desktop window does not expose expanded state.");
  if (bounds) {
    intercepted.physicalRect = *bounds;
    intercepted.rect = PhysicalRectToClientDips(*bounds, MeasureWindow(context.window));
  }
  return intercepted;
}

}  // namespace

std::optional<ElementSnapshot> Automation::HitTest(const WindowContext& context, POINT screenPoint,
                                                   const CancellationToken& token) {
  Initialize();
  token.ThrowIfCancelled();
  DWORD targetProcessId = 0;
  GetWindowThreadProcessId(context.window, &targetProcessId);
  const HWND pointWindow = WindowFromPoint(screenPoint);
  if (pointWindow == nullptr) {
    // No window exists at the point, for example beyond every monitor, where
    // UI Automation would answer with the desktop root.
    return std::nullopt;
  }
  DWORD pointProcessId = 0;
  GetWindowThreadProcessId(pointWindow, &pointProcessId);
  if (pointProcessId != 0 && targetProcessId != 0 && pointProcessId != targetProcessId) {
    RECT bounds{};
    const bool measured = GetWindowRect(GetAncestor(pointWindow, GA_ROOT), &bounds) != FALSE;
    return ExternalWindowSnapshot(context, measured ? std::optional<RECT>(bounds) : std::nullopt);
  }
  winrt::com_ptr<IUIAutomationElement> hit;
  const HRESULT result =
      automation_->ElementFromPointBuildCache(screenPoint, CreateCacheRequest(TreeScope_Element, true).get(),
                                              hit.put());
  if (FAILED(result) || !hit) {
    return std::nullopt;
  }
  // UI Automation can answer with an element of another process even when the
  // window under the point belongs to the target, for example an overlay with
  // its own provider.
  const DWORD hitProcessId = FingerprintFromCache(hit.get()).processId;
  if (hitProcessId != 0 && targetProcessId != 0 && hitProcessId != targetProcessId) {
    RECT bounds{};
    const bool measured = SUCCEEDED(hit->get_CachedBoundingRectangle(&bounds));
    return ExternalWindowSnapshot(context, measured ? std::optional<RECT>(bounds) : std::nullopt);
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
    if (const ElementRecord* known = registry_.FindByRuntimeKey(key);
        known != nullptr && !FingerprintsConflict(known->fingerprint, FingerprintLive(cursor.get()))) {
      resolved = cursor;
      resolvedId = known->id;
      parentId = known->parentId;
      scope = known->scope;
      break;
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
  std::string id = resolvedId;
  if (id.empty()) {
    id = RegisterElement(cached.get(), runtimeKey, context.windowId, context.window, parentId, scope,
                         registry_.BeginObservation());
  } else {
    registry_.Refresh(id, cached, FingerprintFromCache(cached.get()));
  }
  ElementSnapshot snapshot = ReadSnapshot(cached.get(), context.windowId, parentId, scope, id);
  const WindowMetrics metrics = MeasureWindow(context.window);
  snapshot.rect = PhysicalRectToClientDips(snapshot.physicalRect, metrics);
  return snapshot;
}

void Automation::SetFocus(const std::string& elementId) {
  const ElementRecord& record = RequireRecord(elementId);
  const winrt::com_ptr<IUIAutomationElement> element = record.element;
  const HRESULT result = BoundedMutation([element]() { return element->SetFocus(); }, "Focusing the element");
  if (result == UIA_E_ELEMENTNOTAVAILABLE) {
    Fail(kErrorStaleElement, "Element \"" + elementId + "\" is no longer available.");
  }
  if (FAILED(result)) {
    FailHresult(kErrorNotInteractable, "Focusing the element", result);
  }
}

bool Automation::HasKeyboardFocus(const std::string& elementId, HRESULT& failure) {
  const ElementRecord& record = RequireRecord(elementId);
  const winrt::com_ptr<IUIAutomationElement> element = record.element;
  const auto focused = std::make_shared<BOOL>(FALSE);
  const HRESULT result = BoundedRead([element, focused]() { return element->get_CurrentHasKeyboardFocus(focused.get()); },
                                     "Reading the element focus state");
  if (result == UIA_E_ELEMENTNOTAVAILABLE) {
    Fail(kErrorStaleElement, "Element \"" + elementId + "\" is no longer available.");
  }
  failure = FAILED(result) ? result : S_OK;
  return SUCCEEDED(result) && *focused != FALSE;
}

void Automation::AccessibilityClick(const std::string& elementId, const CancellationToken& token) {
  const ElementRecord& record = RequireRecord(elementId);
  const winrt::com_ptr<IUIAutomationElement> element = record.element;
  token.ThrowIfCancelled();

  const auto invoke = QueryPattern<IUIAutomationInvokePattern>(element.get(), UIA_InvokePatternId);
  if (RequirePatternQuery(invoke, "Reading the element's Invoke pattern")) {
    const winrt::com_ptr<IUIAutomationInvokePattern> pattern = invoke.pattern;
    CheckClickResult("Invoking the element",
                     CountedMutation([pattern]() { return pattern->Invoke(); }, "Invoking the element"));
    return;
  }
  const auto toggle = QueryPattern<IUIAutomationTogglePattern>(element.get(), UIA_TogglePatternId);
  if (RequirePatternQuery(toggle, "Reading the element's Toggle pattern")) {
    const winrt::com_ptr<IUIAutomationTogglePattern> pattern = toggle.pattern;
    CheckClickResult("Toggling the element",
                     CountedMutation([pattern]() { return pattern->Toggle(); }, "Toggling the element"));
    return;
  }
  const auto selection = QueryPattern<IUIAutomationSelectionItemPattern>(element.get(), UIA_SelectionItemPatternId);
  if (RequirePatternQuery(selection, "Reading the element's SelectionItem pattern")) {
    const winrt::com_ptr<IUIAutomationSelectionItemPattern> pattern = selection.pattern;
    CheckClickResult("Selecting the element",
                     CountedMutation([pattern]() { return pattern->Select(); }, "Selecting the element"));
    return;
  }
  const auto expandQuery = QueryPattern<IUIAutomationExpandCollapsePattern>(element.get(), UIA_ExpandCollapsePatternId);
  if (RequirePatternQuery(expandQuery, "Reading the element's ExpandCollapse pattern")) {
    const winrt::com_ptr<IUIAutomationExpandCollapsePattern> expand = expandQuery.pattern;
    const auto state = std::make_shared<ExpandCollapseState>(ExpandCollapseState_Collapsed);
    CheckHresult(kErrorAutomationFailed, "Reading the expand state",
                 BoundedRead([expand, state]() { return expand->get_CurrentExpandCollapseState(state.get()); },
                             "Reading the expand state"));
    if (*state == ExpandCollapseState_LeafNode) {
      throw HelperError(kErrorUnsupported, "The element is a leaf node and cannot be activated through accessibility.",
                         "activation-unsupported");
    }
    const bool collapse = *state == ExpandCollapseState_Expanded;
    CheckClickResult("Expanding or collapsing the element",
                     CountedMutation([expand, collapse]() { return collapse ? expand->Collapse() : expand->Expand(); },
                                     "Expanding or collapsing the element"));
    return;
  }
  // The legacy bridge can synthesize a nonempty default action and acknowledge
  // it without dispatching any actionable UIA pattern.
  throw HelperError(kErrorUnsupported,
                     "The element does not implement an actionable Invoke, Toggle, SelectionItem, or ExpandCollapse pattern.",
                     "activation-unsupported");
}

json::Value Automation::AccessibilityActions(const std::string& elementId, const CancellationToken& token) {
  const ElementSnapshot snapshot = SnapshotElement(elementId, token);
  json::Value names = json::Value::Array();
  json::Value keys = json::Value::Array();
  for (const auto& action : kAccessibilityActions) {
    if (snapshot.*(action.available)) {
      names.Append(json::Value::String(std::string(action.name)));
      keys.Append(json::Value::String(ActionKey(action)));
    }
  }
  json::Value result = json::Value::Object();
  result.Set("actions", std::move(names));
  result.Set("keys", std::move(keys));
  return result;
}

void Automation::PerformAccessibilityAction(const std::string& elementId, const std::string& key,
                                            const CancellationToken& token) {
  const ElementSnapshot snapshot = SnapshotElement(elementId, token);
  std::optional<std::size_t> matched;
  for (std::size_t index = 0; index < std::size(kAccessibilityActions); ++index) {
    const auto& action = kAccessibilityActions[index];
    if (snapshot.*(action.available) && ActionKey(action) == key) {
      if (matched) {
        ActionChanged();
      }
      matched = index;
    }
  }
  if (!matched) {
    ActionChanged();
  }
  const auto element = RequireRecord(elementId).element;
  switch (*matched) {
    case 0:
      PerformPatternAction(element.get(), UIA_InvokePatternId, &IUIAutomationInvokePattern::Invoke, token);
      break;
    case 1:
      PerformPatternAction(element.get(), UIA_TogglePatternId, &IUIAutomationTogglePattern::Toggle, token);
      break;
    case 2:
      PerformPatternAction(element.get(), UIA_ExpandCollapsePatternId, &IUIAutomationExpandCollapsePattern::Expand, token);
      break;
    case 3:
      PerformPatternAction(element.get(), UIA_ExpandCollapsePatternId, &IUIAutomationExpandCollapsePattern::Collapse, token);
      break;
    case 4:
      PerformPatternAction(element.get(), UIA_SelectionItemPatternId, &IUIAutomationSelectionItemPattern::Select, token);
      break;
    case 5:
      PerformPatternAction(element.get(), UIA_SelectionItemPatternId, &IUIAutomationSelectionItemPattern::AddToSelection, token);
      break;
    case 6:
      PerformPatternAction(element.get(), UIA_SelectionItemPatternId, &IUIAutomationSelectionItemPattern::RemoveFromSelection, token);
      break;
    case 7:
      PerformPatternAction(element.get(), UIA_ScrollItemPatternId, &IUIAutomationScrollItemPattern::ScrollIntoView, token);
      break;
  }
}

bool Automation::TryClearValue(const std::string& elementId, bool strict) {
  const ElementRecord& record = RequireRecord(elementId);
  const auto query = QueryPattern<IUIAutomationValuePattern>(record.element.get(), UIA_ValuePatternId);
  if (query.status != PatternStatus::Available) {
    // Without a strict request the keyboard clear is the fallback, and it
    // reports a stale element itself.
    if (!strict) {
      return false;
    }
    if (!RequirePatternQuery(query, "Reading the element value pattern")) {
      Fail(kErrorNotInteractable, "The element does not expose a writable value to clear.");
    }
  }
  const winrt::com_ptr<IUIAutomationValuePattern> value = query.pattern;
  const auto readOnly = std::make_shared<BOOL>(TRUE);
  const HRESULT state = BoundedRead([value, readOnly]() { return value->get_CurrentIsReadOnly(readOnly.get()); },
                                    "Reading the element value state");
  if (FAILED(state) || *readOnly != FALSE) {
    if (!strict) {
      return false;
    }
    if (state == UIA_E_ELEMENTNOTAVAILABLE) {
      Fail(kErrorStaleElement, "The element is no longer available.");
    }
    CheckHresult(kErrorAutomationFailed, "Reading the element value state", state);
    Fail(kErrorNotInteractable, "The element's value is read-only, so it cannot be cleared.");
  }
  const HRESULT result = CountedMutation(
      [value]() {
        const BSTR empty = SysAllocString(L"");
        const HRESULT assigned = value->SetValue(empty);
        SysFreeString(empty);
        return assigned;
      },
      "Clearing the element value");
  if (strict) {
    if (result == UIA_E_ELEMENTNOTAVAILABLE) {
      Fail(kErrorStaleElement, "The element is no longer available.");
    }
    CheckHresult(result == UIA_E_ELEMENTNOTENABLED ? kErrorNotInteractable : kErrorAutomationFailed,
                 "Clearing the element value", result);
  }
  return SUCCEEDED(result);
}

void Automation::ForgetWindow(const std::string& windowId) {
  registry_.ForgetWindow(windowId);
}

void Automation::Reset() {
  registry_.Clear();
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
