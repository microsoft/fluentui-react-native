import ApplicationServices
import Foundation

// The Accessibility side of bounded observation (see Observation.swift for the sampler and the contract).
//
// A node costs one `AXUIElementCopyMultipleAttributeValues` request to the target instead of a request per attribute,
// plus a request for its actions when those are asked for. Facts nobody asked for are never read.

/// An Accessibility element as a set member: two references to one underlying element are equal.
struct AXElementKey: Hashable {
  let element: AXUIElement

  static func == (left: AXElementKey, right: AXElementKey) -> Bool {
    sameAXElement(left.element, right.element)
  }

  func hash(into hasher: inout Hasher) {
    hasher.combine(CFHash(element))
  }
}

/// One slot of a multiple-attribute reply: the value, or the error that attribute reported.
private enum AXSlot {
  case value(AnyObject)
  case error(AXError)
}

private struct AXAttributeSlots {
  private var slots: [String: AXSlot] = [:]

  init(element: AXUIElement, names: [String]) throws {
    var values: CFArray?
    // Without the stop-on-error option, an attribute that cannot be read yields an error value in its own slot.
    let error = AXUIElementCopyMultipleAttributeValues(
      element,
      names as CFArray,
      AXCopyMultipleAttributeOptions(rawValue: 0),
      &values
    )
    try throwAX(error, operation: "Reading element attributes")
    guard let values, CFArrayGetCount(values) == names.count else {
      try fail(ErrorCode.automationFailed, "Reading element attributes returned an unexpected result.")
    }
    for (index, name) in names.enumerated() {
      guard let pointer = CFArrayGetValueAtIndex(values, index) else {
        continue
      }
      let object = Unmanaged<AnyObject>.fromOpaque(pointer).takeUnretainedValue()
      let typeID = CFGetTypeID(object)
      if typeID == AXValueGetTypeID(), AXValueGetType(object as! AXValue) == .axError {
        var code = AXError.success
        AXValueGetValue(object as! AXValue, .axError, &code)
        slots[name] = .error(code)
      } else if typeID == CFNullGetTypeID() {
        slots[name] = .error(.noValue)
      } else {
        slots[name] = .value(object)
      }
    }
  }

  /// The value of an attribute, or nil when the element does not have one. As for single reads, an element that does
  /// not publish an attribute, publishes it without a value, or loses it during a React remount has no value; any
  /// other error fails the read.
  func optional(_ name: String) throws -> AnyObject? {
    switch slots[name] {
    case let .value(value)?:
      return value
    case let .error(error)?:
      if error == .attributeUnsupported || error == .noValue || error == .failure || error == .illegalArgument {
        return nil
      }
      try throwAX(error, operation: "Reading \(name)")
      return nil
    case nil:
      return nil
    }
  }

  func error(_ name: String) -> AXError? {
    if case let .error(error)? = slots[name] {
      return error
    }
    return nil
  }

  func requiredRole(elementDescription: String) throws -> String {
    switch slots[kAXRoleAttribute] {
    case let .value(value)?:
      return axString(value) ?? "AXUnknown"
    case let .error(error)?:
      if error == .invalidUIElement || error == .illegalArgument {
        try fail(ErrorCode.staleElement, "\(elementDescription) is no longer available.")
      }
      try throwAX(error, operation: "Reading \(kAXRoleAttribute)")
      return "AXUnknown"
    case nil:
      return "AXUnknown"
    }
  }

  /// The element's children in provider order. An element that has no children attribute is a leaf; one whose children
  /// cannot be read is not, and the caller reports it as unread rather than empty.
  func children() throws -> [AXUIElement]? {
    switch slots[kAXChildrenAttribute] {
    case let .value(value)?:
      return strictAXElements(value)
    case let .error(error)?:
      switch error {
      case .attributeUnsupported, .noValue:
        return []
      case .invalidUIElement, .apiDisabled:
        try throwAX(error, operation: "Reading \(kAXChildrenAttribute)")
        return nil
      default:
        return nil
      }
    case nil:
      return []
    }
  }
}

struct AXObservationSource: ObservationSource {
  typealias Handle = AXElementKey

  /// Accessibility can answer every fact per element, so none is unsupported across the board.
  let unsupportedFacts: Set<ObserveFact> = []

  private let engine: AccessibilityEngine
  private let window: WindowRecord
  private let lease: ApplicationLeaseRecord
  private let requested: Set<ObserveFact>
  private let windowFrame: CGRect
  private let attributeNames: [String]

  init(
    engine: AccessibilityEngine,
    window: WindowRecord,
    lease: ApplicationLeaseRecord,
    facts: [ObserveFact]
  ) throws {
    let requested = Set(facts)
    self.engine = engine
    self.window = window
    self.lease = lease
    self.requested = requested
    // Geometry is window relative, so the frame is read once for the walk and only when something needs it.
    windowFrame = requested.contains(.geometry) ? try window.currentFrame() : .zero

    var names = [
      kAXRoleAttribute,
      kAXSubroleAttribute,
      kAXIdentifierAttribute,
      kAXTitleAttribute,
      kAXDescriptionAttribute,
      kAXHelpAttribute,
      kAXChildrenAttribute,
    ]
    if !requested.isDisjoint(with: [.value, .text, .checked]) {
      names.append(kAXValueAttribute)
    }
    if requested.contains(.enabled) {
      names.append(kAXEnabledAttribute)
    }
    if requested.contains(.focused) {
      names.append(kAXFocusedAttribute)
    }
    if requested.contains(.expanded) {
      names.append(kAXExpandedAttribute)
    }
    if requested.contains(.selected) {
      names.append(kAXSelectedAttribute)
    }
    if requested.contains(.required) {
      names.append("AXRequired")
    }
    if requested.contains(.visible) {
      names.append("AXHidden")
    }
    if !requested.isDisjoint(with: [.visible, .geometry]) {
      names.append(kAXPositionAttribute)
      names.append(kAXSizeAttribute)
    }
    attributeNames = names
  }

  func read(_ handle: AXElementKey, checkpoint: () throws -> Void) throws -> ObservedElement<AXElementKey> {
    let element = handle.element
    try checkpoint()
    let slots = try AXAttributeSlots(element: element, names: attributeNames)

    let nativeRole = try slots.requiredRole(elementDescription: "The element")
    let subrole = axString(try slots.optional(kAXSubroleAttribute))
    let automationID = axString(try slots.optional(kAXIdentifierAttribute))
    let title = axString(try slots.optional(kAXTitleAttribute))
    let description = axString(try slots.optional(kAXDescriptionAttribute))
    let helpString = axString(try slots.optional(kAXHelpAttribute))
    let name = [title, description, helpString].compactMap { $0 }.first { !$0.isEmpty }

    var valueObject = try slots.optional(kAXValueAttribute)
    if nativeRole == "AXUnknown", valueObject == nil, requested.isDisjoint(with: [.value, .text, .checked]) {
      // The role of an unclassified element is inferred from its value, which is otherwise not worth reading.
      try checkpoint()
      valueObject = try copyOptionalAXAttribute(element, kAXValueAttribute)
    }
    let value = engine.stringValue(valueObject)
    let role = try engine.normalizeRole(nativeRole, subrole: subrole, value: value, element: element)

    var facts = ObservedFacts(role: role)
    facts.name = name
    facts.automationID = automationID
    facts.secure = subrole == kAXSecureTextFieldSubrole

    if requested.contains(.value) {
      facts.value = value
    }
    if requested.contains(.text) {
      if role == "text" {
        facts.text = value ?? name
      } else if role == "textbox" || role == "document" {
        facts.text = value
      }
    }
    if requested.contains(.checked) {
      facts.checked = engine.checkedValue(role: role, value: valueObject)
    }
    if requested.contains(.enabled) {
      facts.enabled = try enabledState(element, slots, checkpoint: checkpoint)
    }
    if requested.contains(.focused) {
      facts.focused = try supportedBool(slots, kAXFocusedAttribute, reason: "The provider does not report keyboard focus.")
    }
    if requested.contains(.expanded) {
      facts.expanded = try supportedBool(slots, kAXExpandedAttribute, reason: "The element does not expose expanded state.")
    }
    if requested.contains(.selected) {
      facts.selected = try supportedBool(slots, kAXSelectedAttribute, reason: "The element does not expose selected state.")
    }
    if requested.contains(.required) {
      facts.required = try supportedBool(slots, "AXRequired", reason: "The element does not expose required state.")
    }
    if requested.contains(.help) {
      if let helpString, !helpString.isEmpty {
        facts.help = .supported(helpString)
      } else {
        facts.help = .unsupported("The element has no help text.")
      }
    }
    if !requested.isDisjoint(with: [.visible, .geometry]) {
      var screenRect = CGRect.zero
      if let position = axPoint(try slots.optional(kAXPositionAttribute)),
        let size = axSize(try slots.optional(kAXSizeAttribute))
      {
        screenRect = CGRect(origin: position, size: size)
      }
      if requested.contains(.visible) {
        let hidden = axNumber(try slots.optional("AXHidden"))?.boolValue
        facts.visible = .supported(hidden != true && screenRect.width > 0 && screenRect.height > 0)
      }
      if requested.contains(.geometry) {
        facts.geometry = CGRect(
          x: screenRect.minX - windowFrame.minX,
          y: screenRect.minY - windowFrame.minY,
          width: screenRect.width,
          height: screenRect.height
        )
      }
    }
    if requested.contains(.actions) {
      try checkpoint()
      facts.actions = try copyPublishedAXActionNames(element).map(accessibilityActionName)
    }

    return ObservedElement(facts: facts, children: try slots.children()?.map(AXElementKey.init(element:)))
  }

  /// Mirrors how `tree` assigns scopes, including the preview region that starts at the story root.
  func scopes(inheriting scope: ElementScope, automationID: String?) -> (own: ElementScope, children: ElementScope) {
    if
      window.primary,
      scope != .preview,
      let storyRootTestId = lease.storyRootTestId,
      automationID == storyRootTestId
    {
      return (.preview, .preview)
    }
    if window.primary, scope == .application {
      return (scope, .chrome)
    }
    return (scope, scope)
  }

  func identify(_ handle: AXElementKey, parentID: String?, scope: ElementScope) -> String? {
    engine.registerIfRoom(
      handle.element,
      processID: window.processID,
      windowID: window.id,
      parentID: parentID,
      scope: scope
    )?.id
  }

  private func supportedBool(_ slots: AXAttributeSlots, _ attribute: String, reason: String) throws -> SupportedBool {
    guard let number = axNumber(try slots.optional(attribute)) else {
      return .unsupported(reason)
    }
    return .supported(number.boolValue)
  }

  // AppKit omits AXEnabled from elements that have no disabled state, and assistive technologies treat them as
  // enabled; `AccessibilityEngine.enabledState` documents the same rule for snapshots. A slot that says the attribute is
  // unsupported already proves it is not advertised, so only the other unreadable cases consult the attribute list.
  private func enabledState(
    _ element: AXUIElement,
    _ slots: AXAttributeSlots,
    checkpoint: () throws -> Void
  ) throws -> SupportedBool {
    if let number = axNumber(try slots.optional(kAXEnabledAttribute)) {
      return .supported(number.boolValue)
    }
    if slots.error(kAXEnabledAttribute) == .attributeUnsupported {
      return .supported(true)
    }
    try checkpoint()
    var names: CFArray?
    if AXUIElementCopyAttributeNames(element, &names) == .success,
      let names = names as? [String],
      !names.isEmpty,
      !names.contains(kAXEnabledAttribute)
    {
      return .supported(true)
    }
    return .unsupported("The provider does not report an enabled state.")
  }
}

extension AccessibilityEngine {
  /// Returns one bounded, breadth-first sample of a window's tree, or of the subtree under a tracked element.
  func observe(
    _ request: ObserveRequest,
    window: WindowRecord,
    lease: ApplicationLeaseRecord,
    token: CancellationToken
  ) throws -> ObservedSample {
    try requireAccessibility("Accessibility tree observation")
    try token.throwIfCancelled()

    let root: AXUIElement
    let rootParentID: String?
    let rootScope: ElementScope
    if let rootID = request.rootID {
      let record = try requireRecord(rootID)
      guard record.windowID == window.id, record.processID == window.processID else {
        try fail(ErrorCode.staleElement, "Element \"\(rootID)\" no longer belongs to its tracked window.")
      }
      try validateLive(record)
      root = record.element
      rootParentID = record.parentID
      rootScope = record.scope
    } else {
      root = window.element
      rootParentID = nil
      rootScope = window.primary ? .application : .secondaryWindow
    }

    let source = try AXObservationSource(engine: self, window: window, lease: lease, facts: request.facts)
    return try sampleObservation(
      root: AXElementKey(element: root),
      rootParentID: rootParentID,
      rootScope: rootScope,
      request: request,
      source: source,
      token: token
    )
  }
}
