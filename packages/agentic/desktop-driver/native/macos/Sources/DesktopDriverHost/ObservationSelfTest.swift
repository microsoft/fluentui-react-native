import ApplicationServices
import CoreGraphics
import Foundation

// Self-tests for bounded observation (Observation.swift and AccessibilityObservation.swift).
//
// The sampler runs against a synthetic tree, so every truncation reason and every structural rule of the contract is
// exercised without a target application or Accessibility permission. When FURN_DRIVER_SELF_TEST_OBSERVATIONS names a
// file, the samples are also written there as JSON so the package's Jest suite can check them with the Node validator.

private let generousBudget = ObserveBudget(
  maxVisited: 5_000,
  maxDepth: 64,
  maxStringLength: 1_024,
  maxBytes: 4_194_304,
  deadlineMs: 30_000
)

private func limited(
  visited: Int? = nil,
  depth: Int? = nil,
  string: Int? = nil,
  bytes: Int? = nil,
  deadline: Int? = nil
) -> ObserveBudget {
  var budget = generousBudget
  budget.maxVisited = visited ?? budget.maxVisited
  budget.maxDepth = depth ?? budget.maxDepth
  budget.maxStringLength = string ?? budget.maxStringLength
  budget.maxBytes = bytes ?? budget.maxBytes
  budget.deadlineMs = deadline ?? budget.deadlineMs
  return budget
}

private let factKeys: Set<String> = [
  "actions", "checked", "enabled", "expanded", "focused", "helpText", "rect", "required", "selected", "text", "value",
  "visible",
]

/// A tree the sampler can walk. Handles are integers, `edges` lists children in provider order, and the hooks let a
/// test move the clock or cancel in the middle of a walk.
private final class SyntheticTree: ObservationSource {
  typealias Handle = Int

  var unsupportedFacts: Set<ObserveFact> = []
  var edges: [Int: [Int]]
  /// Elements whose attributes read but whose children cannot be read.
  var unreadableChildren: Set<Int> = []
  /// Elements whose read fails with this error code.
  var failures: [Int: String] = [:]
  var capacity = Int.max
  var describe: (Int) -> ObservedFacts = { ObservedFacts(role: "group", name: "n\($0)") }
  var scopeRule: (ElementScope, String?) -> (own: ElementScope, children: ElementScope) = { scope, _ in (scope, scope) }
  /// Runs between the two checkpoints of a read, like a slow provider call.
  var midRead: (Int) -> Void = { _ in }
  var afterRead: (Int) -> Void = { _ in }

  private(set) var reads: [Int] = []
  private(set) var placements: [Int: (parentID: String?, scope: ElementScope)] = [:]
  private var ids: [Int: String] = [:]

  init(_ edges: [Int: [Int]] = [:]) {
    self.edges = edges
  }

  func read(_ handle: Int, checkpoint: () throws -> Void) throws -> ObservedElement<Int> {
    try checkpoint()
    reads.append(handle)
    midRead(handle)
    try checkpoint()
    defer { afterRead(handle) }
    if let code = failures[handle] {
      throw HelperError(code: code, message: "The synthetic element \(handle) cannot be read.")
    }
    return ObservedElement(
      facts: describe(handle),
      children: unreadableChildren.contains(handle) ? nil : edges[handle] ?? []
    )
  }

  func scopes(inheriting scope: ElementScope, automationID: String?) -> (own: ElementScope, children: ElementScope) {
    scopeRule(scope, automationID)
  }

  func identify(_ handle: Int, parentID: String?, scope: ElementScope) -> String? {
    if let existing = ids[handle] {
      return existing
    }
    guard ids.count < capacity else {
      return nil
    }
    let id = "e\(handle)"
    ids[handle] = id
    placements[handle] = (parentID, scope)
    return id
  }
}

private func handle(of node: ObservedNode) -> Int {
  Int(node.id.dropFirst()) ?? -1
}

private func serializedBytes(_ node: ObservedNode) -> Int {
  (try? serializeJSON(node.json()).count) ?? Int.max
}

private func requestJSON(_ request: ObserveRequest) -> JSONObject {
  let budget = request.budget
  var json: JSONObject = [
    "budget": [
      "deadlineMs": budget.deadlineMs,
      "maxBytes": budget.maxBytes,
      "maxDepth": budget.maxDepth,
      "maxStringLength": budget.maxStringLength,
      "maxVisited": budget.maxVisited,
    ],
    "facts": request.facts.map { $0.rawValue },
    "windowId": request.windowID,
  ]
  if let rootID = request.rootID {
    json["rootId"] = rootID
  }
  return json
}

/// The samples the self-test produced, kept so the Node validator can check what the Swift sampler wrote.
private final class ObservationDump {
  private(set) var entries: [JSONObject] = []

  func add(_ name: String, _ request: ObserveRequest, _ sample: ObservedSample) {
    entries.append(["name": name, "request": requestJSON(request), "result": sample.json()])
  }
}

/// The rules every sample must satisfy whatever produced it. They mirror `describeObservationViolation` in
/// src/protocol/observation.ts, which is what the host applies to a helper's response.
private func structuralProblem(_ sample: ObservedSample, _ request: ObserveRequest) -> String? {
  let budget = request.budget
  let requested = Set(request.facts)
  if sample.nodes.count > budget.maxVisited {
    return "\(sample.nodes.count) nodes exceed the visited budget"
  }
  let reasons = sample.truncation.map { $0.reason }
  if Set(reasons).count != reasons.count {
    return "a truncation reason repeats"
  }
  if sample.nodes.isEmpty, !reasons.contains(.references) {
    return "an empty sample does not report references"
  }
  if let fact = sample.unsupportedFacts.first(where: { !requested.contains($0) }) {
    return "unsupportedFacts lists \(fact.rawValue), which was not requested"
  }

  var positions: [String: Int] = [:]
  var emitted: [String: Int] = [:]
  var previousDepth = 0
  for (position, node) in sample.nodes.enumerated() {
    if positions[node.id] != nil {
      return "node \(node.id) repeats"
    }
    if position == 0 {
      if node.depth != 0 || node.parentID != nil {
        return "the first node is not a root"
      }
    } else {
      guard let parentID = node.parentID, let parentPosition = positions[parentID] else {
        return "node \(node.id) has no earlier parent"
      }
      if node.depth != sample.nodes[parentPosition].depth + 1 {
        return "node \(node.id) is not one level below its parent"
      }
      if node.depth < previousDepth {
        return "node \(node.id) breaks breadth-first order"
      }
      emitted[parentID, default: 0] += 1
    }
    if node.depth > budget.maxDepth {
      return "node \(node.id) is deeper than the budget"
    }
    previousDepth = node.depth
    positions[node.id] = position

    let keys = Set(node.json().keys)
    let unsupported = Set(sample.unsupportedFacts)
    for fact in ObserveFact.allCases where !requested.contains(fact) || unsupported.contains(fact) {
      let key = fact == .geometry ? "rect" : fact == .help ? "helpText" : fact.rawValue
      if keys.contains(key) {
        return "node \(node.id) carries the unrequested \(key)"
      }
    }
    let strings = [node.facts.name, node.facts.automationID, node.facts.text, node.facts.value, node.facts.help?.value]
      .compactMap { $0 } + (node.facts.actions ?? [])
    if strings.contains(where: { $0.utf16.count > budget.maxStringLength }) {
      return "node \(node.id) has a string longer than the budget"
    }
  }

  for node in sample.nodes {
    let count = emitted[node.id, default: 0]
    switch node.childrenState {
    case .none:
      if count != 0 || (node.childCount ?? 0) != 0 {
        return "node \(node.id) reports no children but has some"
      }
    case .complete:
      if count == 0 || (node.childCount != nil && node.childCount != count) {
        return "node \(node.id) reports complete children that do not match what was emitted"
      }
    case .truncated:
      if let childCount = node.childCount, childCount <= count {
        return "node \(node.id) reports truncated children that were all emitted"
      }
    case .unknown:
      if count != 0 || node.childCount != nil {
        return "node \(node.id) reports unread children but has emitted children or a count"
      }
    }
    if sample.complete, node.childrenState == .truncated || node.childrenState == .unknown {
      return "node \(node.id) has partial children in a sample reported complete"
    }
  }
  return nil
}

private struct SplitMix64 {
  private var state: UInt64

  init(seed: UInt64) {
    state = seed
  }

  mutating func next() -> UInt64 {
    state &+= 0x9E37_79B9_7F4A_7C15
    var value = state
    value = (value ^ (value >> 30)) &* 0xBF58_476D_1CE4_E5B9
    value = (value ^ (value >> 27)) &* 0x94D0_49BB_1331_11EB
    return value ^ (value >> 31)
  }

  mutating func below(_ bound: Int) -> Int {
    Int(next() % UInt64(max(1, bound)))
  }
}

extension SelfTestRunner {
  func testObservation() {
    let dump = ObservationDump()
    testObservationRequests()
    testObservationWalk(dump)
    testObservationBudgets(dump)
    testObservationFailures(dump)
    testObservationFacts(dump)
    testObservationRandomTrees(dump)
    testObservationRecords()
    testPublishedActions()
    testUnansweredTarget()
    testObservationCommands()
    if let path = ProcessInfo.processInfo.environment["FURN_DRIVER_SELF_TEST_OBSERVATIONS"], !path.isEmpty {
      do {
        try serializeJSON(dump.entries).write(to: URL(fileURLWithPath: path))
        check(true, "the observation samples were written for the Node validator")
      } catch {
        check(false, "the observation samples were written for the Node validator: \(error)")
      }
    }
  }

  /// Walks a synthetic tree, checks the sample's structure, and records it for the Node validator.
  private func walk(
    _ name: String,
    _ tree: SyntheticTree,
    _ dump: ObservationDump,
    facts: [ObserveFact] = [],
    budget: ObserveBudget = generousBudget,
    rootParentID: String? = nil,
    rootScope: ElementScope = .application,
    token: CancellationToken = CancellationToken(),
    now: @escaping () -> Int = { 0 }
  ) -> ObservedSample? {
    let request = ObserveRequest(windowID: "window-1", rootID: nil, budget: budget, facts: facts)
    do {
      let sample = try sampleObservation(
        root: 0,
        rootParentID: rootParentID,
        rootScope: rootScope,
        request: request,
        source: tree,
        token: token,
        now: now
      )
      let problem = structuralProblem(sample, request)
      check(problem == nil, "\(name) is a well-formed sample\(problem.map { ": \($0)" } ?? "")")
      dump.add(name, request, sample)
      return sample
    } catch {
      check(false, "\(name) does not throw: \(error)")
      return nil
    }
  }

  private func testObservationRequests() {
    let budget: JSONObject = [
      "deadlineMs": 500, "maxBytes": 65_536, "maxDepth": 8, "maxStringLength": 64, "maxVisited": 200,
    ]
    let valid: JSONObject = ["budget": budget, "facts": ["geometry", "value"], "windowId": "window-1"]

    func edited(_ edit: (inout JSONObject) -> Void) -> JSONObject {
      var params = valid
      edit(&params)
      return params
    }
    func withBudget(_ key: String, _ value: Any?) -> JSONObject {
      edited {
        var changed = budget
        changed[key] = value
        $0["budget"] = changed
      }
    }
    func rejected(_ params: JSONObject) -> Bool {
      do {
        _ = try ObserveRequest.parse(params)
        return false
      } catch let error as HelperError {
        return error.code == ErrorCode.invalidParams
      } catch {
        return false
      }
    }

    let parsed = try? ObserveRequest.parse(valid)
    check(
      parsed?.windowID == "window-1" && parsed?.rootID == nil && parsed?.facts == [.geometry, .value]
        && parsed?.budget == ObserveBudget(maxVisited: 200, maxDepth: 8, maxStringLength: 64, maxBytes: 65_536, deadlineMs: 500),
      "a well-formed observe request is accepted as written"
    )
    check(
      (try? ObserveRequest.parse(edited { $0["rootId"] = "element-1" }))?.rootID == "element-1",
      "an observe request may name a root element"
    )
    check(
      (try? ObserveRequest.parse(edited { $0["facts"] = [] }))?.facts.isEmpty == true,
      "an observe request may ask for no optional facts"
    )
    check(rejected(edited { $0["depth"] = 3 }), "an observe request with an unknown field is rejected")
    check(rejected(edited { $0["windowId"] = nil }), "an observe request without a window is rejected")
    check(rejected(edited { $0["budget"] = nil }), "an observe request without a budget is rejected")
    check(rejected(edited { $0["facts"] = nil }), "an observe request without a facts list is rejected")
    check(rejected(withBudget("surprise", 1)), "an observe budget with an unknown field is rejected")
    check(rejected(withBudget("maxBytes", nil)), "an observe budget missing a field is rejected")
    check(rejected(edited { $0["facts"] = ["value", "bogus"] }), "an unknown fact is rejected")
    check(rejected(edited { $0["facts"] = ["value", "value"] }), "a repeated fact is rejected")
    check(rejected(edited { $0["facts"] = "value" }), "a facts value that is not a list is rejected")
    check(rejected(edited { $0["facts"] = [1] }), "a fact that is not a string is rejected")

    let ranges: [(String, ClosedRange<Int>)] = [
      ("maxVisited", ObserveBudget.maxVisitedRange),
      ("maxDepth", ObserveBudget.maxDepthRange),
      ("maxStringLength", ObserveBudget.maxStringLengthRange),
      ("maxBytes", ObserveBudget.maxBytesRange),
      ("deadlineMs", ObserveBudget.deadlineRange),
    ]
    var budgetMisses: [String] = []
    for (key, range) in ranges {
      for (label, value, acceptable) in [
        ("the lower bound", range.lowerBound as Any, true),
        ("the upper bound", range.upperBound as Any, true),
        ("a value below the range", (range.lowerBound - 1) as Any, false),
        ("a value above the range", (range.upperBound + 1) as Any, false),
        ("a fraction", (Double(range.lowerBound) + 0.5) as Any, false),
        ("a Boolean", true as Any, false),
        ("a string", String(range.lowerBound) as Any, false),
      ] {
        if rejected(withBudget(key, value)) == acceptable {
          budgetMisses.append("\(key): \(label)")
        }
      }
    }
    check(budgetMisses.isEmpty, "every budget field is range checked and never clamped\(budgetMisses.isEmpty ? "" : ": \(budgetMisses)")")

    check(rejected(edited { $0["rootId"] = "" }), "an empty root id is rejected")
    check(rejected(edited { $0["rootId"] = 7 }), "a root id that is not a string is rejected")
    check(
      rejected(edited { $0["rootId"] = String(repeating: "r", count: maximumElementIDBytes + 1) }),
      "a root id over the byte limit is rejected"
    )
    check(
      (try? ObserveRequest.parse(edited { $0["rootId"] = String(repeating: "r", count: maximumElementIDBytes) }))?.rootID?.count
        == maximumElementIDBytes,
      "a root id at the byte limit is accepted"
    )
    check(
      rejected(edited { $0["rootId"] = String(repeating: "é", count: maximumElementIDBytes / 2 + 1) }),
      "a root id is limited in UTF-8 bytes, not characters"
    )

    func releaseRejected(_ params: JSONObject) -> Bool {
      do {
        _ = try parseReleasedElementIDs(params)
        return false
      } catch let error as HelperError {
        return error.code == ErrorCode.invalidParams
      } catch {
        return false
      }
    }
    check((try? parseReleasedElementIDs(["ids": ["a", "b"]])) == ["a", "b"], "a release request keeps its ids in order")
    check((try? parseReleasedElementIDs(["ids": []]))?.isEmpty == true, "a release request may be empty")
    check(releaseRejected([:]), "a release request without ids is rejected")
    check(releaseRejected(["ids": ["a"], "extra": 1]), "a release request with an unknown field is rejected")
    check(releaseRejected(["ids": "a"]), "a release request whose ids are not a list is rejected")
    check(releaseRejected(["ids": ["a", "a"]]), "a release request with a repeated id is rejected")
    check(releaseRejected(["ids": [""]]), "a release request with an empty id is rejected")
    check(releaseRejected(["ids": [3]]), "a release request with a non-string id is rejected")
    check(
      releaseRejected(["ids": [String(repeating: "i", count: maximumElementIDBytes + 1)]]),
      "a release request with an overlong id is rejected"
    )
    check(
      (try? parseReleasedElementIDs(["ids": (0..<maximumReleasedElementIDs).map { "e\($0)" }]))?.count
        == maximumReleasedElementIDs,
      "a release request may carry the maximum number of ids"
    )
    check(
      releaseRejected(["ids": (0...maximumReleasedElementIDs).map { "e\($0)" }]),
      "a release request over the maximum number of ids is rejected"
    )
  }

  private func testObservationWalk(_ dump: ObservationDump) {
    let tree = SyntheticTree([0: [1, 2], 1: [3, 4]])
    if let sample = walk("a small tree", tree, dump) {
      check(sample.nodes.map { $0.id } == ["e0", "e1", "e2", "e3", "e4"], "nodes come out breadth first in provider order")
      check(sample.nodes.map { $0.depth } == [0, 1, 1, 2, 2], "nodes carry their depth")
      check(sample.complete && sample.truncation.isEmpty, "a tree that fits every budget is complete")
      check(sample.nodes[0].parentID == nil && sample.nodes[0].json()["parentId"] == nil, "the root has no parent id")
      check(sample.nodes[3].parentID == "e1", "a node names the element that owns it as its parent")
      check(
        sample.nodes[0].childrenState == .complete && sample.nodes[0].childCount == 2,
        "a parent whose children were all emitted is complete"
      )
      check(
        sample.nodes[2].childrenState == .none && sample.nodes[2].childCount == 0,
        "an element without children reports none"
      )
    }

    let repeated = SyntheticTree([0: [1, 2], 1: [3, 4]])
    if let first = walk("a small tree, again", repeated, dump), let second = walk("a small tree, once more", tree, dump) {
      check(
        NSDictionary(dictionary: first.json()).isEqual(to: second.json()),
        "the same tree and budgets give the same sample"
      )
    }

    // Element 0 appears in its own descendants, element 1 is listed twice, and element 3 is reachable from two parents.
    let cyclic = SyntheticTree([0: [1, 2, 1], 1: [0, 3], 2: [3, 0], 3: [1]])
    if let sample = walk("a tree with a cycle and shared children", cyclic, dump) {
      check(sample.nodes.map { $0.id } == ["e0", "e1", "e2", "e3"], "every element is emitted once, whatever lists it")
      check(sample.nodes[3].parentID == "e1", "a shared child belongs to the first parent that reached it")
      check(sample.nodes[0].childCount == 2, "a repeated listing counts once")
      check(sample.nodes[1].childCount == 1, "a child already reached through another parent is not counted again")
      check(
        sample.nodes[2].childrenState == .none && sample.nodes[2].childCount == 0,
        "a parent whose children all belong to others has none of its own"
      )
      check(sample.complete, "a cyclic tree ends and can still be complete")
    }

    let rooted = SyntheticTree([0: [1]])
    rooted.scopeRule = { scope, automationID in automationID == "story-root" ? (.preview, .preview) : (scope, scope) }
    rooted.describe = { ObservedFacts(role: "group", name: "n\($0)", automationID: $0 == 1 ? "story-root" : nil) }
    if let sample = walk("a sample under a tracked element", rooted, dump, rootParentID: "element-parent", rootScope: .chrome) {
      check(sample.nodes[0].json()["parentId"] == nil, "a rooted sample's root omits its parent id")
      check(
        rooted.placements[0]?.parentID == "element-parent" && rooted.placements[0]?.scope == .chrome,
        "the root keeps the parent and scope it was tracked with"
      )
      check(rooted.placements[1]?.parentID == "e0", "a child's record names the id the host issued to its parent")
      check(
        sample.nodes[1].scope == .preview && rooted.placements[1]?.scope == .preview,
        "a scope is assigned from the element's identity and inherited by its children"
      )
    }

    func walkThrows(_ edit: (SyntheticTree, CancellationToken) -> Void) -> (cancelled: Bool, reads: [Int]) {
      let tree = SyntheticTree([0: [1, 2, 3]])
      let token = CancellationToken()
      edit(tree, token)
      let request = ObserveRequest(windowID: "window-1", rootID: nil, budget: generousBudget, facts: [])
      do {
        _ = try sampleObservation(
          root: 0, rootParentID: nil, rootScope: .application, request: request, source: tree, token: token, now: { 0 }
        )
        return (false, tree.reads)
      } catch is CancelledError {
        return (true, tree.reads)
      } catch {
        return (false, tree.reads)
      }
    }
    let early = walkThrows { _, token in token.cancel() }
    check(early.cancelled && early.reads.isEmpty, "a walk cancelled before it starts reads nothing")
    let late = walkThrows { tree, token in
      tree.afterRead = { if $0 == 1 { token.cancel() } }
    }
    check(late.cancelled && late.reads == [0, 1], "a walk cancelled part way stops before the next read")
  }

  private func testObservationBudgets(_ dump: ObservationDump) {
    let wide = SyntheticTree([0: Array(1...10)])
    if let sample = walk("a wide tree under a small visited budget", wide, dump, budget: limited(visited: 5)) {
      check(sample.nodes.count == 5, "the visited budget bounds the nodes")
      check(
        sample.truncation.count == 1 && sample.truncation[0].reason == .visited && sample.truncation[0].limit == 5
          && sample.truncation[0].unvisited == 6,
        "the visited truncation counts the elements left out"
      )
      check(
        sample.nodes[0].childrenState == .truncated && sample.nodes[0].childCount == 10,
        "a parent with children left out is truncated and reports how many it has"
      )
    }
    let layered = SyntheticTree([0: [1, 2, 3], 1: [4, 5, 6], 2: [7, 8, 9], 3: [10, 11, 12]])
    if let sample = walk("a layered tree under a small visited budget", layered, dump, budget: limited(visited: 6)) {
      check(sample.nodes.map { $0.id } == ["e0", "e1", "e2", "e3", "e4", "e5"], "the visited budget keeps the first nodes in order")
      check(
        sample.truncation.first?.unvisited == 7 && sample.nodes.count + 7 == 13,
        "the elements left out add up across parents"
      )
      check(
        sample.nodes[0].childrenState == .complete && sample.nodes[1].childrenState == .truncated
          && sample.nodes[2].childrenState == .truncated,
        "only the parents whose children were left out are truncated"
      )
    }

    let chain = SyntheticTree([0: [1], 1: [2], 2: [3]])
    if let sample = walk("a chain under a depth budget", chain, dump, budget: limited(depth: 1)) {
      check(sample.nodes.map { $0.id } == ["e0", "e1"], "the depth budget stops the walk")
      check(
        sample.truncation.count == 1 && sample.truncation[0].reason == .depth && sample.truncation[0].limit == 1
          && sample.truncation[0].unvisited == 1,
        "the depth truncation counts the elements below the cut"
      )
      check(
        sample.nodes[1].childrenState == .truncated && sample.nodes[1].childCount == 1,
        "an element at the depth limit is truncated and reports its children"
      )
    }
    if let sample = walk("a chain under a zero depth budget", chain, dump, budget: limited(depth: 0)) {
      check(sample.nodes.map { $0.id } == ["e0"] && sample.truncation.first?.reason == .depth, "a zero depth budget returns only the root")
    }

    let named = SyntheticTree([0: Array(1...200)])
    named.describe = { ObservedFacts(role: "group", name: String(repeating: "x", count: 60) + "\($0)") }
    if let sample = walk("a tree under a byte budget", named, dump, budget: limited(bytes: 4_096)),
      let larger = walk("a tree under a larger byte budget", named, dump, budget: limited(bytes: 8_192))
    {
      check(
        sample.truncation.count == 1 && sample.truncation[0].reason == .bytes && sample.truncation[0].limit == 4_096
          && (sample.truncation[0].unvisited ?? 0) > 0,
        "the byte budget ends the sample with its own truncation"
      )
      check(
        sample.nodes.count > 5 && sample.nodes.count < 100 && larger.nodes.count > sample.nodes.count,
        "a bigger byte budget keeps more nodes"
      )
      check(
        sample.nodes.dropFirst().reduce(0) { $0 + serializedBytes($1) } <= 4_096,
        "the nodes after the root fit the byte budget"
      )
    }
    let heavy = SyntheticTree([0: [1, 2]])
    heavy.describe = { _ in
      let long = String(repeating: "h", count: 1_000)
      return ObservedFacts(role: "textbox", name: long, automationID: long, help: .supported(long), text: long, value: long)
    }
    if let sample = walk(
      "a root larger than the byte budget",
      heavy,
      dump,
      facts: [.help, .text, .value],
      budget: limited(bytes: 4_096)
    ) {
      check(
        sample.nodes.map { $0.id } == ["e0"] && sample.truncation.first?.reason == .bytes,
        "the root is returned even when it alone exceeds the byte budget"
      )
    }

    var clock = 0
    let slow = SyntheticTree([0: [1, 2, 3]])
    slow.afterRead = { _ in clock += 30 }
    if let sample = walk("a slow provider", slow, dump, budget: limited(deadline: 50), now: { clock }) {
      check(sample.nodes.map { $0.id } == ["e0", "e1"], "the walk stops starting reads once the deadline has passed")
      check(
        sample.truncation.count == 1 && sample.truncation[0].reason == .deadline && sample.truncation[0].limit == 50
          && sample.truncation[0].unvisited == 2,
        "the deadline truncation counts the elements not read"
      )
      check(sample.elapsedMs == 60, "the elapsed time includes the read that was already in flight")
    }
    clock = 0
    let stalled = SyntheticTree([0: [1, 2, 3]])
    stalled.midRead = { if $0 == 2 { clock += 100 } }
    if let sample = walk("a provider that stalls inside a read", stalled, dump, budget: limited(deadline: 50), now: { clock }) {
      check(sample.nodes.map { $0.id } == ["e0", "e1"], "a read that outlasts the deadline between its calls is abandoned")
      check(stalled.placements[2] == nil, "an abandoned read leaves no record behind")
      check(sample.truncation.first?.reason == .deadline && sample.truncation.first?.unvisited == 2, "the abandoned element is counted as unread")
    }
    clock = 0
    let sluggishRoot = SyntheticTree([0: [1, 2, 3]])
    sluggishRoot.midRead = { if $0 == 0 { clock += 1_000 } }
    if let sample = walk("a root that outlasts the deadline", sluggishRoot, dump, budget: limited(deadline: 50), now: { clock }) {
      check(
        sample.nodes.map { $0.id } == ["e0"] && sample.truncation.first?.reason == .deadline && sample.truncation.first?.unvisited == 3,
        "the root is always read, whatever the deadline"
      )
    }

    let crowded = SyntheticTree([0: [1, 2, 3, 4]])
    crowded.capacity = 3
    if let sample = walk("a tree larger than the element table", crowded, dump) {
      check(sample.nodes.map { $0.id } == ["e0", "e1", "e2"], "a node is emitted only when the table could record it")
      check(
        sample.truncation.count == 1 && sample.truncation[0].reason == .references && sample.truncation[0].unvisited == 2,
        "a full element table ends the sample with a references truncation"
      )
      check(
        sample.nodes[0].childrenState == .truncated && sample.nodes[0].childCount == 4,
        "a parent whose children did not fit the table is truncated"
      )
    }
    let none = SyntheticTree([0: [1]])
    none.capacity = 0
    if let sample = walk("an element table with no room", none, dump) {
      check(sample.nodes.isEmpty && sample.truncation.map { $0.reason } == [.references], "no room for the root gives an empty sample with references")
      check(!sample.complete, "an empty sample is not complete")
    }
  }

  private func testObservationFailures(_ dump: ObservationDump) {
    let unreadable = SyntheticTree([0: [1, 2]])
    unreadable.unreadableChildren = [1]
    if let sample = walk("an element whose children cannot be read", unreadable, dump) {
      check(
        sample.nodes[1].childrenState == .unknown && sample.nodes[1].childCount == nil,
        "children that cannot be read are unknown, not empty"
      )
      check(sample.truncation.map { $0.reason } == [.unreadable] && !sample.complete, "unread children make the sample incomplete")
    }
    let rootUnreadable = SyntheticTree()
    rootUnreadable.unreadableChildren = [0]
    if let sample = walk("a root whose children cannot be read", rootUnreadable, dump) {
      check(sample.nodes.count == 1 && sample.nodes[0].childrenState == .unknown, "a root with unread children is still returned")
    }

    let failing = SyntheticTree([0: [1, 2, 3]])
    failing.failures[2] = ErrorCode.automationFailed
    if let sample = walk("an element that cannot be read", failing, dump) {
      check(sample.nodes.map { $0.id } == ["e0", "e1", "e3"], "an element that fails to read is skipped")
      check(
        sample.nodes[0].childrenState == .truncated && sample.nodes[0].childCount == 3,
        "a skipped element still counts as a child its parent has"
      )
      check(sample.truncation.map { $0.reason } == [.unreadable], "a skipped element is reported as unreadable")
    }

    let vanishing = SyntheticTree([0: [1, 2, 3]])
    vanishing.failures[2] = ErrorCode.staleElement
    if let sample = walk("an element that vanishes mid walk", vanishing, dump) {
      check(sample.nodes.map { $0.id } == ["e0", "e1", "e3"], "an element that disappears is left out")
      check(
        sample.nodes[0].childrenState == .complete && sample.nodes[0].childCount == 2 && sample.complete,
        "an element that disappeared is not counted as a child, so the sample stays complete"
      )
    }
    let gone = SyntheticTree([0: [1, 2]])
    gone.failures = [1: ErrorCode.staleElement, 2: ErrorCode.staleElement]
    if let sample = walk("children that all vanish", gone, dump) {
      check(
        sample.nodes.count == 1 && sample.nodes[0].childrenState == .none && sample.nodes[0].childCount == 0 && sample.complete,
        "a parent whose children all disappeared has none"
      )
    }

    for code in [ErrorCode.staleElement, ErrorCode.automationFailed] {
      let broken = SyntheticTree([0: [1]])
      broken.failures[0] = code
      let request = ObserveRequest(windowID: "window-1", rootID: nil, budget: generousBudget, facts: [])
      var surfaced: String?
      do {
        _ = try sampleObservation(
          root: 0, rootParentID: nil, rootScope: .application, request: request, source: broken, token: CancellationToken(), now: { 0 }
        )
      } catch let error as HelperError {
        surfaced = error.code
      } catch {
        surfaced = "other"
      }
      check(surfaced == code, "a root that fails with \(code) fails the command instead of returning a sample")
    }
  }

  private func testObservationFacts(_ dump: ObservationDump) {
    let rich = SyntheticTree([0: [1]])
    rich.describe = { handle in
      ObservedFacts(
        role: "checkbox",
        name: "Option \(handle)",
        automationID: "option-\(handle)",
        actions: ["AXPress"],
        checked: .mixed,
        enabled: .supported(true),
        expanded: .unsupported("The element does not expose expanded state."),
        focused: .supported(false),
        geometry: CGRect(x: 1, y: 2, width: 30, height: 40),
        help: .unsupported("The element has no help text."),
        required: .unsupported("The element does not expose required state."),
        selected: .supported(true),
        text: "text",
        value: "value",
        visible: .supported(true)
      )
    }
    if let sample = walk("every fact requested", rich, dump, facts: ObserveFact.allCases) {
      let json = sample.nodes[0].json()
      check(factKeys.isSubset(of: Set(json.keys)), "every requested fact is reported")
      check((json["checked"] as? JSONObject)?["value"] as? String == "mixed", "a mixed checked state is reported as mixed")
      check(
        (json["expanded"] as? JSONObject)?["supported"] as? Bool == false
          && ((json["expanded"] as? JSONObject)?["reason"] as? String)?.isEmpty == false,
        "an unsupported fact carries its reason"
      )
      check(
        (json["rect"] as? JSONObject)?["width"] as? Double == 30 && (json["rect"] as? JSONObject)?["y"] as? Double == 2,
        "geometry is reported as rect"
      )
      check(
        (json["helpText"] as? JSONObject)?["supported"] as? Bool == false && json["name"] as? String == "Option 0"
          && json["automationId"] as? String == "option-0",
        "help is reported as helpText, and names and automation ids are always reported"
      )
    }
    if let sample = walk("no optional facts requested", rich, dump, facts: []) {
      let json = sample.nodes[0].json()
      check(Set(json.keys).isDisjoint(with: factKeys), "a fact nobody asked for is never reported, whatever the provider read")
      check(
        json["name"] as? String == "Option 0" && json["role"] as? String == "checkbox" && json["scope"] as? String == "application",
        "the identifying fields are reported without being requested"
      )
    }
    if let sample = walk("one fact requested", rich, dump, facts: [.value]) {
      let json = sample.nodes[0].json()
      check(json["value"] as? String == "value" && json["text"] == nil && json["enabled"] == nil, "only the requested fact is reported")
    }

    rich.unsupportedFacts = [.required, .expanded]
    if let sample = walk("facts the platform cannot report", rich, dump, facts: [.value, .required, .expanded]) {
      let json = sample.nodes[0].json()
      check(sample.unsupportedFacts == [.required, .expanded], "facts the platform never reports are listed once")
      check(json["required"] == nil && json["expanded"] == nil && json["value"] as? String == "value", "an unsupported fact is omitted from every node")
    }
    if let sample = walk("unsupported facts that were not requested", rich, dump, facts: [.value]) {
      check(sample.unsupportedFacts.isEmpty, "an unsupported fact nobody asked for is not listed")
    }

    let long = SyntheticTree()
    long.describe = { _ in
      ObservedFacts(
        role: "textbox",
        name: String(repeating: "a", count: 15) + "😀",
        automationID: String(repeating: "b", count: 40),
        actions: ["AXPress", String(repeating: "c", count: 40)],
        help: .supported(String(repeating: "d", count: 30)),
        text: "exactly sixteen!",
        value: String(repeating: "v", count: 100)
      )
    }
    if let sample = walk(
      "strings longer than the budget",
      long,
      dump,
      facts: [.actions, .help, .text, .value],
      budget: limited(string: 16)
    ) {
      let node = sample.nodes[0]
      check(node.facts.name?.utf16.count == 15, "a string is not cut between the halves of a surrogate pair")
      check(node.facts.automationID?.count == 16 && node.facts.value?.count == 16 && node.facts.help?.value?.count == 16, "strings are cut to the budget")
      check(
        Set(node.clipped) == ["name", "automationId", "helpText", "value"] && node.json()["clipped"] != nil,
        "a clipped string is listed by field"
      )
      check(node.facts.text == "exactly sixteen!", "a string at the limit is kept whole and not listed")
      check(
        node.facts.actions == ["AXPress", String(repeating: "c", count: 16)] && !node.clipped.contains("actions"),
        "an overlong action name is cut without being listed"
      )
    }
    let emoji = clipToUTF16Limit("a" + String(repeating: "😀", count: 10), limit: 16)
    check(emoji.clipped && emoji.text.utf16.count == 15 && emoji.text.unicodeScalars.last?.value == 0x1F600, "clipping stops before a pair that does not fit")
    check(!clipToUTF16Limit(String(repeating: "😀", count: 8), limit: 16).clipped, "a string of exactly the limit in UTF-16 units is not clipped")

    let secret = SyntheticTree()
    secret.describe = { _ in ObservedFacts(role: "textbox", name: "Password", secure: true, text: "hunter2", value: "hunter2") }
    if let sample = walk("a secure field", secret, dump, facts: [.text, .value]) {
      let json = sample.nodes[0].json()
      check(json["value"] == nil && json["text"] == nil, "the value and text of a secure field are never reported")
      check(json["name"] as? String == "Password", "a secure field is still identified")
    }
    secret.describe = { _ in ObservedFacts(role: "textbox", name: "Search", text: "swift", value: "swift") }
    if let sample = walk("an ordinary text field", secret, dump, facts: [.text, .value]) {
      check(sample.nodes[0].json()["value"] as? String == "swift" && sample.nodes[0].json()["text"] as? String == "swift", "an ordinary field reports its value and text")
    }
  }

  /// Walks many generated trees, including shared children, cycles, failures, and tight budgets, and compares each
  /// sample with a plain breadth-first model of the same tree.
  private func testObservationRandomTrees(_ dump: ObservationDump) {
    var problems: [String] = []
    var samples = 0
    for seed in 0..<500 {
      var rng = SplitMix64(seed: UInt64(seed))
      let nodeCount = 1 + rng.below(120)
      let tree = SyntheticTree()
      var next = 1
      var frontier = [0]
      var cursor = 0
      while cursor < frontier.count, next < nodeCount {
        let node = frontier[cursor]
        cursor += 1
        var list: [Int] = []
        for _ in 0..<rng.below(6) {
          if next < nodeCount, rng.below(10) < 8 {
            list.append(next)
            frontier.append(next)
            next += 1
          } else {
            list.append(rng.below(next))
          }
        }
        if !list.isEmpty {
          tree.edges[node] = list
        }
      }

      let constrained = rng.below(4) != 0
      var injected = false
      if constrained, rng.below(3) == 0 {
        for _ in 0..<(1 + rng.below(3)) {
          let handle = 1 + rng.below(max(1, nodeCount - 1))
          switch rng.below(3) {
          case 0: tree.failures[handle] = ErrorCode.staleElement
          case 1: tree.failures[handle] = ErrorCode.automationFailed
          default: tree.unreadableChildren.insert(handle)
          }
          injected = true
        }
      }
      var budget = generousBudget
      var clock = 0
      var step = 0
      if constrained {
        budget = limited(
          visited: 1 + rng.below(60),
          depth: rng.below(10),
          bytes: ObserveBudget.maxBytesRange.lowerBound + rng.below(8_000),
          deadline: 50 + rng.below(200)
        )
        step = rng.below(20)
        if rng.below(3) == 0 {
          tree.capacity = 1 + rng.below(nodeCount + 5)
        }
      }
      tree.afterRead = { _ in clock += step }
      tree.describe = { handle in
        ObservedFacts(role: "group", name: String(repeating: "n", count: 1 + (handle * 37) % 120), value: "v\(handle)")
      }
      let facts = ObserveFact.allCases.filter { _ in rng.below(2) == 0 }
      let request = ObserveRequest(windowID: "window-1", rootID: nil, budget: budget, facts: facts)

      let sample: ObservedSample
      do {
        sample = try sampleObservation(
          root: 0,
          rootParentID: nil,
          rootScope: .application,
          request: request,
          source: tree,
          token: CancellationToken(),
          now: { clock }
        )
      } catch {
        problems.append("seed \(seed): the walk threw \(error)")
        continue
      }
      samples += 1
      if seed < 80 {
        dump.add("random tree \(seed)", request, sample)
      }
      if let problem = randomTreeProblem(
        sample,
        request,
        tree: tree,
        injected: injected,
        clock: clock,
        unbounded: !constrained
      ) {
        problems.append("seed \(seed): \(problem)")
      }
    }
    if !problems.isEmpty {
      print(problems.prefix(5).joined(separator: "\n"))
    }
    check(samples == 500, "every generated tree can be walked")
    check(problems.isEmpty, "generated trees give well-formed samples that match a breadth-first model (\(problems.count) problems)")
  }

  private func randomTreeProblem(
    _ sample: ObservedSample,
    _ request: ObserveRequest,
    tree: SyntheticTree,
    injected: Bool,
    clock: Int,
    unbounded: Bool
  ) -> String? {
    if let problem = structuralProblem(sample, request) {
      return problem
    }
    let budget = request.budget

    // The model: breadth first from the root, each element belonging to the first parent that lists it.
    var order = [0]
    var depths = [0: 0]
    var parents: [Int: Int] = [:]
    var index = 0
    while index < order.count {
      let node = order[index]
      index += 1
      for child in tree.edges[node] ?? [] where depths[child] == nil {
        depths[child] = depths[node, default: 0] + 1
        parents[child] = node
        order.append(child)
      }
    }
    let handles = sample.nodes.map(handle(of:))

    for node in sample.nodes.dropFirst() {
      let child = handle(of: node)
      guard let parent = node.parentID.map({ Int($0.dropFirst()) ?? -1 }), tree.edges[parent]?.contains(child) == true else {
        return "node \(node.id) is not a child of its parent"
      }
    }
    if !Set(handles).isSubset(of: Set(order)) {
      return "a node is not reachable from the root"
    }
    for reason in sample.truncation {
      let expected: Int?
      switch reason.reason {
      case .visited: expected = budget.maxVisited
      case .depth: expected = budget.maxDepth
      case .bytes: expected = budget.maxBytes
      case .deadline: expected = budget.deadlineMs
      case .references, .unreadable: expected = nil
      }
      if reason.limit != expected {
        return "the \(reason.reason.rawValue) truncation reports the limit \(String(describing: reason.limit))"
      }
    }
    let reasons = Set(sample.truncation.map { $0.reason })
    if reasons.contains(.deadline), clock < budget.deadlineMs {
      return "a deadline truncation without the deadline having passed"
    }
    if reasons.contains(.references), tree.placements.count != tree.capacity {
      return "a references truncation while the element table had room"
    }
    if reasons.contains(.bytes) || sample.nodes.count > 1 {
      let bytes = sample.nodes.dropFirst().reduce(0) { $0 + serializedBytes($1) }
      if bytes > budget.maxBytes {
        return "the nodes after the root use \(bytes) bytes of \(budget.maxBytes)"
      }
    }

    if !injected {
      let expected = order.filter { depths[$0, default: 0] <= budget.maxDepth }.prefix(budget.maxVisited)
      if handles != Array(expected.prefix(handles.count)) {
        return "the nodes are not a prefix of the breadth-first order"
      }
      for node in sample.nodes.dropFirst() where parents[handle(of: node)].map({ "e\($0)" }) != node.parentID {
        return "node \(node.id) is not under the first parent that lists it"
      }
      if reasons.isSubset(of: [.visited, .depth]), handles != Array(expected) {
        return "a sample cut only by visited and depth does not hold every node inside them"
      }
      if reasons == [.visited], sample.nodes.count != budget.maxVisited {
        return "a visited truncation without the visited budget being spent"
      }
      // Generated chains can run deeper than the largest depth budget, which is then a real cut.
      if unbounded, (depths.values.max() ?? 0) <= budget.maxDepth, !sample.complete || handles != order {
        return "a tree within every budget was not returned whole"
      }
    }
    return nil
  }

  private func testObservationRecords() {
    let engine = AccessibilityEngine()
    func register(_ processID: pid_t) -> ElementRecord? {
      engine.registerIfRoom(
        AXUIElementCreateApplication(processID),
        processID: processID,
        windowID: "window-1",
        parentID: nil,
        scope: .application
      )
    }

    var records: [ElementRecord] = []
    // Application elements are distinct per process id and need no Accessibility permission to create.
    while records.count < AccessibilityEngine.maximumElementRecords, let record = register(pid_t(records.count + 1)) {
      records.append(record)
    }
    check(records.count == AccessibilityEngine.maximumElementRecords, "the element table takes records up to its capacity")
    let overflow = pid_t(AccessibilityEngine.maximumElementRecords + 1)
    check(register(overflow) == nil, "a full element table reports no room instead of failing")
    check(register(1)?.id == records[0].id, "an element that is already tracked needs no new record, even when the table is full")

    check(engine.releaseRecords([records[0].id, records[1].id, "element-untracked"]) == 2, "releasing counts only the records it held")
    check(engine.releaseRecords([records[0].id]) == 0, "releasing twice is harmless")
    var staleCode: String?
    do {
      _ = try engine.requireRecord(records[0].id)
    } catch let error as HelperError {
      staleCode = error.code
    } catch {}
    check(staleCode == ErrorCode.staleElement, "a released id is stale")
    check((try? engine.requireRecord(records[2].id))?.id == records[2].id, "releasing leaves other records alone")

    let reissued = register(1)
    check(reissued != nil && reissued?.id != records[0].id, "an element observed again after its release gets a new id")
    check(register(2) != nil, "releasing makes room")
    check(register(overflow) == nil, "the freed room is used up again")

    engine.forgetWindow("window-1")
    var forgotten: String?
    do {
      _ = try engine.requireRecord(records[2].id)
    } catch let error as HelperError {
      forgotten = error.code
    } catch {}
    check(forgotten == ErrorCode.staleElement && register(overflow) != nil, "forgetting a window drops all of its records")
  }

  /// An element that cannot list its actions publishes none, but a dead element or a dead API is still reported.
  private func testPublishedActions() {
    func outcome(_ error: AXError, _ names: [String]? = nil) -> (actions: [String]?, code: String?) {
      do {
        return (try publishedActionNames(error: error, names: names), nil)
      } catch {
        return (nil, (error as? HelperError)?.code)
      }
    }

    check(outcome(.success, ["AXPress", "AXShowMenu"]).actions == ["AXPress", "AXShowMenu"], "published actions keep the provider's order")
    check(outcome(.success).actions == [], "an element that lists no actions publishes none")
    check(outcome(.actionUnsupported).actions == [], "an element without an action list publishes none")
    check(outcome(.failure).actions == [], "an element whose action query fails in general, such as a split view divider, publishes none")
    check(outcome(.invalidUIElement).code == ErrorCode.staleElement, "a dead element is stale rather than action free")
    check(outcome(.apiDisabled).code == ErrorCode.inputUnavailable, "a disabled Accessibility API is not read as no actions")
    check(outcome(.cannotComplete).code == ErrorCode.automationFailed, "an unanswered action query is not read as no actions")
  }

  /// A target that does not answer is reported with a reason a caller can act on, apart from a request that was wrong.
  private func testUnansweredTarget() {
    func failure(_ error: AXError) -> HelperError? {
      do {
        try throwAX(error, operation: "Reading AXRole")
        return nil
      } catch {
        return error as? HelperError
      }
    }

    let unanswered = failure(.cannotComplete)
    check(unanswered?.code == ErrorCode.automationFailed, "a target that does not answer fails as an automation failure")
    check(unanswered?.data?["reason"] as? String == "target-non-response", "an unanswered request says the target did not respond")
    check(
      (unanswered?.data?["axError"] as? JSONObject)?["name"] as? String == "cannotComplete",
      "an unanswered request names the platform error"
    )
    check(failure(.failure)?.code == ErrorCode.automationFailed, "a general failure is still an automation failure")
    check(failure(.failure)?.data?["reason"] == nil, "a general failure does not claim the target stopped responding")
  }

  private func testObservationCommands() {
    let driver = Driver()
    let token = CancellationToken()
    func failure(_ command: String, _ params: JSONObject) -> HelperError? {
      do {
        _ = try driver.execute(command: command, params: params, token: token)
        return nil
      } catch {
        return error as? HelperError
      }
    }

    let budget: JSONObject = [
      "deadlineMs": 500, "maxBytes": 65_536, "maxDepth": 8, "maxStringLength": 64, "maxVisited": 200,
    ]
    let invalid = failure("observe", ["budget": budget, "facts": ["bogus"], "windowId": "window-1"])
    check(invalid?.code == ErrorCode.invalidParams && invalid?.effect == nil, "an invalid observe request is rejected and claims no effect")
    check(failure("observe", [:])?.code == ErrorCode.invalidParams, "an empty observe request is rejected")
    check(
      failure("observe", ["budget": budget, "facts": ["value"], "windowId": "window-missing"])?.code == ErrorCode.noSuchWindow,
      "observing a window the helper does not track reports no such window"
    )
    check(failure("releaseElements", ["ids": ["a", "a"]])?.code == ErrorCode.invalidParams, "an invalid release request is rejected")

    let released = try? driver.execute(command: "releaseElements", params: ["ids": ["element-untracked"]], token: token)
    check((released?.result as? JSONObject)?["released"] as? Int == 0, "releasing an id the helper never issued releases nothing")

    let probed = try? driver.execute(command: "probe", params: [:], token: token)
    let features = (probed?.result as? JSONObject)?["features"] as? JSONObject
    check(features?["boundedObservation"] as? Bool == AXIsProcessTrusted(), "the probe offers bounded observation exactly when Accessibility is trusted")
  }
}
