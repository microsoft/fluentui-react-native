#include "observationtests.h"

#include <windows.h>

#include <algorithm>
#include <cstdint>
#include <filesystem>
#include <fstream>
#include <functional>
#include <iterator>
#include <limits>
#include <map>
#include <memory>
#include <optional>
#include <set>
#include <string>
#include <unordered_map>
#include <utility>
#include <vector>

#include "common.h"
#include "elementregistry.h"
#include "json.h"
#include "observation.h"

namespace furn {
namespace {

constexpr ObserveFact kAllFacts[] = {
    ObserveFact::Actions, ObserveFact::Checked,  ObserveFact::Enabled,  ObserveFact::Expanded,
    ObserveFact::Focused, ObserveFact::Geometry, ObserveFact::Help,     ObserveFact::Required,
    ObserveFact::Selected, ObserveFact::Text,    ObserveFact::Value,    ObserveFact::Visible,
};

constexpr const char* kReasons[] = {"visited", "depth", "bytes", "deadline", "references", "unreadable"};

ObserveBudget Generous() {
  ObserveBudget budget;
  budget.maxVisited = 5000;
  budget.maxDepth = 64;
  budget.maxStringLength = 1024;
  budget.maxBytes = 4194304;
  budget.deadlineMs = 30000;
  return budget;
}

ObserveRequest Request(const ObserveBudget& budget = Generous(), std::vector<ObserveFact> facts = {}) {
  ObserveRequest request;
  request.windowId = "window-1";
  request.budget = budget;
  request.facts = std::move(facts);
  return request;
}

ObserveBudget WithVisited(std::size_t visited) {
  ObserveBudget budget = Generous();
  budget.maxVisited = visited;
  return budget;
}

ObserveBudget WithDepth(std::size_t depth) {
  ObserveBudget budget = Generous();
  budget.maxDepth = depth;
  return budget;
}

ObserveBudget WithBytes(std::size_t bytes) {
  ObserveBudget budget = Generous();
  budget.maxBytes = bytes;
  return budget;
}

ObserveBudget WithDeadline(std::int64_t deadlineMs) {
  ObserveBudget budget = Generous();
  budget.deadlineMs = deadlineMs;
  return budget;
}

ObserveBudget WithStringLength(std::size_t length) {
  ObserveBudget budget = Generous();
  budget.maxStringLength = length;
  return budget;
}

json::Value RequestJson(const ObserveRequest& request) {
  json::Value budget = json::Value::Object();
  budget.Set("deadlineMs", json::Value::Integer(request.budget.deadlineMs));
  budget.Set("maxBytes", json::Value::Integer(static_cast<std::int64_t>(request.budget.maxBytes)));
  budget.Set("maxDepth", json::Value::Integer(static_cast<std::int64_t>(request.budget.maxDepth)));
  budget.Set("maxStringLength", json::Value::Integer(static_cast<std::int64_t>(request.budget.maxStringLength)));
  budget.Set("maxVisited", json::Value::Integer(static_cast<std::int64_t>(request.budget.maxVisited)));
  json::Value facts = json::Value::Array();
  for (const ObserveFact fact : request.facts) {
    facts.Append(json::Value::String(std::string(ObserveFactName(fact))));
  }
  json::Value value = json::Value::Object();
  value.Set("budget", budget);
  value.Set("facts", facts);
  if (request.rootId) {
    value.Set("rootId", json::Value::String(*request.rootId));
  }
  value.Set("windowId", json::Value::String(request.windowId));
  return value;
}

std::string FailureCode(const std::function<void()>& call, std::string* message = nullptr) {
  try {
    call();
  } catch (const HelperError& error) {
    if (message != nullptr) {
      *message = error.what();
    }
    return error.code();
  }
  return "none";
}

const char* FactKey(ObserveFact fact) {
  switch (fact) {
    case ObserveFact::Geometry:
      return "rect";
    case ObserveFact::Help:
      return "helpText";
    default:
      return ObserveFactName(fact);
  }
}

std::size_t Utf16Units(const std::string& value) {
  return ToWide(value).size();
}

bool EndsInHighSurrogate(const std::string& value) {
  const std::wstring wide = ToWide(value);
  return !wide.empty() && IS_HIGH_SURROGATE(wide.back());
}

// A tree the sampler can walk. Handles are integers, `edges` lists children in
// provider order, and the hooks run at the start of every provider call so a
// test can move the clock or cancel in the middle of a walk.
class SyntheticTree final : public ObservationSource {
 public:
  using Edges = std::map<ObservationHandle, std::vector<ObservationHandle>>;

  explicit SyntheticTree(Edges initial = {}) : edges(std::move(initial)) {}

  Edges edges;
  std::vector<ObserveFact> unsupported{ObserveFact::Actions};
  // Elements whose read fails with this code.
  std::map<ObservationHandle, std::string> readFailures;
  // Elements whose children cannot be paged, with this code.
  std::map<ObservationHandle, std::string> listFailures;
  // Native identities that differ from the default one per handle.
  std::map<ObservationHandle, std::wstring> keys;
  std::size_t capacity{std::numeric_limits<std::size_t>::max()};
  std::function<ObservedFacts(ObservationHandle)> describe = [](ObservationHandle handle) {
    ObservedFacts facts;
    facts.role = "group";
    facts.name = "n" + std::to_string(handle);
    return facts;
  };
  std::function<ObservedScopes(ElementScope, const ObservedFacts&)> scopeRule = [](ElementScope inherited,
                                                                                   const ObservedFacts&) {
    return ObservedScopes{inherited, inherited};
  };
  std::function<void(ObservationHandle)> onRead = [](ObservationHandle) {};
  std::function<void(ObservationHandle)> onNext = [](ObservationHandle) {};

  std::vector<ObservationHandle> reads;
  std::size_t pages{0};
  std::map<ObservationHandle, std::pair<std::string, ElementScope>> placements;

  std::vector<ObserveFact> UnsupportedFacts() const override { return unsupported; }

  ObservedFacts Read(ObservationHandle handle) override {
    reads.push_back(handle);
    onRead(handle);
    if (const auto failure = readFailures.find(handle); failure != readFailures.end()) {
      Fail(failure->second, "The synthetic element " + std::to_string(handle) + " cannot be read.");
    }
    return describe(handle);
  }

  std::unique_ptr<ObservationChildCursor> Children(ObservationHandle handle) override {
    return std::make_unique<Cursor>(*this, handle);
  }

  std::wstring Key(ObservationHandle handle) const override {
    const auto key = keys.find(handle);
    return key != keys.end() ? key->second : L"k" + std::to_wstring(handle) + L".";
  }

  ObservedScopes Scopes(ElementScope inherited, const ObservedFacts& facts) const override {
    return scopeRule(inherited, facts);
  }

  std::optional<std::string> Identify(ObservationHandle handle, const std::string& parentId,
                                      ElementScope scope) override {
    if (const auto known = ids_.find(handle); known != ids_.end()) {
      return known->second;
    }
    if (ids_.size() >= capacity) {
      return std::nullopt;
    }
    std::string id = "e" + std::to_string(handle);
    ids_.emplace(handle, id);
    placements[handle] = {parentId, scope};
    return id;
  }

 private:
  class Cursor final : public ObservationChildCursor {
   public:
    Cursor(SyntheticTree& tree, ObservationHandle parent) : tree_(tree), parent_(parent) {}

    std::optional<ObservationHandle> Next() override {
      tree_.pages += 1;
      tree_.onNext(parent_);
      if (const auto failure = tree_.listFailures.find(parent_); failure != tree_.listFailures.end()) {
        Fail(failure->second, "The children of synthetic element " + std::to_string(parent_) + " cannot be read.");
      }
      const auto children = tree_.edges.find(parent_);
      if (children == tree_.edges.end() || index_ >= children->second.size()) {
        return std::nullopt;
      }
      return children->second[index_++];
    }

   private:
    SyntheticTree& tree_;
    ObservationHandle parent_;
    std::size_t index_{0};
  };

  std::map<ObservationHandle, std::string> ids_;
};

// The rules every sample must satisfy whatever produced it. They mirror
// `describeObservationViolation` in src/protocol/observation.ts, which is what
// the host applies to a helper's response, plus the byte budget and
// breadth-first parent order the sampler guarantees.
std::string StructuralProblem(const ObservedSample& sample, const ObserveRequest& request) {
  const ObserveBudget& budget = request.budget;
  if (sample.nodes.size() > budget.maxVisited) {
    return std::to_string(sample.nodes.size()) + " nodes exceed the visited budget";
  }
  std::set<std::string> reasons;
  for (const ObservationTruncation& entry : sample.truncation) {
    if (!reasons.insert(entry.reason).second) {
      return "the reason " + entry.reason + " repeats";
    }
    if (std::find_if(std::begin(kReasons), std::end(kReasons), [&](const char* known) {
          return entry.reason == known;
        }) == std::end(kReasons)) {
      return "the reason " + entry.reason + " is not in the contract";
    }
  }
  if (sample.nodes.empty() && !reasons.contains("references")) {
    return "an empty sample does not report references";
  }
  for (const ObserveFact fact : sample.unsupportedFacts) {
    if (std::find(request.facts.begin(), request.facts.end(), fact) == request.facts.end()) {
      return std::string("unsupportedFacts lists ") + ObserveFactName(fact) + ", which was not requested";
    }
  }

  const json::Value serialized = sample.ToJson();
  const std::vector<json::Value>& nodeValues = serialized.Find("nodes")->Items();
  std::unordered_map<std::string, std::size_t> positions;
  std::unordered_map<std::string, std::size_t> emitted;
  std::size_t previousDepth = 0;
  std::size_t previousParent = 0;
  std::size_t bytes = 0;
  for (std::size_t position = 0; position < sample.nodes.size(); position += 1) {
    const ObservedNode& node = sample.nodes[position];
    const std::string label = "node " + node.id;
    if (node.id.empty() || positions.contains(node.id)) {
      return label + " has no id or repeats";
    }
    if (node.role.empty()) {
      return label + " has no role";
    }
    if (position == 0) {
      if (node.depth != 0 || !node.parentId.empty()) {
        return "the first node is not a root";
      }
    } else {
      const auto parent = positions.find(node.parentId);
      if (parent == positions.end()) {
        return label + " has no earlier parent";
      }
      if (node.depth != sample.nodes[parent->second].depth + 1) {
        return label + " is not one level below its parent";
      }
      if (node.depth < previousDepth || parent->second < previousParent) {
        return label + " breaks breadth-first order";
      }
      previousParent = parent->second;
      emitted[node.parentId] += 1;
      bytes += nodeValues[position].Serialize().size() + 1;
    }
    if (node.depth > budget.maxDepth) {
      return label + " is deeper than the budget";
    }
    previousDepth = node.depth;
    positions.emplace(node.id, position);

    for (const ObserveFact fact : kAllFacts) {
      const bool asked = std::find(request.facts.begin(), request.facts.end(), fact) != request.facts.end();
      const bool refused =
          std::find(sample.unsupportedFacts.begin(), sample.unsupportedFacts.end(), fact) !=
          sample.unsupportedFacts.end();
      if ((!asked || refused) && node.body.Has(FactKey(fact))) {
        return label + " carries the unrequested " + FactKey(fact);
      }
    }
    std::vector<std::pair<std::string, std::string>> strings;
    for (const char* key : {"name", "automationId", "text", "value"}) {
      if (const json::Value* field = node.body.Find(key); field != nullptr) {
        strings.emplace_back(key, field->AsString());
      }
    }
    if (const json::Value* help = node.body.Find("helpText"); help != nullptr && help->BoolField("supported")) {
      strings.emplace_back("helpText", help->StringField("value"));
    }
    if (const json::Value* actions = node.body.Find("actions"); actions != nullptr) {
      for (const json::Value& action : actions->Items()) {
        strings.emplace_back("actions", action.AsString());
      }
    }
    for (const auto& [key, text] : strings) {
      if (Utf16Units(text) > budget.maxStringLength) {
        return label + " has a " + key + " longer than the budget";
      }
    }
    if (const json::Value* clipped = node.body.Find("clipped"); clipped != nullptr) {
      for (const json::Value& field : clipped->Items()) {
        const auto match = std::find_if(strings.begin(), strings.end(),
                                        [&](const auto& entry) { return entry.first == field.AsString(); });
        if (match == strings.end()) {
          return label + " lists " + field.AsString() + " as clipped without carrying it";
        }
        if (EndsInHighSurrogate(match->second)) {
          return label + " cuts " + field.AsString() + " between the halves of a surrogate pair";
        }
      }
    }
  }
  if (bytes > budget.maxBytes) {
    return "the nodes after the root take " + std::to_string(bytes) + " bytes, more than the budget";
  }

  for (const ObservedNode& node : sample.nodes) {
    const std::size_t count = emitted[node.id];
    const std::string label = "node " + node.id;
    switch (node.childrenState) {
      case ChildrenState::None:
        if (count != 0 || node.childCount.value_or(0) != 0) {
          return label + " reports no children but has some";
        }
        break;
      case ChildrenState::Complete:
        if (count == 0 || (node.childCount && *node.childCount != count)) {
          return label + " reports complete children that do not match what was emitted";
        }
        break;
      case ChildrenState::Truncated:
        if (node.childCount && *node.childCount <= count) {
          return label + " reports truncated children that were all emitted";
        }
        break;
      case ChildrenState::Unknown:
        if (count != 0 || node.childCount) {
          return label + " reports unread children but has emitted children or a count";
        }
        break;
    }
    if (sample.complete() &&
        (node.childrenState == ChildrenState::Truncated || node.childrenState == ChildrenState::Unknown)) {
      return label + " has partial children in a sample reported complete";
    }
  }
  return {};
}

std::vector<std::string> Ids(const ObservedSample& sample) {
  std::vector<std::string> ids;
  for (const ObservedNode& node : sample.nodes) {
    ids.push_back(node.id);
  }
  return ids;
}

const ObservedNode* NodeById(const ObservedSample& sample, const std::string& id) {
  for (const ObservedNode& node : sample.nodes) {
    if (node.id == id) {
      return &node;
    }
  }
  return nullptr;
}

bool OnlyReason(const ObservedSample& sample, const std::string& reason, std::optional<std::int64_t> limit,
                std::optional<std::size_t> unvisited = std::nullopt) {
  return sample.truncation.size() == 1 && sample.truncation.front().reason == reason &&
         sample.truncation.front().limit == limit && (!unvisited || sample.truncation.front().unvisited == *unvisited);
}

std::string NodesJson(const ObservedSample& sample) {
  return sample.ToJson().Find("nodes")->Serialize();
}

std::vector<std::string> MemberKeys(const json::Value& value) {
  std::vector<std::string> keys;
  for (const auto& [key, member] : value.Members()) {
    keys.push_back(key);
  }
  return keys;
}

struct SplitMix64 {
  std::uint64_t state;

  std::uint64_t Next() {
    state += 0x9E3779B97F4A7C15ull;
    std::uint64_t value = state;
    value = (value ^ (value >> 30)) * 0xBF58476D1CE4E5B9ull;
    value = (value ^ (value >> 27)) * 0x94D049BB133111EBull;
    return value ^ (value >> 31);
  }

  std::size_t Below(std::size_t bound) { return static_cast<std::size_t>(Next() % std::max<std::size_t>(1, bound)); }
};

class ObservationTests {
 public:
  explicit ObservationTests(const CheckFunction& check) : check_(check), dump_(json::Value::Array()) {}

  void Run() {
    TestRequests();
    TestClipping();
    TestWalk();
    TestBudgets();
    TestFailures();
    TestCancellation();
    TestFacts();
    TestRandomTrees();
    TestPinnedRecords();
    WriteDump();
  }

 private:
  void Check(bool condition, const std::string& name) { check_(condition, name); }

  // Walks a synthetic tree, checks the sample's structure, and records it for
  // the Node validator.
  std::optional<ObservedSample> Walk(const std::string& name, SyntheticTree& tree, const ObserveRequest& request,
                                     const ObservationClock& clock = SteadyMilliseconds,
                                     const ObservationRoot& root = ObservationRoot{0, {}, ElementScope::Application}) {
    const CancellationToken token;
    try {
      ObservedSample sample = SampleObservation(tree, root, request, token, clock);
      const std::string problem = StructuralProblem(sample, request);
      Check(problem.empty(), name + ": the sample satisfies the contract" + (problem.empty() ? "" : " (" + problem + ")"));
      Record(name, request, sample);
      return sample;
    } catch (const HelperError& error) {
      Check(false, name + ": the walk failed with " + error.code() + ": " + error.what());
    }
    return std::nullopt;
  }

  void Record(const std::string& name, const ObserveRequest& request, const ObservedSample& sample) {
    json::Value entry = json::Value::Object();
    entry.Set("name", json::Value::String(name));
    entry.Set("request", RequestJson(request));
    entry.Set("result", sample.ToJson());
    dump_.Append(std::move(entry));
  }

  void WriteDump() {
    wchar_t buffer[MAX_PATH * 4]{};
    const DWORD length = GetEnvironmentVariableW(L"FURN_DRIVER_SELF_TEST_OBSERVATIONS", buffer,
                                                 static_cast<DWORD>(std::size(buffer)));
    if (length == 0 || length >= std::size(buffer)) {
      return;
    }
    std::ofstream file(std::filesystem::path(std::wstring(buffer, length)), std::ios::binary | std::ios::trunc);
    file << dump_.Serialize();
    file.close();
    Check(file.good() && dump_.Items().size() > 100, "the observation samples were written for the Node validator");
  }

  void TestRequests() {
    const auto budget = [](std::map<std::string, std::string> overrides = {}) {
      std::map<std::string, std::string> fields{{"deadlineMs", "1000"},
                                                {"maxBytes", "65536"},
                                                {"maxDepth", "8"},
                                                {"maxStringLength", "64"},
                                                {"maxVisited", "100"}};
      for (auto& [key, value] : overrides) {
        fields[key] = value;
      }
      std::string text = "{";
      for (const auto& [key, value] : fields) {
        if (value.empty()) {
          continue;
        }
        text += (text.size() > 1 ? "," : "") + std::string("\"") + key + "\":" + value;
      }
      return text + "}";
    };
    const auto request = [&](const std::string& budgetText, const std::string& rest) {
      return "{\"budget\":" + budgetText + "," + rest + "}";
    };
    const std::string plain = "\"facts\":[],\"windowId\":\"window-1\"";
    const auto parse = [](const std::string& text) { return ParseObserveRequest(json::Value::Parse(text)); };
    const auto code = [&](const std::string& text, std::string* message = nullptr) {
      return FailureCode([&]() { parse(text); }, message);
    };

    const ObserveRequest parsed =
        parse(request(budget(), "\"facts\":[\"value\",\"checked\"],\"rootId\":\"element-1\",\"windowId\":\"window-1\""));
    Check(parsed.windowId == "window-1" && parsed.rootId == std::optional<std::string>("element-1") &&
              parsed.budget.maxVisited == 100 && parsed.budget.maxDepth == 8 && parsed.budget.maxStringLength == 64 &&
              parsed.budget.maxBytes == 65536 && parsed.budget.deadlineMs == 1000 &&
              parsed.facts == std::vector<ObserveFact>{ObserveFact::Value, ObserveFact::Checked},
          "an observe request parses its window, root, budget, and facts in request order");
    Check(code(request(budget({{"deadlineMs", "50"}, {"maxBytes", "4096"}, {"maxDepth", "0"},
                               {"maxStringLength", "16"}, {"maxVisited", "1"}}),
                       plain)) == "none" &&
              code(request(budget({{"deadlineMs", "30000"}, {"maxBytes", "4194304"}, {"maxDepth", "64"},
                                   {"maxStringLength", "1024"}, {"maxVisited", "5000"}}),
                           plain)) == "none",
          "every budget accepts both ends of its range");

    const std::pair<const char*, std::map<std::string, std::string>> outOfRange[] = {
        {"maxVisited 0", {{"maxVisited", "0"}}},
        {"maxVisited 5001", {{"maxVisited", "5001"}}},
        {"maxDepth -1", {{"maxDepth", "-1"}}},
        {"maxDepth 65", {{"maxDepth", "65"}}},
        {"maxStringLength 15", {{"maxStringLength", "15"}}},
        {"maxStringLength 1025", {{"maxStringLength", "1025"}}},
        {"maxBytes 4095", {{"maxBytes", "4095"}}},
        {"maxBytes 4194305", {{"maxBytes", "4194305"}}},
        {"deadlineMs 49", {{"deadlineMs", "49"}}},
        {"deadlineMs 30001", {{"deadlineMs", "30001"}}},
        {"a fractional maxVisited", {{"maxVisited", "1.5"}}},
        {"a string maxVisited", {{"maxVisited", "\"10\""}}},
        {"a missing maxBytes", {{"maxBytes", ""}}},
        {"an unknown budget field", {{"maxNodes", "1"}}},
    };
    for (const auto& [name, overrides] : outOfRange) {
      Check(code(request(budget(overrides), plain)) == kErrorInvalidParams,
            std::string("an observe budget with ") + name + " is rejected, never clamped");
    }

    const std::string longId(257, 'a');
    const std::pair<const char*, std::string> invalid[] = {
        {"a missing window", request(budget(), "\"facts\":[]")},
        {"an unknown fact", request(budget(), "\"facts\":[\"bogus\"],\"windowId\":\"window-1\"")},
        {"a repeated fact", request(budget(), "\"facts\":[\"value\",\"value\"],\"windowId\":\"window-1\"")},
        {"missing facts", request(budget(), "\"windowId\":\"window-1\"")},
        {"facts that are not a list", request(budget(), "\"facts\":\"value\",\"windowId\":\"window-1\"")},
        {"an empty root", request(budget(), plain + ",\"rootId\":\"\"")},
        {"a root longer than 256 bytes", request(budget(), plain + ",\"rootId\":\"" + longId + "\"")},
        {"a root that is not a string", request(budget(), plain + ",\"rootId\":5")},
        {"a missing budget", "{" + plain + "}"},
        {"a list instead of an object", "[]"},
    };
    for (const auto& [name, text] : invalid) {
      Check(code(text) == kErrorInvalidParams, std::string("an observe request with ") + name + " is rejected");
    }
    std::string message;
    Check(code(request(budget(), plain + ",\"zeta\":1,\"alpha\":2"), &message) == kErrorInvalidParams &&
              message.find("\"alpha\"") != std::string::npos,
          "an observe request with unknown fields names the first in sorted order");

    const auto release = [](const std::string& text) {
      return ParseReleaseElementsRequest(json::Value::Parse(text));
    };
    const auto releaseCode = [&](const std::string& text) { return FailureCode([&]() { release(text); }); };
    Check(release("{\"ids\":[\"element-1\",\"element-2\"]}") == std::vector<std::string>{"element-1", "element-2"} &&
              release("{\"ids\":[]}").empty(),
          "a release request parses its ids");
    std::string thousand = "{\"ids\":[";
    for (int index = 0; index < 1000; index += 1) {
      thousand += (index > 0 ? ",\"e" : "\"e") + std::to_string(index) + "\"";
    }
    const std::string thousandAndOne = thousand + ",\"e1000\"]}";
    thousand += "]}";
    Check(releaseCode(thousand) == "none" && releaseCode(thousandAndOne) == kErrorInvalidParams,
          "a release request takes 1,000 ids and refuses 1,001");
    Check(releaseCode("{\"ids\":[\"" + std::string(256, 'a') + "\"]}") == "none" &&
              releaseCode("{\"ids\":[\"" + longId + "\"]}") == kErrorInvalidParams,
          "a released id may be 256 bytes but not 257");
    const char* const invalidReleases[] = {
        "{\"ids\":[\"a\",\"a\"]}", "{\"ids\":[\"\"]}", "{\"ids\":[1]}", "{}", "{\"ids\":[],\"extra\":1}",
        "{\"ids\":\"a\"}",
    };
    bool refused = true;
    for (const char* text : invalidReleases) {
      refused = refused && releaseCode(text) == kErrorInvalidParams;
    }
    Check(refused, "a release request with repeated, empty, non-string, missing, or unknown fields is rejected");
  }

  void TestClipping() {
    const auto clip = [](std::string value, std::size_t limit) {
      const bool cut = ClipToUtf16Units(value, limit);
      return std::make_pair(value, cut);
    };
    Check(clip("abcdef", 4) == std::make_pair(std::string("abcd"), true) &&
              clip("ab", 4) == std::make_pair(std::string("ab"), false),
          "a string is cut to the limit only when it is longer");
    const std::string grin = "\xF0\x9F\x98\x80";
    Check(clip("a" + grin + "b", 2) == std::make_pair(std::string("a"), true) &&
              clip("a" + grin + "b", 3) == std::make_pair("a" + grin, true),
          "a cut never separates the halves of a surrogate pair");
    const std::string nihongo = "\xE6\x97\xA5\xE6\x9C\xAC\xE8\xAA\x9E";
    Check(clip(nihongo, 3) == std::make_pair(nihongo, false) &&
              clip(nihongo, 2) == std::make_pair(std::string("\xE6\x97\xA5\xE6\x9C\xAC"), true),
          "the limit counts UTF-16 units, not UTF-8 bytes");
  }

  void TestWalk() {
    SyntheticTree tree({{0, {1, 2}}, {1, {3}}, {2, {4, 5}}});
    const auto first = Walk("a tight tree", tree, Request());
    if (first) {
      Check(first->complete() && Ids(*first) == std::vector<std::string>{"e0", "e1", "e2", "e3", "e4", "e5"},
            "a tree within every budget is sampled completely, breadth first");
      const ObservedNode* root = NodeById(*first, "e0");
      const ObservedNode* leaf = NodeById(*first, "e3");
      const ObservedNode* branch = NodeById(*first, "e2");
      Check(root != nullptr && root->childrenState == ChildrenState::Complete && root->childCount == 2u &&
                leaf != nullptr && leaf->childrenState == ChildrenState::None && leaf->childCount == 0u &&
                leaf->parentId == "e1" && leaf->depth == 2 && branch != nullptr &&
                branch->childrenState == ChildrenState::Complete && branch->childCount == 2u,
            "a complete sample reports every parent, depth, and child count");
      Check(tree.placements[3].first == "e1" && tree.placements[0].first.empty(),
            "every record is identified under the parent it is emitted under");
    }
    const auto second = Walk("the same tight tree again", tree, Request());
    Check(first && second && NodesJson(*first) == NodesJson(*second),
          "two samples of an unchanged tree report identical ids and order");

    SyntheticTree shared({{0, {1, 2}}, {1, {3}}, {2, {3}}});
    if (const auto sample = Walk("an element reachable from two parents", shared, Request())) {
      const ObservedNode* other = NodeById(*sample, "e2");
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e2", "e3"} && NodeById(*sample, "e3")->parentId == "e1" &&
                other != nullptr && other->childrenState == ChildrenState::None,
            "a duplicate reachable element is emitted once, under its first parent");
    }
    SyntheticTree aliased({{0, {1, 2}}, {1, {3}}, {2, {4}}});
    aliased.keys[4] = L"k3.";
    if (const auto sample = Walk("two handles with one native identity", aliased, Request())) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e2", "e3"},
            "two handles with one native identity are emitted once");
    }
    SyntheticTree cycle({{0, {1}}, {1, {0}}});
    if (const auto sample = Walk("a cycle back to the root", cycle, Request())) {
      Check(sample->complete() && Ids(*sample) == std::vector<std::string>{"e0", "e1"},
            "a cycle back to the root ends instead of looping");
    }
    SyntheticTree anonymous({{0, {1, 2}}});
    anonymous.keys[1] = L"";
    anonymous.keys[2] = L"";
    if (const auto sample = Walk("elements without a native identity", anonymous, Request())) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e2"},
            "elements without a native identity are never taken for duplicates");
    }

    SyntheticTree rooted({{0, {1}}});
    if (const auto sample =
            Walk("a root with a parent of its own", rooted, Request(), SteadyMilliseconds,
                 ObservationRoot{0, "element-parent", ElementScope::Chrome})) {
      Check(sample->nodes.front().parentId.empty() && rooted.placements[0].first == "element-parent" &&
                sample->nodes.front().scope == ElementScope::Chrome,
            "the root is emitted without a parent but keeps the parent its record has");
    }

    SyntheticTree scoped({{0, {1, 2}}, {2, {3}}});
    scoped.describe = [](ObservationHandle handle) {
      ObservedFacts facts;
      facts.role = "group";
      facts.automationId = handle == 2 ? "story-root" : "";
      return facts;
    };
    scoped.scopeRule = [](ElementScope inherited, const ObservedFacts& facts) {
      if (inherited != ElementScope::Preview && facts.automationId == "story-root") {
        return ObservedScopes{ElementScope::Preview, ElementScope::Preview};
      }
      if (inherited == ElementScope::Application) {
        return ObservedScopes{ElementScope::Application, ElementScope::Chrome};
      }
      return ObservedScopes{inherited, inherited};
    };
    if (const auto sample = Walk("a window with a story root", scoped, Request())) {
      Check(NodeById(*sample, "e0")->scope == ElementScope::Application &&
                NodeById(*sample, "e1")->scope == ElementScope::Chrome &&
                NodeById(*sample, "e2")->scope == ElementScope::Preview &&
                NodeById(*sample, "e3")->scope == ElementScope::Preview && scoped.placements[3].second == ElementScope::Preview,
            "scopes follow the window, its chrome, and the story root as a tree walk assigns them");
    }
  }

  void TestBudgets() {
    // 1 + 100 + 9,900 elements: larger than every budget.
    SyntheticTree::Edges edges;
    ObservationHandle next = 1;
    for (int branch = 0; branch < 100; branch += 1) {
      const ObservationHandle parent = next++;
      edges[0].push_back(parent);
      for (int leaf = 0; leaf < 99; leaf += 1) {
        edges[parent].push_back(next++);
      }
    }
    SyntheticTree large(edges);
    if (const auto sample = Walk("10,001 elements under a visited budget of 50", large, Request(WithVisited(50)))) {
      Check(sample->nodes.size() == 50 && OnlyReason(*sample, "visited", 50) && large.reads.size() == 50 &&
                large.pages <= 52,
            "a tree larger than the budget yields a partial sample and reads only what it emits");
    }
    SyntheticTree largest(edges);
    if (const auto sample = Walk("10,001 elements under the largest visited budget", largest, Request(WithVisited(5000)))) {
      Check(sample->nodes.size() == 5000 && OnlyReason(*sample, "visited", 5000),
            "the largest visited budget stops a 10,001-element tree at 5,000 nodes");
    }
    SyntheticTree single({{0, {1}}});
    if (const auto sample = Walk("a visited budget of one", single, Request(WithVisited(1)))) {
      Check(Ids(*sample) == std::vector<std::string>{"e0"} && OnlyReason(*sample, "visited", 1) &&
                sample->nodes.front().childrenState == ChildrenState::Unknown,
            "a visited budget of one emits only the root, its children unread");
    }

    SyntheticTree deep({{0, {1, 2}}, {1, {3}}});
    if (const auto sample = Walk("a depth budget of one", deep, Request(WithDepth(1)))) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e2"} && OnlyReason(*sample, "depth", 1, 1) &&
                NodeById(*sample, "e1")->childrenState == ChildrenState::Truncated &&
                !NodeById(*sample, "e1")->childCount && NodeById(*sample, "e2")->childrenState == ChildrenState::None,
            "a depth budget stops below its level and tells a cut branch from a leaf");
    }
    SyntheticTree shallow({{0, {1}}});
    if (const auto sample = Walk("a depth budget of zero", shallow, Request(WithDepth(0)))) {
      Check(Ids(*sample) == std::vector<std::string>{"e0"} && OnlyReason(*sample, "depth", 0, 1) &&
                sample->nodes.front().childrenState == ChildrenState::Truncated,
            "a depth budget of zero emits the root and reports its children as cut");
    }
    SyntheticTree lone;
    if (const auto sample = Walk("a lone root under a depth budget of zero", lone, Request(WithDepth(0)))) {
      Check(sample->complete() && sample->nodes.front().childrenState == ChildrenState::None,
            "a depth budget that cuts nothing leaves the sample complete");
    }

    SyntheticTree wide;
    for (ObservationHandle child = 1; child <= 200; child += 1) {
      wide.edges[0].push_back(child);
    }
    wide.describe = [](ObservationHandle handle) {
      ObservedFacts facts;
      facts.role = "text";
      facts.name = std::string(1000, static_cast<char>('a' + handle % 26));
      return facts;
    };
    if (const auto sample = Walk("200 large elements under a byte budget", wide, Request(WithBytes(4096)))) {
      Check(sample->nodes.size() > 1 && sample->nodes.size() < 10 && OnlyReason(*sample, "bytes", 4096, 1),
            "a byte budget stops the walk before the node that would exceed it");
    }
    SyntheticTree heavy({{0, {1, 2}}});
    heavy.describe = [](ObservationHandle) {
      ObservedFacts facts;
      facts.role = "textbox";
      facts.name = std::string(1000, 'h');
      facts.automationId = std::string(1000, 'i');
      facts.helpText = SupportedString{true, std::string(1000, 'j'), {}};
      facts.text = std::string(1000, 'k');
      facts.value = std::string(1000, 'l');
      return facts;
    };
    if (const auto sample =
            Walk("a root larger than the byte budget", heavy,
                 Request(WithBytes(4096), {ObserveFact::Help, ObserveFact::Text, ObserveFact::Value}))) {
      Check(Ids(*sample) == std::vector<std::string>{"e0"} && OnlyReason(*sample, "bytes", 4096, 1),
            "the root is emitted even when it alone exceeds the byte budget");
    }

    std::int64_t now = 0;
    std::size_t lateCalls = 0;
    const ObservationClock clock = [&]() { return now; };
    SyntheticTree slow({{0, {1, 2, 3, 4, 5}}});
    slow.onNext = [&](ObservationHandle) {
      lateCalls += now >= 50 ? 1 : 0;
      now += 20;
    };
    slow.onRead = [&](ObservationHandle handle) { lateCalls += handle != 0 && now >= 50 ? 1 : 0; };
    if (const auto sample = Walk("slow paging under a deadline", slow, Request(WithDeadline(50)), clock)) {
      Check(sample->nodes.size() < 6 && OnlyReason(*sample, "deadline", 50) && lateCalls == 0,
            "a deadline stops the walk and no provider call starts after it");
    }
    now = 0;
    lateCalls = 0;
    SyntheticTree stalled({{0, {1, 2, 3}}});
    stalled.onRead = [&](ObservationHandle handle) {
      lateCalls += handle != 0 && now >= 50 ? 1 : 0;
      now += handle == 2 ? 1000 : 0;
    };
    if (const auto sample = Walk("a provider that stalls inside a read", stalled, Request(WithDeadline(50)), clock)) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1"} && !stalled.placements.contains(2) &&
                OnlyReason(*sample, "deadline", 50, 1) && lateCalls == 0 && sample->elapsedMs == 1000,
            "a read that outlasts the deadline ends the walk with that one call and leaves no record");
    }
    now = 0;
    SyntheticTree sluggish({{0, {1, 2, 3}}});
    sluggish.onRead = [&](ObservationHandle handle) { now += handle == 0 ? 1000 : 0; };
    if (const auto sample = Walk("a root that outlasts the deadline", sluggish, Request(WithDeadline(50)), clock)) {
      Check(Ids(*sample) == std::vector<std::string>{"e0"} && OnlyReason(*sample, "deadline", 50) &&
                sluggish.pages == 0 && sample->nodes.front().childrenState == ChildrenState::Unknown,
            "the root is always read, whatever the deadline, and nothing is paged after it");
    }

    SyntheticTree crowded({{0, {1, 2, 3, 4}}});
    crowded.capacity = 3;
    if (const auto sample = Walk("an element table with room for three", crowded, Request())) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e2"} &&
                OnlyReason(*sample, "references", std::nullopt, 1) &&
                sample->nodes.front().childrenState == ChildrenState::Truncated,
            "a full element table stops emission with the references reason");
    }
    SyntheticTree full({{0, {1}}});
    full.capacity = 0;
    if (const auto sample = Walk("an element table with no room", full, Request())) {
      Check(sample->nodes.empty() && OnlyReason(*sample, "references", std::nullopt, 1) &&
                !sample->ToJson().BoolField("complete", true),
            "a table without room for the root yields an empty sample that reports references");
    }
  }

  void TestFailures() {
    SyntheticTree vanishing({{0, {1, 2, 3}}});
    vanishing.readFailures[2] = kErrorStaleElement;
    if (const auto sample = Walk("a child that vanishes during the walk", vanishing, Request())) {
      Check(sample->complete() && Ids(*sample) == std::vector<std::string>{"e0", "e1", "e3"} &&
                sample->nodes.front().childrenState == ChildrenState::Complete && sample->nodes.front().childCount == 2u,
            "a child that vanishes is skipped and dropped from its parent's count");
    }
    SyntheticTree emptied({{0, {1}}});
    emptied.readFailures[1] = kErrorStaleElement;
    if (const auto sample = Walk("an only child that vanishes", emptied, Request())) {
      Check(sample->complete() && sample->nodes.front().childrenState == ChildrenState::None &&
                sample->nodes.front().childCount == 0u,
            "a parent whose children all vanished reports none");
    }
    SyntheticTree unreadable({{0, {1, 2, 3}}});
    unreadable.readFailures[2] = kErrorAutomationFailed;
    if (const auto sample = Walk("a child that cannot be read", unreadable, Request())) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e3"} &&
                sample->nodes.front().childrenState == ChildrenState::Truncated &&
                sample->nodes.front().childCount == 3u && OnlyReason(*sample, "unreadable", std::nullopt, 1),
            "a child that cannot be read is skipped, counted, and reported as unreadable");
    }
    SyntheticTree closed({{0, {1, 2}}, {1, {3}}});
    closed.listFailures[1] = kErrorAutomationFailed;
    if (const auto sample = Walk("a child list that cannot be read", closed, Request())) {
      Check(Ids(*sample) == std::vector<std::string>{"e0", "e1", "e2"} &&
                NodeById(*sample, "e1")->childrenState == ChildrenState::Unknown &&
                OnlyReason(*sample, "unreadable", std::nullopt, 0),
            "a child list that cannot be read is left unknown with the unreadable reason");
    }
    SyntheticTree gone({{0, {1, 2}}, {1, {3}}});
    gone.listFailures[1] = kErrorStaleElement;
    if (const auto sample = Walk("a parent that vanishes before its children are read", gone, Request())) {
      Check(sample->complete() && NodeById(*sample, "e1")->childrenState == ChildrenState::None,
            "a parent that vanished has no children left to report");
    }
    SyntheticTree staleRoot({{0, {1}}});
    staleRoot.readFailures[0] = kErrorStaleElement;
    const CancellationToken token;
    Check(FailureCode([&]() {
            SampleObservation(staleRoot, ObservationRoot{}, Request(), token);
          }) == kErrorStaleElement,
          "a root that cannot be read fails the command as stale-element");
  }

  void TestCancellation() {
    CancellationToken token;
    SyntheticTree tree({{0, {1, 2, 3, 4}}});
    tree.onRead = [&](ObservationHandle handle) {
      if (handle == 2) {
        token.Cancel();
      }
    };
    bool cancelled = false;
    try {
      SampleObservation(tree, ObservationRoot{}, Request(), token);
    } catch (const CancelledError&) {
      cancelled = true;
    }
    Check(cancelled && tree.placements.size() == 3,
          "cancellation unwinds the walk and leaves the records it already created");
  }

  void TestFacts() {
    SyntheticTree secrets({{0, {1, 2}}});
    secrets.describe = [](ObservationHandle handle) {
      ObservedFacts facts;
      facts.role = "textbox";
      facts.secure = handle == 1;
      facts.text = handle == 1 ? "hunter2" : "shown";
      facts.value = handle == 1 ? "hunter2" : "visible";
      return facts;
    };
    if (const auto sample = Walk("a password beside a text box", secrets, Request(Generous(), {ObserveFact::Text, ObserveFact::Value}))) {
      const ObservedNode* secure = NodeById(*sample, "e1");
      const ObservedNode* open = NodeById(*sample, "e2");
      Check(secure != nullptr && !secure->body.Has("value") && !secure->body.Has("text") && open != nullptr &&
                open->body.StringField("value") == "visible" && open->body.StringField("text") == "shown",
            "a secure field never reports its value or text");
    }

    SyntheticTree verbose({{0, {1, 2}}});
    const std::string grin = "\xF0\x9F\x98\x80";
    verbose.describe = [&](ObservationHandle handle) {
      ObservedFacts facts;
      facts.role = "text";
      facts.name = handle == 2 ? std::string(15, 'a') + grin : std::string(40, 'n');
      facts.helpText = SupportedString{true, std::string(40, 'h'), {}};
      facts.value = std::string(40, 'v');
      return facts;
    };
    if (const auto sample = Walk("strings longer than the budget", verbose,
                                 Request(WithStringLength(16), {ObserveFact::Help, ObserveFact::Value}))) {
      const ObservedNode* long1 = NodeById(*sample, "e1");
      const ObservedNode* pair = NodeById(*sample, "e2");
      const json::Value* clipped = long1 == nullptr ? nullptr : long1->body.Find("clipped");
      std::vector<std::string> fields;
      for (const json::Value& field : clipped == nullptr ? std::vector<json::Value>{} : clipped->Items()) {
        fields.push_back(field.AsString());
      }
      Check(long1 != nullptr && long1->body.StringField("name") == std::string(16, 'n') &&
                fields == std::vector<std::string>{"name", "helpText", "value"},
            "every string is cut to the budget and listed as clipped");
      Check(pair != nullptr && pair->body.StringField("name") == std::string(15, 'a'),
            "a cut at a surrogate pair drops the whole pair");
    }

    SyntheticTree refused({{0, {1}}});
    if (const auto sample = Walk("a fact the provider cannot report", refused,
                                 Request(Generous(), {ObserveFact::Actions, ObserveFact::Value}))) {
      Check(sample->unsupportedFacts == std::vector<ObserveFact>{ObserveFact::Actions} &&
                !sample->nodes.back().body.Has("actions"),
            "a fact the provider cannot report is listed as unsupported and never emitted");
    }
    SyntheticTree actionable({{0, {1}}});
    actionable.unsupported.clear();
    actionable.describe = [](ObservationHandle handle) {
      ObservedFacts facts;
      facts.role = "button";
      if (handle == 1) {
        facts.actions = std::vector<std::string>{"press", std::string(40, 'x')};
      }
      return facts;
    };
    if (const auto sample =
            Walk("an action list", actionable, Request(WithStringLength(16), {ObserveFact::Actions}))) {
      const json::Value* rootActions = sample->nodes.front().body.Find("actions");
      const json::Value* childActions = sample->nodes.back().body.Find("actions");
      Check(rootActions != nullptr && rootActions->Items().empty() && childActions != nullptr &&
                childActions->Items().size() == 2 && childActions->Items()[1].AsString() == std::string(16, 'x'),
            "an element without actions reports an empty list and long actions are cut");
    }

    SyntheticTree everything({{0, {1}}});
    everything.unsupported.clear();
    everything.describe = [](ObservationHandle) {
      ObservedFacts facts;
      facts.role = "checkbox";
      facts.name = "Accept";
      facts.automationId = "accept";
      facts.actions = std::vector<std::string>{"press"};
      facts.enabled = SupportedBool{false, false, "The provider has no enabled state."};
      facts.helpText = SupportedString{true, "help", {}};
      facts.text = "text";
      facts.value = "value";
      return facts;
    };
    std::vector<ObserveFact> reversed(std::rbegin(kAllFacts), std::rend(kAllFacts));
    if (const auto sample = Walk("every fact in reverse order", everything, Request(Generous(), reversed))) {
      const json::Value child = sample->ToJson().Find("nodes")->Items().back();
      Check(MemberKeys(child) == std::vector<std::string>{"childrenState", "depth", "id", "role", "scope", "parentId",
                                                          "childCount", "name", "automationId", "actions", "checked",
                                                          "enabled", "expanded", "focused", "rect", "helpText",
                                                          "required", "selected", "text", "value", "visible"},
            "a node reports its facts in the contract's order whatever order they were requested in");
      const json::Value* enabled = child.Find("enabled");
      Check(enabled != nullptr && !enabled->BoolField("supported", true) &&
                enabled->StringField("reason") == "The provider has no enabled state.",
            "an unavailable state is reported unsupported with its reason, never as false");
    }
    if (const auto sample = Walk("no facts requested", everything, Request())) {
      const json::Value child = sample->ToJson().Find("nodes")->Items().back();
      Check(MemberKeys(child) == std::vector<std::string>{"childrenState", "depth", "id", "role", "scope", "parentId",
                                                          "childCount", "name", "automationId"},
            "a node without requested facts carries only its identity, name, and automation id");
    }
  }

  void TestRandomTrees() {
    SplitMix64 random{0x5EEDF00Dull};
    const std::string grin = "\xF0\x9F\x98\x80";
    std::size_t valid = 0;
    std::size_t repeatable = 0;
    std::size_t placed = 0;
    std::size_t partial = 0;
    std::size_t failed = 0;
    constexpr std::size_t kTrees = 300;
    for (std::size_t index = 0; index < kTrees; index += 1) {
      const std::size_t count = 1 + random.Below(80);
      SyntheticTree tree;
      for (ObservationHandle child = 1; child < count; child += 1) {
        tree.edges[random.Below(child)].push_back(child);
      }
      for (std::size_t extra = random.Below(4); extra > 0; extra -= 1) {
        tree.edges[random.Below(count)].push_back(random.Below(count));
      }
      for (std::size_t failure = random.Below(4); failure > 0 && count > 1; failure -= 1) {
        const ObservationHandle handle = 1 + random.Below(count - 1);
        const std::string code = random.Below(2) == 0 ? kErrorStaleElement : kErrorAutomationFailed;
        if (random.Below(2) == 0) {
          tree.readFailures[handle] = code;
        } else {
          tree.listFailures[handle] = code;
        }
      }
      if (random.Below(5) == 0) {
        tree.capacity = random.Below(count + 1);
      }
      if (random.Below(4) == 0) {
        tree.unsupported.clear();
      }
      std::vector<std::size_t> nameLengths(count);
      std::vector<bool> secure(count);
      for (std::size_t handle = 0; handle < count; handle += 1) {
        nameLengths[handle] = random.Below(90);
        secure[handle] = random.Below(6) == 0;
      }
      tree.describe = [&, grin](ObservationHandle handle) {
        ObservedFacts facts;
        facts.role = handle % 3 == 0 ? "button" : "group";
        std::string name;
        for (std::size_t position = 0; position < nameLengths[handle]; position += 1) {
          name += position % 7 == 6 ? grin : std::string(1, static_cast<char>('a' + position % 26));
        }
        facts.name = name;
        facts.secure = secure[handle];
        facts.value = name;
        facts.helpText = SupportedString{handle % 2 == 0, name, handle % 2 == 0 ? "" : "No help."};
        if (handle % 4 == 0) {
          facts.actions = std::vector<std::string>{"press", name};
        }
        return facts;
      };
      ObserveBudget budget = Generous();
      budget.maxVisited = 1 + random.Below(count + 5);
      budget.maxDepth = random.Below(8);
      budget.maxStringLength = 16 + random.Below(48);
      budget.maxBytes = 4096 + random.Below(8192);
      std::vector<ObserveFact> facts;
      for (const ObserveFact fact : kAllFacts) {
        if (random.Below(3) == 0) {
          facts.push_back(fact);
        }
      }
      const ObserveRequest request = Request(budget, facts);
      const CancellationToken token;
      try {
        const ObservedSample first = SampleObservation(tree, ObservationRoot{}, request, token);
        const ObservedSample second = SampleObservation(tree, ObservationRoot{}, request, token);
        const std::string problem = StructuralProblem(first, request);
        if (problem.empty()) {
          valid += 1;
        } else {
          Check(false, "random tree " + std::to_string(index) + " breaks the contract: " + problem);
        }
        repeatable += NodesJson(first) == NodesJson(second) ? 1 : 0;
        bool matches = true;
        for (const ObservedNode& node : first.nodes) {
          const ObservationHandle handle = std::stoul(node.id.substr(1));
          const auto placement = tree.placements.find(handle);
          matches = matches && placement != tree.placements.end() &&
                    (node.depth == 0 || placement->second.first == node.parentId);
        }
        placed += matches ? 1 : 0;
        partial += first.complete() ? 0 : 1;
        Record("random tree " + std::to_string(index), request, first);
      } catch (const HelperError& error) {
        failed += 1;
        Check(false, "random tree " + std::to_string(index) + " failed: " + error.what());
      }
    }
    Check(valid == kTrees && failed == 0, "300 random trees with duplicates, failures, and tight budgets satisfy the contract");
    Check(repeatable == kTrees, "every random tree samples identically twice");
    Check(placed == kTrees, "every emitted id was identified under the parent it is emitted under");
    Check(partial > 0 && partial < kTrees, "the random trees include complete and partial samples");
  }

  void TestPinnedRecords() {
    const auto candidate = [](const std::wstring& key, const std::string& parentId = {},
                              const std::string& windowId = "window-a") {
      ElementRecord record;
      record.runtimeKey = key;
      record.parentId = parentId;
      record.windowId = windowId;
      return record;
    };
    // Every id noted here is a fresh registration across several tables.
    std::vector<std::string> issued;
    const auto note = [&](const std::optional<std::string>& id) {
      if (id) {
        issued.push_back(*id);
      }
      return id.value_or(std::string());
    };

    ElementRegistry tight(4);
    const std::string first = note(tight.RegisterPinned(candidate(L"a."), tight.BeginObservation()));
    Check(!first.empty() && tight.IsPinned(first), "an observed element is pinned");
    Check(tight.Register(candidate(L"a."), tight.BeginObservation()) == first && tight.IsPinned(first),
          "a tree walk that meets a pinned element keeps its id and its pin");
    for (const wchar_t* key : {L"b.", L"c.", L"d."}) {
      note(tight.RegisterPinned(candidate(key), tight.BeginObservation()));
    }
    Check(tight.size() == 4 && !tight.RegisterPinned(candidate(L"e."), tight.BeginObservation()) && tight.size() == 4,
          "a table full of pinned records refuses another instead of evicting one");
    Check(tight.RegisterPinned(candidate(L"a."), tight.BeginObservation()) == first,
          "a full table still returns the id of an element it already pins");
    const std::string walked = note(tight.Register(candidate(L"x."), tight.BeginObservation()));
    Check(!walked.empty() && tight.size() == 5 && tight.Contains(first),
          "a tree walk over a table of pinned records keeps every pin");

    ElementRegistry table(10);
    const std::uint64_t old = table.BeginObservation();
    const std::string parent = note(table.Register(candidate(L"parent."), old));
    const std::string child = note(table.RegisterPinned(candidate(L"child.", parent), old));
    for (int index = 0; index < 8; index += 1) {
      note(table.Register(candidate(L"old-" + std::to_wstring(index) + L"."), table.BeginObservation()));
    }
    const std::optional<std::string> fresh = table.RegisterPinned(candidate(L"fresh."), table.BeginObservation());
    note(fresh);
    Check(fresh.has_value() && table.Contains(parent) && table.Contains(child) && table.size() <= 10 &&
              table.ParentsRetainedForTesting(),
          "an observation evicts unpinned records for room and keeps every pin and its ancestors");

    ElementRegistry released;
    const std::uint64_t generation = released.BeginObservation();
    const std::string top = note(released.RegisterPinned(candidate(L"top."), generation));
    const std::string below = note(released.RegisterPinned(candidate(L"below.", top), generation));
    Check(released.Release({top, "element-unknown"}) == 1 && !released.Contains(top) && released.Contains(below),
          "releasing drops exactly the tracked ids named and leaves their children");
    Check(FailureCode([&]() { released.Require(top); }) == kErrorStaleElement,
          "a released id answers stale-element");
    const std::string again = note(released.RegisterPinned(candidate(L"top."), released.BeginObservation()));
    Check(!again.empty() && again != top, "an element released and seen again gets a new id");
    Check(released.Release({top}) == 0, "releasing an id again releases nothing");

    ElementRegistry replaced;
    ElementRecord button = candidate(L"button.");
    button.fingerprint.controlType = UIA_ButtonControlTypeId;
    const std::uint64_t walk = replaced.BeginObservation();
    const std::string host = note(replaced.Register(button, walk));
    const std::string held = note(replaced.RegisterPinned(candidate(L"held.", host), walk));
    const std::string loose = note(replaced.Register(candidate(L"loose.", host), walk));
    ElementRecord edit = candidate(L"button.");
    edit.fingerprint.controlType = UIA_EditControlTypeId;
    const std::string successor = note(replaced.Register(edit, replaced.BeginObservation()));
    Check(successor != host && !replaced.Contains(host) && !replaced.Contains(loose) && replaced.Contains(held),
          "a replaced element drops its unpinned descendants and keeps the pinned ones");

    ElementRegistry windows;
    note(windows.RegisterPinned(candidate(L"w1."), windows.BeginObservation()));
    note(windows.RegisterPinned(candidate(L"w2.", {}, "window-b"), windows.BeginObservation()));
    windows.ForgetWindow("window-a");
    Check(windows.size() == 1, "forgetting a window drops its pinned records");
    Check(!windows.Pin("element-missing", windows.BeginObservation()), "pinning an untracked id fails");

    const std::set<std::string> distinct(issued.begin(), issued.end());
    Check(issued.size() >= 20 && distinct.size() == issued.size(), "no id is issued twice, in any table");
  }

  const CheckFunction& check_;
  json::Value dump_;
};

}  // namespace

void RunObservationSelfTests(const CheckFunction& check) {
  ObservationTests(check).Run();
}

}  // namespace furn
