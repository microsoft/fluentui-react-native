#pragma once

#include "common.h"

#include <UIAutomation.h>

#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include <winrt/base.h>

#include "geometry.h"
#include "json.h"

namespace furn {

inline constexpr std::size_t kMaximumTreeNodes = 5000;

enum class ElementScope { Application, Chrome, Preview, SecondaryWindow };

enum class CheckedValue { False, True, Mixed };

// Mirrors the SupportedValue<T> contract: an unavailable native state is never
// flattened into false.
struct SupportedBool {
  bool supported{true};
  bool value{false};
  std::string reason;
};

struct SupportedChecked {
  bool supported{true};
  CheckedValue value{CheckedValue::False};
  std::string reason;
};

struct ElementSnapshot {
  std::string id;
  std::string automationId;
  std::string name;
  std::string value;
  std::string text;
  bool hasValue{false};
  bool hasText{false};
  std::string role;
  std::string parentId;
  std::string windowId;
  ElementScope scope{ElementScope::Chrome};
  RectD rect;
  RECT physicalRect{};
  SupportedBool enabled;
  SupportedBool focused;
  SupportedBool visible;
  SupportedBool expanded;
  SupportedBool selected;
  SupportedChecked checked;
  bool invokePattern{false};
  bool legacyPattern{false};
  bool togglePattern{false};
  bool selectionItemPattern{false};
  bool expandCollapsePattern{false};
  bool valuePattern{false};
  bool valueReadOnly{false};
  bool keyboardFocusable{false};
};

struct Selector {
  std::string strategy;
  std::string value;
};

struct WindowContext {
  std::string windowId;
  HWND window{nullptr};
  bool primary{false};
  std::wstring storyRootTestId;
};

struct ElementRecord {
  std::string id;
  winrt::com_ptr<IUIAutomationElement> element;
  std::string windowId;
  HWND window{nullptr};
  std::string parentId;
  ElementScope scope{ElementScope::Chrome};
};

std::string RoleForControlType(CONTROLTYPEID controlType);
std::string NormalizeRoleQuery(std::string_view value);
const char* ScopeName(ElementScope scope);
bool MatchesSelector(const ElementSnapshot& snapshot, const Selector& selector);

// Owns the UI Automation client, the opaque element table, and every read of
// the native tree. All members must be used from the dedicated MTA worker.
class Automation {
 public:
  void Initialize();

  std::vector<ElementSnapshot> SnapshotWindowTree(const WindowContext& context, const CancellationToken& token);
  std::vector<ElementSnapshot> Find(const WindowContext& context, const std::string& rootElementId,
                                    const Selector& selector, const CancellationToken& token);
  ElementSnapshot SnapshotElement(const std::string& elementId, const CancellationToken& token);
  std::optional<ElementSnapshot> ActiveElement(const WindowContext& context, const CancellationToken& token);
  std::optional<ElementSnapshot> HitTest(const WindowContext& context, POINT screenPoint,
                                         const CancellationToken& token);

  const ElementRecord& RequireRecord(const std::string& elementId) const;
  void SetFocus(const std::string& elementId);
  void AccessibilityClick(const std::string& elementId, const CancellationToken& token);
  bool TryClearValue(const std::string& elementId);
  bool HasKeyboardFocus(const std::string& elementId);

  void ForgetWindow(const std::string& windowId);
  void Reset();

  std::string SerializeSourceXml(const std::vector<ElementSnapshot>& snapshots) const;

 private:
  winrt::com_ptr<IUIAutomationCacheRequest> CreateCacheRequest(TreeScope scope, bool controlViewOnly) const;
  winrt::com_ptr<IUIAutomationElement> RootForWindow(HWND window) const;
  winrt::com_ptr<IUIAutomationElement> ParentOf(IUIAutomationElement* element) const;
  std::vector<ElementSnapshot> WalkCachedSubtree(IUIAutomationElement* root, const WindowContext& context,
                                                 ElementScope rootScope, const std::string& rootParentId,
                                                 const CancellationToken& token, bool controlViewOnly);
  ElementSnapshot ReadSnapshot(IUIAutomationElement* element, const std::string& windowId, const std::string& parentId,
                               ElementScope scope, const std::string& knownId);
  std::string RegisterElement(IUIAutomationElement* element, const std::wstring& runtimeKey,
                              const std::string& windowId, HWND window, const std::string& parentId,
                              ElementScope scope);
  std::wstring RuntimeKeyFromCache(IUIAutomationElement* element) const;
  std::wstring RuntimeKeyLive(IUIAutomationElement* element) const;
  bool IsNotSupported(const VARIANT& value) const;

  winrt::com_ptr<IUIAutomation> automation_;
  winrt::com_ptr<IUIAutomationCondition> controlViewCondition_;
  winrt::com_ptr<IUIAutomationCondition> rawViewCondition_;
  winrt::com_ptr<IUIAutomationTreeWalker> rawWalker_;
  winrt::com_ptr<IUnknown> notSupportedValue_;
  std::unordered_map<std::string, ElementRecord> recordsById_;
  std::unordered_map<std::wstring, std::string> idsByRuntimeKey_;
};

json::Value SerializeSnapshot(const ElementSnapshot& snapshot);

}  // namespace furn
