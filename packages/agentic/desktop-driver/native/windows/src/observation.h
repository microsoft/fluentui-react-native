#pragma once

#include "common.h"

#include <cstddef>
#include <cstdint>
#include <functional>
#include <memory>
#include <optional>
#include <string>
#include <utility>
#include <vector>

#include "elementregistry.h"
#include "geometry.h"
#include "json.h"

namespace furn {

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

struct SupportedString {
  bool supported{false};
  std::string value;
  std::string reason;
};

json::Value SerializeSupported(const SupportedBool& state);
json::Value SerializeSupported(const SupportedString& state);
json::Value SerializeChecked(const SupportedChecked& state);

// The `facts` an `observe` request can name, in the contract's order.
enum class ObserveFact {
  Actions,
  Checked,
  Enabled,
  Expanded,
  Focused,
  Geometry,
  Help,
  Required,
  Selected,
  Text,
  Value,
  Visible,
};

const char* ObserveFactName(ObserveFact fact);

struct ObserveBudget {
  std::size_t maxVisited{0};
  std::size_t maxDepth{0};
  std::size_t maxStringLength{0};
  std::size_t maxBytes{0};
  std::int64_t deadlineMs{0};
};

struct ObserveRequest {
  std::string windowId;
  std::optional<std::string> rootId;
  ObserveBudget budget;
  std::vector<ObserveFact> facts;
};

// Parses `observe` params as PROTOCOL.md "Bounded observation" states them and
// fails as invalid-params on anything else: a missing, non-integer, or
// out-of-range budget field (never clamped), an unknown field, an unknown or
// repeated fact, or an id that is empty or longer than 256 UTF-8 bytes.
ObserveRequest ParseObserveRequest(const json::Value& params);

// Parses `releaseElements` params: at most 1,000 distinct ids of 1 to 256 UTF-8
// bytes and no other field.
std::vector<std::string> ParseReleaseElementsRequest(const json::Value& params);

// Cuts a UTF-8 string to `limit` UTF-16 code units. A cut that would separate a
// surrogate pair drops its high half, so the result may be one unit shorter.
// Returns true when the string was cut.
bool ClipToUtf16Units(std::string& value, std::size_t limit);

// Everything a provider read about one element. The sampler emits only what the
// request names.
struct ObservedFacts {
  std::string role;
  std::string name;
  std::string automationId;
  // A password or other secure field: its value and text are never reported.
  bool secure{false};
  // Absent when the platform has no action list for the element; emitted as an
  // empty list then.
  std::optional<std::vector<std::string>> actions;
  SupportedChecked checked;
  SupportedBool enabled;
  SupportedBool expanded;
  SupportedBool focused;
  RectD rect;
  SupportedString helpText;
  SupportedBool required;
  SupportedBool selected;
  std::optional<std::string> text;
  std::optional<std::string> value;
  SupportedBool visible;
};

// The scope an element reports and the scope its children inherit.
struct ObservedScopes {
  ElementScope self{ElementScope::Chrome};
  ElementScope children{ElementScope::Chrome};
};

// A provider handle for one element, owned by the source.
using ObservationHandle = std::size_t;

// Pages one element's children in provider order. Every call is one bounded
// provider step, so the sampler can stop between any two children.
class ObservationChildCursor {
 public:
  virtual ~ObservationChildCursor() = default;
  // The next child, or nothing after the last one. Throws stale-element when the
  // parent is gone and another HelperError when the list cannot be read.
  virtual std::optional<ObservationHandle> Next() = 0;
};

// What the sampler needs from a provider. The UI Automation source lives in
// automation.cpp; the self-tests drive a synthetic one.
class ObservationSource {
 public:
  virtual ~ObservationSource() = default;
  // Facts no element of this provider can report.
  virtual std::vector<ObserveFact> UnsupportedFacts() const = 0;
  // Throws stale-element when the element is gone and another HelperError when
  // it cannot be read.
  virtual ObservedFacts Read(ObservationHandle handle) = 0;
  // Starts paging the children; it makes no provider call itself.
  virtual std::unique_ptr<ObservationChildCursor> Children(ObservationHandle handle) = 0;
  // The provider identity that detects one element reached twice; empty never
  // matches.
  virtual std::wstring Key(ObservationHandle handle) const = 0;
  virtual ObservedScopes Scopes(ElementScope inherited, const ObservedFacts& facts) const = 0;
  // The element's id, retained until it is released or its window is
  // forgotten; nothing when the element table has no room for it.
  virtual std::optional<std::string> Identify(ObservationHandle handle, const std::string& parentId,
                                              ElementScope scope) = 0;
};

struct ObservationRoot {
  ObservationHandle handle{0};
  // The parent the root's record keeps; never emitted.
  std::string parentId;
  ElementScope scope{ElementScope::Chrome};
};

enum class ChildrenState { None, Complete, Truncated, Unknown };

struct ObservedNode {
  std::string id;
  std::size_t depth{0};
  std::string role;
  ElementScope scope{ElementScope::Chrome};
  std::string parentId;
  ChildrenState childrenState{ChildrenState::Unknown};
  std::optional<std::size_t> childCount;
  // The requested facts and `clipped`, in response order, after `childCount`.
  json::Value body;
};

struct ObservationTruncation {
  std::string reason;
  std::optional<std::int64_t> limit;
  std::size_t unvisited{0};
};

struct ObservedSample {
  std::vector<ObservedNode> nodes;
  std::vector<ObservationTruncation> truncation;
  std::int64_t elapsedMs{0};
  std::vector<ObserveFact> unsupportedFacts;

  bool complete() const noexcept { return truncation.empty(); }
  json::Value ToJson() const;
};

// Milliseconds on a monotonic clock; tests substitute their own.
using ObservationClock = std::function<std::int64_t()>;
std::int64_t SteadyMilliseconds();

// Walks breadth first from the root under the request's budget and returns the
// sample. Each family of children is paged one provider call at a time, so every
// limit takes effect between two siblings, and no provider call starts after the
// deadline except the root's read. Cancellation throws CancelledError and leaves
// every record already identified in place. A stale root throws stale-element.
// `startedAt` is when the command began, so time spent reaching the root counts.
ObservedSample SampleObservation(ObservationSource& source, const ObservationRoot& root,
                                 const ObserveRequest& request, const CancellationToken& token,
                                 const ObservationClock& clock = SteadyMilliseconds,
                                 std::optional<std::int64_t> startedAt = std::nullopt);

}  // namespace furn
