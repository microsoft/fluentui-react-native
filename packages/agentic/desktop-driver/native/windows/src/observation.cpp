#include "observation.h"

#include <algorithm>
#include <chrono>
#include <cmath>
#include <initializer_list>
#include <iterator>
#include <string_view>
#include <unordered_set>

#include "automation.h"

namespace furn {
namespace {

constexpr std::size_t kMaximumIdentifierBytes = 256;
constexpr std::size_t kMaximumReleasedIds = 1000;

struct FactName {
  ObserveFact fact;
  const char* name;
};

constexpr FactName kFactNames[] = {
    {ObserveFact::Actions, "actions"},   {ObserveFact::Checked, "checked"},   {ObserveFact::Enabled, "enabled"},
    {ObserveFact::Expanded, "expanded"}, {ObserveFact::Focused, "focused"},   {ObserveFact::Geometry, "geometry"},
    {ObserveFact::Help, "help"},         {ObserveFact::Required, "required"}, {ObserveFact::Selected, "selected"},
    {ObserveFact::Text, "text"},         {ObserveFact::Value, "value"},       {ObserveFact::Visible, "visible"},
};

[[noreturn]] void Invalid(std::string message) {
  Fail(kErrorInvalidParams, std::move(message));
}

// Names the first unknown field in sorted order, so the message does not depend
// on the order the client serialized its fields in.
void RejectUnknownFields(const json::Value& object, std::initializer_list<std::string_view> known,
                         std::string_view where) {
  std::vector<std::string> unknown;
  for (const auto& [key, value] : object.Members()) {
    if (std::find(known.begin(), known.end(), key) == known.end()) {
      unknown.push_back(key);
    }
  }
  if (!unknown.empty()) {
    std::sort(unknown.begin(), unknown.end());
    Invalid(std::string(where) + " has an unknown field \"" + unknown.front() + "\".");
  }
}

std::string RequireIdentifier(const json::Value& value, std::string_view what) {
  if (!value.IsString() || value.AsString().empty() || value.AsString().size() > kMaximumIdentifierBytes) {
    Invalid(std::string(what) + " must be a string of 1 to " + std::to_string(kMaximumIdentifierBytes) +
            " UTF-8 bytes.");
  }
  return value.AsString();
}

std::int64_t RequireBudgetField(const json::Value& budget, const char* key, std::int64_t minimum,
                                std::int64_t maximum) {
  const json::Value* field = budget.Find(key);
  const std::string range = std::to_string(minimum) + " to " + std::to_string(maximum);
  if (field == nullptr) {
    Invalid("The observe budget is missing \"" + std::string(key) + "\", an integer from " + range + ".");
  }
  const double number = field->AsNumber();
  if (!field->IsNumber() || !std::isfinite(number) || std::floor(number) != number ||
      number < static_cast<double>(minimum) || number > static_cast<double>(maximum)) {
    Invalid("The observe budget field \"" + std::string(key) + "\" must be an integer from " + range + ".");
  }
  return static_cast<std::int64_t>(number);
}

std::optional<ObserveFact> FactFromName(std::string_view name) {
  for (const FactName& entry : kFactNames) {
    if (name == entry.name) {
      return entry.fact;
    }
  }
  return std::nullopt;
}

const char* ChildrenStateName(ChildrenState state) {
  switch (state) {
    case ChildrenState::None:
      return "none";
    case ChildrenState::Complete:
      return "complete";
    case ChildrenState::Truncated:
      return "truncated";
    case ChildrenState::Unknown:
    default:
      return "unknown";
  }
}

json::Value SerializeObservedNode(const ObservedNode& node) {
  json::Value value = json::Value::Object();
  value.Set("childrenState", json::Value::String(std::string(ChildrenStateName(node.childrenState))));
  value.Set("depth", json::Value::Integer(static_cast<std::int64_t>(node.depth)));
  value.Set("id", json::Value::String(node.id));
  value.Set("role", json::Value::String(node.role));
  value.Set("scope", json::Value::String(std::string(ScopeName(node.scope))));
  if (!node.parentId.empty()) {
    value.Set("parentId", json::Value::String(node.parentId));
  }
  if (node.childCount) {
    value.Set("childCount", json::Value::Integer(static_cast<std::int64_t>(*node.childCount)));
  }
  for (const auto& [key, member] : node.body.Members()) {
    value.Set(key, member);
  }
  return value;
}

// The facts the request names, in response order, with every string cut to the
// budget. `name` and `automationId` are always reported when present.
json::Value ShapeBody(const ObservedFacts& facts, const std::vector<bool>& requested, std::size_t maxStringLength) {
  json::Value body = json::Value::Object();
  json::Value clipped = json::Value::Array();
  const auto has = [&](ObserveFact fact) { return requested[static_cast<std::size_t>(fact)]; };
  const auto clipInto = [&](const char* key, std::string text) {
    if (ClipToUtf16Units(text, maxStringLength)) {
      clipped.Append(json::Value::String(std::string(key)));
    }
    return json::Value::String(std::move(text));
  };

  if (!facts.name.empty()) {
    body.Set("name", clipInto("name", facts.name));
  }
  if (!facts.automationId.empty()) {
    body.Set("automationId", clipInto("automationId", facts.automationId));
  }
  if (has(ObserveFact::Actions)) {
    json::Value actions = json::Value::Array();
    if (facts.actions) {
      for (std::string action : *facts.actions) {
        ClipToUtf16Units(action, maxStringLength);
        actions.Append(json::Value::String(std::move(action)));
      }
    }
    body.Set("actions", actions);
  }
  if (has(ObserveFact::Checked)) {
    body.Set("checked", SerializeChecked(facts.checked));
  }
  if (has(ObserveFact::Enabled)) {
    body.Set("enabled", SerializeSupported(facts.enabled));
  }
  if (has(ObserveFact::Expanded)) {
    body.Set("expanded", SerializeSupported(facts.expanded));
  }
  if (has(ObserveFact::Focused)) {
    body.Set("focused", SerializeSupported(facts.focused));
  }
  if (has(ObserveFact::Geometry)) {
    json::Value rect = json::Value::Object();
    rect.Set("height", json::Value::Number(facts.rect.height));
    rect.Set("width", json::Value::Number(facts.rect.width));
    rect.Set("x", json::Value::Number(facts.rect.x));
    rect.Set("y", json::Value::Number(facts.rect.y));
    body.Set("rect", rect);
  }
  if (has(ObserveFact::Help)) {
    SupportedString help = facts.helpText;
    if (help.supported && ClipToUtf16Units(help.value, maxStringLength)) {
      clipped.Append(json::Value::String(std::string("helpText")));
    }
    body.Set("helpText", SerializeSupported(help));
  }
  if (has(ObserveFact::Required)) {
    body.Set("required", SerializeSupported(facts.required));
  }
  if (has(ObserveFact::Selected)) {
    body.Set("selected", SerializeSupported(facts.selected));
  }
  if (has(ObserveFact::Text) && facts.text && !facts.secure) {
    body.Set("text", clipInto("text", *facts.text));
  }
  if (has(ObserveFact::Value) && facts.value && !facts.secure) {
    body.Set("value", clipInto("value", *facts.value));
  }
  if (has(ObserveFact::Visible)) {
    body.Set("visible", SerializeSupported(facts.visible));
  }
  if (!clipped.Items().empty()) {
    body.Set("clipped", clipped);
  }
  return body;
}

// The serialized size of a node before its id and children are settled, with
// placeholders at least as long as anything the settled node can carry.
std::size_t EstimateNodeBytes(const ObservedNode& node) {
  ObservedNode sized = node;
  sized.id = std::string(24, 'x');
  sized.childrenState = ChildrenState::Truncated;
  sized.childCount = 9999999;
  // One separator in the enclosing array.
  return SerializeObservedNode(sized).Serialize().size() + 1;
}

// Thrown inside the sampler when the next provider call would start after the
// deadline.
struct DeadlineReached {};

}  // namespace

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

json::Value SerializeSupported(const SupportedString& state) {
  json::Value value = json::Value::Object();
  value.Set("supported", json::Value::Bool(state.supported));
  if (state.supported) {
    value.Set("value", json::Value::String(state.value));
  } else {
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

const char* ObserveFactName(ObserveFact fact) {
  for (const FactName& entry : kFactNames) {
    if (entry.fact == fact) {
      return entry.name;
    }
  }
  return "unknown";
}

ObserveRequest ParseObserveRequest(const json::Value& params) {
  if (!params.IsObject()) {
    Invalid("The observe request must be an object.");
  }
  RejectUnknownFields(params, {"budget", "facts", "rootId", "windowId"}, "The observe request");

  ObserveRequest request;
  const json::Value* windowId = params.Find("windowId");
  if (windowId == nullptr || !windowId->IsString() || windowId->AsString().empty()) {
    Invalid("The observe request requires a non-empty string \"windowId\".");
  }
  request.windowId = windowId->AsString();
  if (const json::Value* rootId = params.Find("rootId"); rootId != nullptr) {
    request.rootId = RequireIdentifier(*rootId, "The observe \"rootId\"");
  }

  const json::Value* budget = params.Find("budget");
  if (budget == nullptr || !budget->IsObject()) {
    Invalid("The observe request requires a \"budget\" object.");
  }
  RejectUnknownFields(*budget, {"deadlineMs", "maxBytes", "maxDepth", "maxStringLength", "maxVisited"},
                      "The observe budget");
  request.budget.deadlineMs = RequireBudgetField(*budget, "deadlineMs", 50, 30000);
  request.budget.maxBytes = static_cast<std::size_t>(RequireBudgetField(*budget, "maxBytes", 4096, 4194304));
  request.budget.maxDepth = static_cast<std::size_t>(RequireBudgetField(*budget, "maxDepth", 0, 64));
  request.budget.maxStringLength = static_cast<std::size_t>(RequireBudgetField(*budget, "maxStringLength", 16, 1024));
  request.budget.maxVisited = static_cast<std::size_t>(RequireBudgetField(*budget, "maxVisited", 1, 5000));

  const json::Value* facts = params.Find("facts");
  if (facts == nullptr || !facts->IsArray()) {
    Invalid("The observe request requires a \"facts\" array.");
  }
  for (const json::Value& entry : facts->Items()) {
    const std::optional<ObserveFact> fact = entry.IsString() ? FactFromName(entry.AsString()) : std::nullopt;
    if (!fact) {
      Invalid("The observe facts name an unknown fact" +
              (entry.IsString() ? " \"" + entry.AsString() + "\"." : std::string(".")));
    }
    if (std::find(request.facts.begin(), request.facts.end(), *fact) != request.facts.end()) {
      Invalid("The observe facts repeat \"" + entry.AsString() + "\".");
    }
    request.facts.push_back(*fact);
  }
  return request;
}

std::vector<std::string> ParseReleaseElementsRequest(const json::Value& params) {
  if (!params.IsObject()) {
    Invalid("The releaseElements request must be an object.");
  }
  RejectUnknownFields(params, {"ids"}, "The releaseElements request");
  const json::Value* ids = params.Find("ids");
  if (ids == nullptr || !ids->IsArray()) {
    Invalid("The releaseElements request requires an \"ids\" array.");
  }
  if (ids->Items().size() > kMaximumReleasedIds) {
    Invalid("The releaseElements request names more than " + std::to_string(kMaximumReleasedIds) + " ids.");
  }
  std::vector<std::string> result;
  std::unordered_set<std::string> seen;
  for (const json::Value& entry : ids->Items()) {
    std::string id = RequireIdentifier(entry, "Every releaseElements id");
    if (!seen.insert(id).second) {
      Invalid("The releaseElements ids repeat \"" + id + "\".");
    }
    result.push_back(std::move(id));
  }
  return result;
}

bool ClipToUtf16Units(std::string& value, std::size_t limit) {
  // A UTF-8 string never has more UTF-16 units than bytes.
  if (value.size() <= limit) {
    return false;
  }
  const std::wstring wide = ToWide(value);
  if (wide.size() <= limit) {
    return false;
  }
  std::size_t cut = limit;
  if (cut > 0 && IS_HIGH_SURROGATE(wide[cut - 1])) {
    cut -= 1;
  }
  value = ToUtf8(std::wstring_view(wide).substr(0, cut));
  return true;
}

json::Value ObservedSample::ToJson() const {
  json::Value value = json::Value::Object();
  value.Set("complete", json::Value::Bool(complete()));
  value.Set("elapsedMs", json::Value::Integer(elapsedMs));
  json::Value list = json::Value::Array();
  for (const ObservedNode& node : nodes) {
    list.Append(SerializeObservedNode(node));
  }
  value.Set("nodes", list);
  json::Value reasons = json::Value::Array();
  for (const ObservationTruncation& entry : truncation) {
    json::Value item = json::Value::Object();
    item.Set("reason", json::Value::String(entry.reason));
    if (entry.limit) {
      item.Set("limit", json::Value::Integer(*entry.limit));
    }
    item.Set("unvisited", json::Value::Integer(static_cast<std::int64_t>(entry.unvisited)));
    reasons.Append(item);
  }
  value.Set("truncation", reasons);
  json::Value unsupported = json::Value::Array();
  for (const ObserveFact fact : unsupportedFacts) {
    unsupported.Append(json::Value::String(std::string(ObserveFactName(fact))));
  }
  value.Set("unsupportedFacts", unsupported);
  return value;
}

std::int64_t SteadyMilliseconds() {
  return std::chrono::duration_cast<std::chrono::milliseconds>(std::chrono::steady_clock::now().time_since_epoch())
      .count();
}

ObservedSample SampleObservation(ObservationSource& source, const ObservationRoot& root,
                                 const ObserveRequest& request, const CancellationToken& token,
                                 const ObservationClock& clock, std::optional<std::int64_t> startedAt) {
  const ObserveBudget& budget = request.budget;
  const std::int64_t start = startedAt ? *startedAt : clock();
  const auto expired = [&]() { return clock() - start >= budget.deadlineMs; };

  ObservedSample sample;
  const std::vector<ObserveFact> unsupported = source.UnsupportedFacts();
  std::vector<bool> requested(std::size(kFactNames), false);
  for (const ObserveFact fact : request.facts) {
    if (std::find(unsupported.begin(), unsupported.end(), fact) != unsupported.end()) {
      sample.unsupportedFacts.push_back(fact);
    } else {
      requested[static_cast<std::size_t>(fact)] = true;
    }
  }

  // A reason appears once; a later stop for the same reason adds to it.
  const auto stop = [&](const char* reason, std::optional<std::int64_t> limit, std::size_t unvisited) {
    for (ObservationTruncation& entry : sample.truncation) {
      if (entry.reason == reason) {
        entry.unvisited += unvisited;
        return;
      }
    }
    sample.truncation.push_back(ObservationTruncation{reason, limit, unvisited});
  };
  const auto finish = [&]() {
    sample.elapsedMs = std::max<std::int64_t>(0, clock() - start);
    return std::move(sample);
  };

  // One family per emitted node, at the same index: the node's children, paged
  // when the breadth-first walk reaches them.
  struct Family {
    ObservationHandle handle{0};
    std::size_t childDepth{0};
    ElementScope childScope{ElementScope::Chrome};
    // Children past maxDepth are only probed to learn whether any exist.
    bool depthCut{false};
    std::unique_ptr<ObservationChildCursor> cursor;
    std::size_t fresh{0};
    std::size_t stale{0};
    std::size_t emitted{0};
    bool exhausted{false};
    bool failed{false};
  };
  std::vector<Family> families;
  std::unordered_set<std::wstring> seen;
  std::size_t bytes = 0;
  std::size_t depthUnvisited = 0;
  std::size_t unreadable = 0;
  bool unreadableSeen = false;

  const auto emit = [&](ObservedNode node, ObservationHandle handle, ElementScope childScope, std::size_t size) {
    Family family;
    family.handle = handle;
    family.childDepth = node.depth + 1;
    family.childScope = childScope;
    family.depthCut = family.childDepth > budget.maxDepth;
    sample.nodes.push_back(std::move(node));
    families.push_back(std::move(family));
    bytes += size;
  };

  token.ThrowIfCancelled();
  {
    // The root is always read, whatever the budgets.
    const ObservedFacts facts = source.Read(root.handle);
    const ObservedScopes scopes = source.Scopes(root.scope, facts);
    if (const std::wstring key = source.Key(root.handle); !key.empty()) {
      seen.insert(key);
    }
    ObservedNode node;
    node.depth = 0;
    node.role = facts.role;
    node.scope = scopes.self;
    node.body = ShapeBody(facts, requested, budget.maxStringLength);
    const std::size_t size = EstimateNodeBytes(node);
    const std::optional<std::string> id = source.Identify(root.handle, root.parentId, scopes.self);
    if (!id) {
      stop("references", std::nullopt, 1);
      return finish();
    }
    node.id = *id;
    emit(std::move(node), root.handle, scopes.children, size);
  }

  const auto nextFresh = [&](Family& family) -> std::optional<ObservationHandle> {
    while (true) {
      if (expired()) {
        throw DeadlineReached{};
      }
      token.ThrowIfCancelled();
      const std::optional<ObservationHandle> child = family.cursor->Next();
      if (!child) {
        return std::nullopt;
      }
      const std::wstring key = source.Key(*child);
      if (key.empty()) {
        return child;
      }
      if (!seen.contains(key)) {
        // Children past the depth limit are never emitted, so they claim nothing.
        if (!family.depthCut) {
          seen.insert(key);
        }
        return child;
      }
    }
  };

  std::size_t head = 0;
  while (head < families.size()) {
    token.ThrowIfCancelled();
    if (sample.nodes.size() >= budget.maxVisited) {
      stop("visited", static_cast<std::int64_t>(budget.maxVisited), 0);
      break;
    }
    if (expired()) {
      stop("deadline", budget.deadlineMs, 0);
      break;
    }
    Family& family = families[head];
    if (!family.cursor) {
      family.cursor = source.Children(family.handle);
    }

    std::optional<ObservationHandle> child;
    try {
      child = nextFresh(family);
    } catch (const DeadlineReached&) {
      stop("deadline", budget.deadlineMs, 0);
      break;
    } catch (const HelperError& error) {
      // A parent that vanished has no children left to report; any other
      // failure leaves its list unread.
      if (error.code() == kErrorStaleElement) {
        family.exhausted = true;
      } else {
        family.failed = true;
        unreadableSeen = true;
      }
      head += 1;
      continue;
    }
    if (!child) {
      family.exhausted = true;
      head += 1;
      continue;
    }
    family.fresh += 1;
    if (family.depthCut) {
      depthUnvisited += 1;
      head += 1;
      continue;
    }

    if (expired()) {
      stop("deadline", budget.deadlineMs, 1);
      break;
    }
    ObservedFacts facts;
    try {
      facts = source.Read(*child);
    } catch (const HelperError& error) {
      if (error.code() == kErrorStaleElement) {
        family.stale += 1;
      } else {
        unreadable += 1;
        unreadableSeen = true;
      }
      continue;
    }
    // A read that ended past the deadline is abandoned before it leaves a record.
    if (expired()) {
      stop("deadline", budget.deadlineMs, 1);
      break;
    }

    const ObservedScopes scopes = source.Scopes(family.childScope, facts);
    ObservedNode node;
    node.depth = family.childDepth;
    node.role = facts.role;
    node.scope = scopes.self;
    node.parentId = sample.nodes[head].id;
    node.body = ShapeBody(facts, requested, budget.maxStringLength);
    const std::size_t size = EstimateNodeBytes(node);
    if (bytes + size > budget.maxBytes) {
      stop("bytes", static_cast<std::int64_t>(budget.maxBytes), 1);
      break;
    }
    const std::optional<std::string> id = source.Identify(*child, node.parentId, scopes.self);
    if (!id) {
      stop("references", std::nullopt, 1);
      break;
    }
    node.id = *id;
    family.emitted += 1;
    // `family` is not used past this point: emitting can move the families.
    emit(std::move(node), *child, scopes.children, size);
  }

  if (depthUnvisited > 0) {
    stop("depth", static_cast<std::int64_t>(budget.maxDepth), depthUnvisited);
  }
  if (unreadableSeen) {
    stop("unreadable", std::nullopt, unreadable);
  }

  for (std::size_t index = 0; index < families.size(); index += 1) {
    const Family& family = families[index];
    ObservedNode& node = sample.nodes[index];
    // Unreadable children are counted; stale ones are not.
    const std::size_t known = family.fresh - family.stale;
    if (family.depthCut) {
      node.childrenState = family.fresh > 0    ? ChildrenState::Truncated
                           : family.exhausted ? ChildrenState::None
                                              : ChildrenState::Unknown;
      if (node.childrenState == ChildrenState::None) {
        node.childCount = 0;
      }
    } else if (family.exhausted) {
      node.childCount = known;
      node.childrenState = known == 0                ? ChildrenState::None
                           : family.emitted == known ? ChildrenState::Complete
                                                     : ChildrenState::Truncated;
    } else if (family.emitted > 0 || known > 0) {
      node.childrenState = ChildrenState::Truncated;
    } else {
      node.childrenState = ChildrenState::Unknown;
    }
  }
  return finish();
}

}  // namespace furn
