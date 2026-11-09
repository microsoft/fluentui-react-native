#pragma once

#include "common.h"

#include <UIAutomation.h>

#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include <winrt/base.h>

#include "elementregistry.h"
#include "geometry.h"
#include "json.h"
#include "observation.h"

namespace furn {

inline constexpr std::size_t kMaximumTreeNodes = 5000;

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
  SupportedString helpText{false, {}, "The provider does not report accessibility help text."};
  SupportedBool required{false, false, "The provider does not report required-form state."};
  SupportedBool visible;
  SupportedBool expanded;
  SupportedBool selected;
  SupportedChecked checked;
  bool invokePattern{false};
  bool legacyPattern{false};
  bool togglePattern{false};
  bool selectionItemPattern{false};
  bool expandCollapsePattern{false};
  bool scrollItemPattern{false};
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

std::string RoleForControlType(CONTROLTYPEID controlType);
std::string NormalizeRoleQuery(std::string_view value);
const char* ScopeName(ElementScope scope);
bool MatchesSelector(const ElementSnapshot& snapshot, const Selector& selector);

// Owns the UI Automation client, the opaque element table, and every read of
// the native tree. All members must be used from the dedicated MTA worker.
class Automation {
 public:
  explicit Automation(std::size_t retainedElementLimit = kMaximumRetainedElements)
      : registry_(retainedElementLimit) {}

  void Initialize();

  std::vector<ElementSnapshot> SnapshotWindowTree(const WindowContext& context, const CancellationToken& token);
  std::vector<ElementSnapshot> Find(const WindowContext& context, const std::string& rootElementId,
                                    const Selector& selector, const CancellationToken& token);
  ElementSnapshot SnapshotElement(const std::string& elementId, const CancellationToken& token);
  std::optional<ElementSnapshot> ActiveElement(const WindowContext& context, const CancellationToken& token);
  std::optional<ElementSnapshot> HitTest(const WindowContext& context, POINT screenPoint,
                                         const CancellationToken& token);

  // A bounded breadth-first sample of the window, or of a tracked element in it
  // (PROTOCOL.md "Bounded observation"). Each family of children is paged one
  // control-view sibling at a time; nothing caches a subtree. Every emitted id
  // is pinned until ReleaseElements or ForgetWindow drops it. A hung provider
  // call ends within the UI Automation transaction timeout set in Initialize.
  ObservedSample Observe(const WindowContext& context, const ObserveRequest& request, const CancellationToken& token);
  // Drops exactly the tracked ids named and returns how many it dropped.
  std::size_t ReleaseElements(const std::vector<std::string>& ids);
  // A copy of the tracked record, stamped as recently used; stale-element when
  // the id is not tracked. It does not check that the native element still
  // matches: SnapshotElement does, immediately before an action dispatches.
  ElementRecord RequireRecord(const std::string& elementId);
  void SetFocus(const std::string& elementId);
  void AccessibilityClick(const std::string& elementId, const CancellationToken& token);
  json::Value AccessibilityActions(const std::string& elementId, const CancellationToken& token);
  void PerformAccessibilityAction(const std::string& elementId, const std::string& key, const CancellationToken& token);
  // Writes an empty value through the Value pattern and reports whether that
  // cleared the element. Without `strict`, an element without a writable value
  // or a refused write returns false so the caller can clear with the
  // keyboard. With it, the method never returns false: such an element fails
  // as not interactable before anything is dispatched, and a failed write
  // fails with the effect the ledger recorded.
  bool TryClearValue(const std::string& elementId, bool strict = false);
  bool HasKeyboardFocus(const std::string& elementId);

  void ForgetWindow(const std::string& windowId);
  void Reset();

  // How many elements the helper currently tracks and the cap that bounds them,
  // for diagnostics. Both are read on the command thread.
  std::size_t RetainedElementCount() const noexcept { return registry_.size(); }
  std::size_t RetainedElementLimit() const noexcept { return registry_.capacity(); }

  std::string SerializeSourceXml(const std::vector<ElementSnapshot>& snapshots) const;

  ElementRegistry& RegistryForTesting() noexcept { return registry_; }

 private:
  friend class UiaObservationSource;

  winrt::com_ptr<IUIAutomationCacheRequest> CreateCacheRequest(TreeScope scope, bool controlViewOnly) const;
  winrt::com_ptr<IUIAutomationElement> RootForWindow(HWND window) const;
  winrt::com_ptr<IUIAutomationElement> ParentOf(IUIAutomationElement* element) const;
  std::vector<ElementSnapshot> WalkCachedSubtree(IUIAutomationElement* root, const WindowContext& context,
                                                 ElementScope rootScope, const std::string& rootParentId,
                                                 const CancellationToken& token, bool controlViewOnly);
  // Whether the subtree beneath root, including root, has more than limit nodes. Reads one child at a time and stops
  // after limit + 1 nodes; false also means the count could not be completed.
  bool SubtreeExceeds(IUIAutomationElement* root, std::size_t limit, bool controlViewOnly,
                      const CancellationToken& token) const;
  ElementSnapshot ReadSnapshot(IUIAutomationElement* element, const std::string& windowId, const std::string& parentId,
                               ElementScope scope, const std::string& knownId);
  std::string RegisterElement(IUIAutomationElement* element, const std::wstring& runtimeKey,
                              const std::string& windowId, HWND window, const std::string& parentId,
                              ElementScope scope, std::uint64_t generation);
  // Refreshes the native element behind an id and proves it is still the element
  // the id was issued for: stale-element when it is gone or a different element
  // has reused its native identity. Returns the record as it was before.
  ElementRecord RefreshElement(const std::string& elementId, winrt::com_ptr<IUIAutomationElement>& refreshed);
  std::wstring RuntimeKeyFromCache(IUIAutomationElement* element) const;
  std::wstring RuntimeKeyLive(IUIAutomationElement* element) const;
  bool IsNotSupported(const VARIANT& value) const;

  winrt::com_ptr<IUIAutomation> automation_;
  winrt::com_ptr<IUIAutomationCondition> controlViewCondition_;
  winrt::com_ptr<IUIAutomationCondition> rawViewCondition_;
  winrt::com_ptr<IUIAutomationTreeWalker> rawWalker_;
  winrt::com_ptr<IUIAutomationTreeWalker> controlWalker_;
  winrt::com_ptr<IUnknown> notSupportedValue_;
  ElementRegistry registry_;
};

json::Value SerializeSnapshot(const ElementSnapshot& snapshot);

}  // namespace furn
