#pragma once

#include "common.h"

#include <UIAutomation.h>

#include <cstddef>
#include <cstdint>
#include <optional>
#include <string>
#include <unordered_map>
#include <vector>

#include <winrt/base.h>

namespace furn {

enum class ElementScope { Application, Chrome, Preview, SecondaryWindow };

// How many element references the helper keeps addressable. One observation is
// capped at kMaximumTreeNodes (5000), so this holds several complete
// observations. Beyond it the least recently used references are released and
// answer stale-element, so a long session reaches a plateau instead of growing
// with every element it has ever seen.
inline constexpr std::size_t kMaximumRetainedElements = 20000;

// What a provider reports about an element that should not change while the
// element lives. UI Automation runtime identifiers can be recycled, most often
// when a destroyed window's handle is reused, so an id is trusted to still mean
// the element it was issued for only while no known property differs. A zero or
// empty value means the provider did not answer and is compatible with anything.
// The name is deliberately absent because it legitimately changes.
//
// This is a precondition, not proof of identity: a replacement that reports the
// same values is indistinguishable from the original.
struct ElementFingerprint {
  DWORD processId{0};
  CONTROLTYPEID controlType{0};
  std::string automationId;
  std::string className;
};

// True only when a value known on both sides differs.
bool FingerprintsConflict(const ElementFingerprint& known, const ElementFingerprint& observed);

// The known fingerprint with every field it lacked filled from the observation.
ElementFingerprint MergeFingerprints(const ElementFingerprint& known, const ElementFingerprint& observed);

struct ElementRecord {
  std::string id;
  winrt::com_ptr<IUIAutomationElement> element;
  std::string windowId;
  HWND window{nullptr};
  std::string parentId;
  ElementScope scope{ElementScope::Chrome};
  ElementFingerprint fingerprint;
  std::wstring runtimeKey;
  std::uint64_t generation{0};
  // Issued by `observe`: retained until it is released, its window is
  // forgotten, or a different element reuses its native identity. Eviction
  // never takes a pinned record or any of its ancestors.
  bool pinned{false};
};

// The opaque element table. It never calls UI Automation, so its identity and
// retention rules are testable without a provider.
//
// Ids are minted from a process-wide monotonic counter and are never reused, so
// an id that was dropped can only ever answer stale-element, never address
// another element.
//
// Retention is by generation. Each observation (a tree walk, one hit test, one
// refresh) takes a generation, and every record it registers or uses is stamped
// with it together with its ancestors, so a record is never older than any of
// its descendants. When the table exceeds its capacity, everything unpinned at
// or below an old-enough generation is dropped; the observation in progress, a
// pinned record, and a pinned record's ancestors are never dropped, so eviction
// never leaves a retained record without its parent.
//
// Pinned records come from `observe`, which never evicts to make room: when
// pinned records and the observation in progress fill the table, a pinned
// registration fails and the sample ends with the `references` truncation.
// `Release` drops only the records it names, so a record whose parent was
// released keeps naming that parent's id, which then answers stale-element.
//
// Not thread-safe: use it from the automation worker only.
class ElementRegistry {
 public:
  explicit ElementRegistry(std::size_t capacity = kMaximumRetainedElements);

  std::uint64_t BeginObservation() noexcept { return ++generation_; }

  // Returns the id for an element. A runtime key that is already known keeps its
  // id while the fingerprints agree; when they conflict, the old record and
  // every unpinned record beneath it are dropped (their ids become stale) and
  // the element gets a new id. An empty key never matches and always gets a new
  // id. The candidate's id, generation, and pin are ignored; a known record
  // keeps its pin. A named parent must already be registered, which a walk that
  // registers parents before children satisfies.
  std::string Register(ElementRecord candidate, std::uint64_t generation);

  // Registers as Register does and pins the record. A new record that would
  // exceed the capacity first evicts unpinned records; when that leaves no room,
  // nothing is registered and the result is empty.
  std::optional<std::string> RegisterPinned(ElementRecord candidate, std::uint64_t generation);

  // Pins a tracked record and stamps it; false when the id is not tracked.
  bool Pin(const std::string& id, std::uint64_t generation);

  // Drops exactly the named records that are tracked, pinned or not, and returns
  // how many it dropped. Unknown ids are ignored and descendants stay.
  std::size_t Release(const std::vector<std::string>& ids);

  // A copy of the record, stamped as just used. Throws stale-element when the id
  // is not tracked.
  ElementRecord Require(const std::string& id);

  // The record a runtime key currently maps to, without regard to fingerprints.
  // The pointer is valid until the next mutation.
  const ElementRecord* FindByRuntimeKey(const std::wstring& runtimeKey) const;

  // Replaces the element behind an id after a successful refresh and stamps it.
  void Refresh(const std::string& id, const winrt::com_ptr<IUIAutomationElement>& element,
               const ElementFingerprint& observed);
  void SetScope(const std::string& id, ElementScope scope);

  // Drops an id and every unpinned record beneath it, so no unpinned record
  // keeps naming a parent that is gone. A pinned descendant and its subtree
  // stay: the agent still holds them.
  void Erase(const std::string& id);
  void ForgetWindow(const std::string& windowId);
  void Clear() noexcept;

  bool Contains(const std::string& id) const { return records_.contains(id); }
  bool IsPinned(const std::string& id) const;
  std::size_t size() const noexcept { return records_.size(); }
  std::size_t capacity() const noexcept { return capacity_; }

  void SetFingerprintForTesting(const std::string& id, const ElementFingerprint& fingerprint);

  // True when every record that names a parent finds it tracked: the invariant
  // that eviction maintains. Release, and an erase above a pinned record, relax
  // it, because the agent still holds the records they leave behind.
  bool ParentsRetainedForTesting() const;

 private:
  using Records = std::unordered_map<std::string, ElementRecord>;

  // The id of a known record for the candidate's runtime key, refreshed from the
  // candidate, or empty after dropping a conflicting record.
  std::string Reuse(ElementRecord& candidate, std::uint64_t generation);
  std::string Insert(ElementRecord candidate, std::uint64_t generation);
  void Touch(const std::string& id, std::uint64_t generation);
  void Evict(std::uint64_t protectedGeneration);
  Records::iterator EraseRecord(Records::iterator record);

  std::size_t capacity_;
  std::uint64_t generation_{0};
  Records records_;
  std::unordered_map<std::wstring, std::string> idsByRuntimeKey_;
};

}  // namespace furn
