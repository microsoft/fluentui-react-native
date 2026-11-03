import CoreGraphics
import Foundation

// Bounded observation: the macOS side of the FDR1 contract in native/PROTOCOL.md ("Bounded observation").
//
// The sampler in this file is platform neutral. It owns the budgets, the breadth-first order, the shape of every node,
// and the truncation vocabulary, and it reads elements through an `ObservationSource`. The Accessibility-backed source
// is in AccessibilityObservation.swift; the self-tests drive the same sampler with a synthetic tree, so every
// truncation reason is exercised without a target application or Accessibility permission.

enum ObserveFact: String, CaseIterable {
  case actions
  case checked
  case enabled
  case expanded
  case focused
  case geometry
  case help
  case required
  case selected
  case text
  case value
  case visible
}

struct ObserveBudget: Equatable {
  static let maxVisitedRange = 1...5_000
  static let maxDepthRange = 0...64
  static let maxStringLengthRange = 16...1_024
  static let maxBytesRange = 4_096...4_194_304
  static let deadlineRange = 50...30_000

  var maxVisited: Int
  var maxDepth: Int
  var maxStringLength: Int
  var maxBytes: Int
  var deadlineMs: Int
}

let maximumElementIDBytes = 256
let maximumReleasedElementIDs = 1_000

struct ObserveRequest {
  let windowID: String
  let rootID: String?
  let budget: ObserveBudget
  /// The requested facts in request order; the contract rejects repeats.
  let facts: [ObserveFact]

  /// Validates a request as strictly as Node does before it sends one: nothing is clamped and nothing is ignored.
  static func parse(_ params: JSONObject) throws -> ObserveRequest {
    try rejectUnknownFields(params, allowed: ["budget", "facts", "rootId", "windowId"], request: "observe")
    let windowID = try requireString(params, "windowId")
    var rootID: String?
    if let raw = params["rootId"] {
      rootID = try requireElementID(raw, field: "rootId")
    }
    let budgetObject = try requireObject(params["budget"], "The observe request requires a budget object.")
    try rejectUnknownFields(
      budgetObject,
      allowed: ["deadlineMs", "maxBytes", "maxDepth", "maxStringLength", "maxVisited"],
      request: "observe budget"
    )
    let budget = ObserveBudget(
      maxVisited: try requireBudgetInteger(budgetObject, "maxVisited", ObserveBudget.maxVisitedRange),
      maxDepth: try requireBudgetInteger(budgetObject, "maxDepth", ObserveBudget.maxDepthRange),
      maxStringLength: try requireBudgetInteger(budgetObject, "maxStringLength", ObserveBudget.maxStringLengthRange),
      maxBytes: try requireBudgetInteger(budgetObject, "maxBytes", ObserveBudget.maxBytesRange),
      deadlineMs: try requireBudgetInteger(budgetObject, "deadlineMs", ObserveBudget.deadlineRange)
    )
    guard let rawFacts = params["facts"] as? [Any] else {
      try fail(ErrorCode.invalidParams, "The observe request requires a \"facts\" array.")
    }
    var facts: [ObserveFact] = []
    for raw in rawFacts {
      guard let name = raw as? String, let fact = ObserveFact(rawValue: name) else {
        try fail(ErrorCode.invalidParams, "The observe request names an unknown fact.")
      }
      guard !facts.contains(fact) else {
        try fail(ErrorCode.invalidParams, "The observe request repeats the \"\(name)\" fact.")
      }
      facts.append(fact)
    }
    return ObserveRequest(windowID: windowID, rootID: rootID, budget: budget, facts: facts)
  }
}

/// Validates a `releaseElements` request: at most 1,000 distinct ids of 1 to 256 UTF-8 bytes each.
func parseReleasedElementIDs(_ params: JSONObject) throws -> [String] {
  try rejectUnknownFields(params, allowed: ["ids"], request: "releaseElements")
  guard let raw = params["ids"] as? [Any], raw.count <= maximumReleasedElementIDs else {
    try fail(ErrorCode.invalidParams, "The releaseElements request requires an \"ids\" array of at most \(maximumReleasedElementIDs) ids.")
  }
  var ids: [String] = []
  var seen = Set<String>()
  for value in raw {
    let id = try requireElementID(value, field: "ids")
    guard seen.insert(id).inserted else {
      try fail(ErrorCode.invalidParams, "The releaseElements request repeats an id.")
    }
    ids.append(id)
  }
  return ids
}

private func rejectUnknownFields(_ object: JSONObject, allowed: Set<String>, request: String) throws {
  if let unknown = object.keys.filter({ !allowed.contains($0) }).sorted().first {
    try fail(ErrorCode.invalidParams, "The \(request) request has an unknown field \"\(unknown)\".")
  }
}

private func requireElementID(_ raw: Any, field: String) throws -> String {
  guard let id = raw as? String, !id.isEmpty, id.utf8.count <= maximumElementIDBytes else {
    try fail(ErrorCode.invalidParams, "The \"\(field)\" value must be an element id of 1 to \(maximumElementIDBytes) UTF-8 bytes.")
  }
  return id
}

private func requireBudgetInteger(_ budget: JSONObject, _ key: String, _ range: ClosedRange<Int>) throws -> Int {
  guard let number = budget[key] as? NSNumber, !isBoolean(number) else {
    try fail(ErrorCode.invalidParams, "The observe budget requires an integer \"\(key)\".")
  }
  let value = number.doubleValue
  guard value == value.rounded(), value >= Double(range.lowerBound), value <= Double(range.upperBound) else {
    try fail(
      ErrorCode.invalidParams,
      "The observe budget \"\(key)\" must be an integer from \(range.lowerBound) to \(range.upperBound)."
    )
  }
  return Int(value)
}

// MARK: Result model

enum ObserveChildrenState: String {
  case none
  case complete
  case truncated
  case unknown
}

enum ObserveTruncationReason: String {
  case visited
  case depth
  case bytes
  case deadline
  case references
  case unreadable
}

struct ObserveTruncation {
  let reason: ObserveTruncationReason
  var limit: Int?
  var unvisited: Int?

  func json() -> JSONObject {
    var result: JSONObject = ["reason": reason.rawValue]
    if let limit {
      result["limit"] = limit
    }
    if let unvisited {
      result["unvisited"] = unvisited
    }
    return result
  }
}

struct SupportedText {
  let value: String?
  let reason: String

  static func supported(_ value: String) -> SupportedText {
    SupportedText(value: value, reason: "")
  }

  static func unsupported(_ reason: String) -> SupportedText {
    SupportedText(value: nil, reason: reason)
  }

  func json() -> JSONObject {
    if let value {
      return ["supported": true, "value": value]
    }
    return ["supported": false, "reason": reason]
  }
}

/// What a provider read about one element. A fact the observation did not request stays nil, and the sampler drops
/// anything the request did not name, so a source cannot leak data the caller never asked for.
struct ObservedFacts {
  var role: String
  var name: String?
  var automationID: String?
  /// A password or secure field: `value` and `text` are never reported.
  var secure = false
  var actions: [String]?
  var checked: CheckedValue?
  var enabled: SupportedBool?
  var expanded: SupportedBool?
  var focused: SupportedBool?
  var geometry: CGRect?
  var help: SupportedText?
  var required: SupportedBool?
  var selected: SupportedBool?
  var text: String?
  var value: String?
  var visible: SupportedBool?
}

struct ObservedNode {
  var id: String
  var parentID: String?
  var depth: Int
  var scope: ElementScope
  var childrenState: ObserveChildrenState
  var childCount: Int?
  var facts: ObservedFacts
  var clipped: [String]

  func json() -> JSONObject {
    var result: JSONObject = [
      "childrenState": childrenState.rawValue,
      "depth": depth,
      "id": id,
      "role": facts.role,
      "scope": scope.rawValue,
    ]
    if let parentID {
      result["parentId"] = parentID
    }
    if let childCount {
      result["childCount"] = childCount
    }
    if let name = facts.name {
      result["name"] = name
    }
    if let automationID = facts.automationID {
      result["automationId"] = automationID
    }
    if let actions = facts.actions {
      result["actions"] = actions
    }
    if let checked = facts.checked {
      result["checked"] = checked.json()
    }
    if let enabled = facts.enabled {
      result["enabled"] = enabled.json()
    }
    if let expanded = facts.expanded {
      result["expanded"] = expanded.json()
    }
    if let focused = facts.focused {
      result["focused"] = focused.json()
    }
    if let geometry = facts.geometry {
      result["rect"] = rectJSON(geometry)
    }
    if let help = facts.help {
      result["helpText"] = help.json()
    }
    if let required = facts.required {
      result["required"] = required.json()
    }
    if let selected = facts.selected {
      result["selected"] = selected.json()
    }
    if let text = facts.text {
      result["text"] = text
    }
    if let value = facts.value {
      result["value"] = value
    }
    if let visible = facts.visible {
      result["visible"] = visible.json()
    }
    if !clipped.isEmpty {
      result["clipped"] = clipped
    }
    return result
  }
}

struct ObservedSample {
  var nodes: [ObservedNode]
  var truncation: [ObserveTruncation]
  var unsupportedFacts: [ObserveFact]
  var elapsedMs: Int

  var complete: Bool { truncation.isEmpty }

  func json() -> JSONObject {
    [
      "complete": complete,
      "elapsedMs": elapsedMs,
      "nodes": nodes.map { $0.json() },
      "truncation": truncation.map { $0.json() },
      "unsupportedFacts": unsupportedFacts.map { $0.rawValue },
    ]
  }
}

// MARK: Strings

/// Cuts a string to at most `limit` UTF-16 code units without separating a surrogate pair, so a clipped string can be
/// one unit shorter than the limit and every emitted string stays encodable.
func clipToUTF16Limit(_ value: String, limit: Int) -> (text: String, clipped: Bool) {
  guard value.utf16.count > limit else {
    return (value, false)
  }
  let scalars = value.unicodeScalars
  var end = scalars.startIndex
  var units = 0
  for index in scalars.indices {
    let width = scalars[index].value > 0xFFFF ? 2 : 1
    if units + width > limit {
      break
    }
    units += width
    end = scalars.index(after: index)
  }
  return (String(scalars[..<end]), true)
}

/// Keeps only the facts the request named, clips strings to the budget, and withholds secrets.
func shapeObservedFacts(
  _ read: ObservedFacts,
  requested: Set<ObserveFact>,
  limit: Int
) -> (facts: ObservedFacts, clipped: [String]) {
  var shaped = ObservedFacts(role: read.role)
  var clipped: [String] = []
  func clip(_ field: String, _ value: String) -> String {
    let result = clipToUTF16Limit(value, limit: limit)
    if result.clipped {
      clipped.append(field)
    }
    return result.text
  }

  if let name = read.name, !name.isEmpty {
    shaped.name = clip("name", name)
  }
  if let automationID = read.automationID, !automationID.isEmpty {
    shaped.automationID = clip("automationId", automationID)
  }
  if requested.contains(.actions) {
    shaped.actions = (read.actions ?? []).map { clipToUTF16Limit($0, limit: limit).text }
  }
  if requested.contains(.checked) {
    shaped.checked = read.checked
  }
  if requested.contains(.enabled) {
    shaped.enabled = read.enabled
  }
  if requested.contains(.expanded) {
    shaped.expanded = read.expanded
  }
  if requested.contains(.focused) {
    shaped.focused = read.focused
  }
  if requested.contains(.geometry) {
    shaped.geometry = read.geometry
  }
  if requested.contains(.help), let help = read.help {
    if let text = help.value {
      shaped.help = .supported(clip("helpText", text))
    } else {
      shaped.help = help
    }
  }
  if requested.contains(.required) {
    shaped.required = read.required
  }
  if requested.contains(.selected) {
    shaped.selected = read.selected
  }
  if requested.contains(.visible) {
    shaped.visible = read.visible
  }
  if !read.secure {
    if requested.contains(.value), let value = read.value {
      shaped.value = clip("value", value)
    }
    if requested.contains(.text), let text = read.text {
      shaped.text = clip("text", text)
    }
  }
  return (shaped, clipped)
}

// MARK: Sampler

/// Ends a walk because the deadline passed before a provider call; the sampler records `deadline` and stops.
struct ObservationDeadlineReached: Error {}

struct ObservedElement<Handle> {
  var facts: ObservedFacts
  /// The children in provider order, or nil when the provider could not read them.
  var children: [Handle]?
}

protocol ObservationSource {
  associatedtype Handle: Hashable

  /// Facts the platform cannot report for any element; the sampler lists them once and omits them from every node.
  var unsupportedFacts: Set<ObserveFact> { get }

  /// Reads one element and its children. An element that vanished throws `stale-element`. `checkpoint` runs before
  /// every provider call, so a walk never starts a call past its deadline or after cancellation.
  func read(_ handle: Handle, checkpoint: () throws -> Void) throws -> ObservedElement<Handle>

  /// The scope of an element and of its children, given the scope its parent assigned.
  func scopes(inheriting scope: ElementScope, automationID: String?) -> (own: ElementScope, children: ElementScope)

  /// The id the host issues for an element, or nil when its element table cannot take another record.
  func identify(_ handle: Handle, parentID: String?, scope: ElementScope) -> String?
}

func observationClockMilliseconds() -> Int {
  Int(DispatchTime.now().uptimeNanoseconds / 1_000_000)
}

// The size of an id is not known until the record exists, so nodes are measured with an id of typical length.
private let sizingIdentifier = String(repeating: "x", count: 24)

private struct ObservationEntry<Handle> {
  let handle: Handle
  let parentID: String?
  let scope: ElementScope
  let depth: Int
}

/// Walks breadth first from `root` and returns one bounded sample. The root is always read, whatever the budgets;
/// every other node must fit them. A node is emitted only after its record exists, so every id in a sample can be
/// used by element commands.
func sampleObservation<Source: ObservationSource>(
  root: Source.Handle,
  rootParentID: String?,
  rootScope: ElementScope,
  request: ObserveRequest,
  source: Source,
  token: CancellationToken,
  now: @escaping () -> Int = observationClockMilliseconds
) throws -> ObservedSample {
  typealias Entry = ObservationEntry<Source.Handle>

  let budget = request.budget
  let started = now()
  let requested = Set(request.facts).subtracting(source.unsupportedFacts)
  let cancellationOnly: () throws -> Void = { try token.throwIfCancelled() }
  let withDeadline: () throws -> Void = {
    try token.throwIfCancelled()
    if now() - started >= budget.deadlineMs {
      throw ObservationDeadlineReached()
    }
  }

  var queue = [Entry(handle: root, parentID: rootParentID, scope: rootScope, depth: 0)]
  var head = 0
  var seen: Set<Source.Handle> = [root]
  var nodes: [ObservedNode] = []
  var bytes = 0
  var truncation: [ObserveTruncation] = []
  var childTotals: [String: Int] = [:]
  var depthUnvisited = 0
  var cappedUnvisited = 0
  var unreadable = false

  func stop(_ reason: ObserveTruncationReason, limit: Int? = nil, unvisited: Int? = nil) {
    if let index = truncation.firstIndex(where: { $0.reason == reason }) {
      if let unvisited {
        truncation[index].unvisited = (truncation[index].unvisited ?? 0) + unvisited
      }
      return
    }
    truncation.append(ObserveTruncation(reason: reason, limit: limit, unvisited: unvisited))
  }

  while head < queue.count {
    try token.throwIfCancelled()
    let entry = queue[head]
    let isRoot = head == 0
    let pending = queue.count - head

    if !isRoot, nodes.count >= budget.maxVisited {
      stop(.visited, limit: budget.maxVisited, unvisited: pending)
      break
    }
    if !isRoot, now() - started >= budget.deadlineMs {
      stop(.deadline, limit: budget.deadlineMs, unvisited: pending)
      break
    }

    let element: ObservedElement<Source.Handle>
    do {
      element = try source.read(entry.handle, checkpoint: isRoot ? cancellationOnly : withDeadline)
    } catch is ObservationDeadlineReached {
      stop(.deadline, limit: budget.deadlineMs, unvisited: pending)
      break
    } catch let error as HelperError where !isRoot && error.code == ErrorCode.staleElement {
      // The element disappeared during the walk, so its parent no longer has it as a child.
      if let parentID = entry.parentID, let total = childTotals[parentID] {
        childTotals[parentID] = total - 1
      }
      head += 1
      continue
    } catch let error as HelperError where !isRoot && error.code == ErrorCode.automationFailed {
      unreadable = true
      head += 1
      continue
    }

    let scopes = source.scopes(inheriting: entry.scope, automationID: element.facts.automationID)
    let shaped = shapeObservedFacts(element.facts, requested: requested, limit: budget.maxStringLength)

    // Children already reached through an earlier parent, or listed twice, belong to the first parent that reached
    // them; they are neither counted nor emitted again.
    var fresh: [Source.Handle] = []
    var state = ObserveChildrenState.unknown
    var childCount: Int?
    var enqueue = 0
    var depthCut = 0
    if let provided = element.children {
      var listed = Set<Source.Handle>()
      for child in provided where !seen.contains(child) {
        if listed.insert(child).inserted {
          fresh.append(child)
        }
      }
      childCount = fresh.count
      if fresh.isEmpty {
        state = .none
      } else if entry.depth >= budget.maxDepth {
        state = .truncated
        depthCut = fresh.count
      } else {
        // Never queue more than the visited budget can still emit; the rest is counted as unvisited.
        let room = budget.maxVisited - (nodes.count + 1) - (queue.count - head - 1)
        enqueue = min(fresh.count, max(0, room))
        state = .truncated
      }
    }

    var node = ObservedNode(
      id: sizingIdentifier,
      parentID: isRoot ? nil : entry.parentID,
      depth: entry.depth,
      scope: scopes.own,
      // The longest state the node can settle into, so the measured size is an upper bound.
      childrenState: .truncated,
      childCount: childCount,
      facts: shaped.facts,
      clipped: shaped.clipped
    )
    let size = try serializeJSON(node.json()).count
    if !isRoot, bytes + size > budget.maxBytes {
      stop(.bytes, limit: budget.maxBytes, unvisited: pending)
      break
    }
    guard let id = source.identify(entry.handle, parentID: entry.parentID, scope: scopes.own) else {
      stop(.references, unvisited: pending)
      break
    }

    node.id = id
    node.childrenState = state
    bytes += size
    nodes.append(node)
    head += 1

    if element.children == nil {
      unreadable = true
    }
    depthUnvisited += depthCut
    if depthCut == 0, !fresh.isEmpty {
      childTotals[id] = fresh.count
      cappedUnvisited += fresh.count - enqueue
    }
    for child in fresh.prefix(enqueue) {
      seen.insert(child)
      queue.append(Entry(handle: child, parentID: id, scope: scopes.children, depth: entry.depth + 1))
    }
  }

  if depthUnvisited > 0 {
    stop(.depth, limit: budget.maxDepth, unvisited: depthUnvisited)
  }
  if cappedUnvisited > 0 {
    stop(.visited, limit: budget.maxVisited, unvisited: cappedUnvisited)
  }
  if unreadable {
    stop(.unreadable)
  }

  // A node whose children were queued is complete only when every one of them was emitted.
  var emitted: [String: Int] = [:]
  for node in nodes {
    if let parentID = node.parentID {
      emitted[parentID, default: 0] += 1
    }
  }
  for index in nodes.indices {
    guard let total = childTotals[nodes[index].id] else {
      continue
    }
    nodes[index].childCount = total
    if total == 0 {
      nodes[index].childrenState = .none
    } else {
      nodes[index].childrenState = emitted[nodes[index].id, default: 0] == total ? .complete : .truncated
    }
  }

  return ObservedSample(
    nodes: nodes,
    truncation: truncation,
    unsupportedFacts: request.facts.filter { source.unsupportedFacts.contains($0) },
    elapsedMs: max(0, now() - started)
  )
}
