#include "elementregistry.h"

#include <algorithm>
#include <iterator>
#include <unordered_map>
#include <unordered_set>
#include <vector>

namespace furn {

bool FingerprintsConflict(const ElementFingerprint& known, const ElementFingerprint& observed) {
  return (known.processId != 0 && observed.processId != 0 && known.processId != observed.processId) ||
         (known.controlType != 0 && observed.controlType != 0 && known.controlType != observed.controlType) ||
         (!known.automationId.empty() && !observed.automationId.empty() &&
          known.automationId != observed.automationId) ||
         (!known.className.empty() && !observed.className.empty() && known.className != observed.className);
}

ElementFingerprint MergeFingerprints(const ElementFingerprint& known, const ElementFingerprint& observed) {
  ElementFingerprint merged = known;
  if (merged.processId == 0) {
    merged.processId = observed.processId;
  }
  if (merged.controlType == 0) {
    merged.controlType = observed.controlType;
  }
  if (merged.automationId.empty()) {
    merged.automationId = observed.automationId;
  }
  if (merged.className.empty()) {
    merged.className = observed.className;
  }
  return merged;
}

ElementRegistry::ElementRegistry(std::size_t capacity) : capacity_(std::max<std::size_t>(capacity, 1)) {}

std::string ElementRegistry::Reuse(ElementRecord& candidate, std::uint64_t generation) {
  if (candidate.runtimeKey.empty()) {
    return {};
  }
  const auto known = idsByRuntimeKey_.find(candidate.runtimeKey);
  if (known == idsByRuntimeKey_.end()) {
    return {};
  }
  const std::string knownId = known->second;
  const auto existing = records_.find(knownId);
  if (existing != records_.end() && !FingerprintsConflict(existing->second.fingerprint, candidate.fingerprint)) {
    ElementRecord& record = existing->second;
    record.element = std::move(candidate.element);
    record.windowId = std::move(candidate.windowId);
    record.window = candidate.window;
    record.parentId = std::move(candidate.parentId);
    record.scope = candidate.scope;
    record.fingerprint = MergeFingerprints(record.fingerprint, candidate.fingerprint);
    Touch(knownId, generation);
    return knownId;
  }
  // A different element now answers to this native identity, so the old id
  // must never address it.
  Erase(knownId);
  return {};
}

std::string ElementRegistry::Insert(ElementRecord candidate, std::uint64_t generation) {
  candidate.id = NextIdentifier("element");
  candidate.generation = 0;
  const std::string id = candidate.id;
  if (!candidate.runtimeKey.empty()) {
    idsByRuntimeKey_[candidate.runtimeKey] = id;
  }
  records_.emplace(id, std::move(candidate));
  Touch(id, generation);
  return id;
}

std::string ElementRegistry::Register(ElementRecord candidate, std::uint64_t generation) {
  if (std::string id = Reuse(candidate, generation); !id.empty()) {
    return id;
  }
  candidate.pinned = false;
  const std::string id = Insert(std::move(candidate), generation);
  if (records_.size() > capacity_) {
    Evict(generation);
  }
  return id;
}

std::optional<std::string> ElementRegistry::RegisterPinned(ElementRecord candidate, std::uint64_t generation) {
  if (std::string id = Reuse(candidate, generation); !id.empty()) {
    records_.at(id).pinned = true;
    return id;
  }
  if (records_.size() >= capacity_) {
    Evict(generation);
    if (records_.size() >= capacity_) {
      return std::nullopt;
    }
  }
  candidate.pinned = true;
  return Insert(std::move(candidate), generation);
}

bool ElementRegistry::Pin(const std::string& id, std::uint64_t generation) {
  const auto record = records_.find(id);
  if (record == records_.end()) {
    return false;
  }
  record->second.pinned = true;
  Touch(id, generation);
  return true;
}

std::size_t ElementRegistry::Release(const std::vector<std::string>& ids) {
  std::size_t released = 0;
  for (const std::string& id : ids) {
    if (const auto record = records_.find(id); record != records_.end()) {
      EraseRecord(record);
      released += 1;
    }
  }
  return released;
}

bool ElementRegistry::IsPinned(const std::string& id) const {
  const auto record = records_.find(id);
  return record != records_.end() && record->second.pinned;
}

ElementRecord ElementRegistry::Require(const std::string& id) {
  const auto record = records_.find(id);
  if (record == records_.end()) {
    Fail(kErrorStaleElement,
         "Element \"" + id +
             "\" is no longer tracked by the native helper: its window closed, a different element reused its native "
             "identity, or the helper released it to bound retained memory.");
  }
  Touch(id, BeginObservation());
  return record->second;
}

const ElementRecord* ElementRegistry::FindByRuntimeKey(const std::wstring& runtimeKey) const {
  if (runtimeKey.empty()) {
    return nullptr;
  }
  const auto known = idsByRuntimeKey_.find(runtimeKey);
  if (known == idsByRuntimeKey_.end()) {
    return nullptr;
  }
  const auto record = records_.find(known->second);
  return record == records_.end() ? nullptr : &record->second;
}

void ElementRegistry::Refresh(const std::string& id, const winrt::com_ptr<IUIAutomationElement>& element,
                              const ElementFingerprint& observed) {
  const auto record = records_.find(id);
  if (record == records_.end()) {
    return;
  }
  record->second.element = element;
  record->second.fingerprint = MergeFingerprints(record->second.fingerprint, observed);
  Touch(id, BeginObservation());
}

void ElementRegistry::SetScope(const std::string& id, ElementScope scope) {
  const auto record = records_.find(id);
  if (record != records_.end()) {
    record->second.scope = scope;
  }
}

void ElementRegistry::Erase(const std::string& id) {
  if (!records_.contains(id)) {
    return;
  }
  std::unordered_multimap<std::string, std::string> children;
  for (const auto& entry : records_) {
    if (!entry.second.parentId.empty()) {
      children.emplace(entry.second.parentId, entry.first);
    }
  }
  // A record is expanded only once it is erased, so a malformed parent cycle
  // ends instead of looping. A pinned descendant stops the cascade.
  std::vector<std::string> pending{id};
  while (!pending.empty()) {
    const std::string next = std::move(pending.back());
    pending.pop_back();
    const auto record = records_.find(next);
    if (record == records_.end() || (next != id && record->second.pinned)) {
      continue;
    }
    EraseRecord(record);
    const auto range = children.equal_range(next);
    for (auto child = range.first; child != range.second; ++child) {
      pending.push_back(child->second);
    }
  }
}

void ElementRegistry::ForgetWindow(const std::string& windowId) {
  for (auto record = records_.begin(); record != records_.end();) {
    record = record->second.windowId == windowId ? EraseRecord(record) : std::next(record);
  }
}

void ElementRegistry::Clear() noexcept {
  records_.clear();
  idsByRuntimeKey_.clear();
}

void ElementRegistry::SetFingerprintForTesting(const std::string& id, const ElementFingerprint& fingerprint) {
  const auto record = records_.find(id);
  if (record != records_.end()) {
    record->second.fingerprint = fingerprint;
  }
}

bool ElementRegistry::ParentsRetainedForTesting() const {
  return std::all_of(records_.begin(), records_.end(), [this](const auto& entry) {
    return entry.second.parentId.empty() || records_.contains(entry.second.parentId);
  });
}

// Raises the record and the ancestors that are older than the generation. An
// ancestor that is already as new as the generation has an ancestor chain that
// is at least as new, so the climb stops there; every step raises one record
// that the generation had not reached, so it also terminates on a malformed
// parent cycle.
void ElementRegistry::Touch(const std::string& id, std::uint64_t generation) {
  std::string cursor = id;
  while (!cursor.empty()) {
    const auto record = records_.find(cursor);
    if (record == records_.end() || record->second.generation >= generation) {
      return;
    }
    record->second.generation = generation;
    cursor = record->second.parentId;
  }
}

// Drops the oldest unpinned records until the table is about nine tenths of its
// capacity, so the cost of a pass is spread over many registrations. Everything
// at or below one generation goes together, which keeps a retained record's
// ancestors (they are never older than it), and a pinned record's ancestors are
// kept with it. The protected generation is the observation in progress; its
// records stay even when it alone exceeds the capacity.
void ElementRegistry::Evict(std::uint64_t protectedGeneration) {
  const std::size_t target = capacity_ - capacity_ / 10;
  if (records_.size() <= target) {
    return;
  }
  std::unordered_set<std::string> kept;
  for (const auto& entry : records_) {
    if (!entry.second.pinned) {
      continue;
    }
    // Every step keeps one record that was not kept before, so a malformed
    // parent cycle ends.
    std::string cursor = entry.first;
    while (!cursor.empty() && kept.insert(cursor).second) {
      const auto record = records_.find(cursor);
      cursor = record == records_.end() ? std::string() : record->second.parentId;
    }
  }
  const auto evictable = [&](const auto& entry) {
    return entry.second.generation < protectedGeneration && !kept.contains(entry.first);
  };
  std::vector<std::uint64_t> generations;
  generations.reserve(records_.size());
  for (const auto& entry : records_) {
    if (evictable(entry)) {
      generations.push_back(entry.second.generation);
    }
  }
  if (generations.empty()) {
    return;
  }
  const std::size_t count = std::min(records_.size() - target, generations.size());
  std::nth_element(generations.begin(), generations.begin() + static_cast<std::ptrdiff_t>(count - 1),
                   generations.end());
  const std::uint64_t threshold = generations[count - 1];
  for (auto record = records_.begin(); record != records_.end();) {
    record = evictable(*record) && record->second.generation <= threshold ? EraseRecord(record) : std::next(record);
  }
}

ElementRegistry::Records::iterator ElementRegistry::EraseRecord(Records::iterator record) {
  if (!record->second.runtimeKey.empty()) {
    const auto key = idsByRuntimeKey_.find(record->second.runtimeKey);
    if (key != idsByRuntimeKey_.end() && key->second == record->first) {
      idsByRuntimeKey_.erase(key);
    }
  }
  return records_.erase(record);
}

}  // namespace furn
