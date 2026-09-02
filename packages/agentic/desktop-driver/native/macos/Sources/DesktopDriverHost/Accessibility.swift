import ApplicationServices
import Foundation

enum ElementScope: String {
  case application
  case chrome
  case preview
  case secondaryWindow = "secondary-window"
}

struct SupportedBool {
  let value: Bool?
  let reason: String

  static func supported(_ value: Bool) -> SupportedBool {
    SupportedBool(value: value, reason: "")
  }

  static func unsupported(_ reason: String) -> SupportedBool {
    SupportedBool(value: nil, reason: reason)
  }

  func json() -> JSONObject {
    if let value {
      return ["supported": true, "value": value]
    }
    return ["supported": false, "reason": reason]
  }
}

enum CheckedValue {
  case bool(Bool)
  case mixed
  case unsupported(String)

  func json() -> JSONObject {
    switch self {
    case let .bool(value):
      return ["supported": true, "value": value]
    case .mixed:
      return ["supported": true, "value": "mixed"]
    case let .unsupported(reason):
      return ["supported": false, "reason": reason]
    }
  }
}

struct ElementSnapshot {
  let id: String
  let automationID: String?
  let checked: CheckedValue
  let enabled: SupportedBool
  let expanded: SupportedBool
  let focused: SupportedBool
  let name: String?
  let parentID: String?
  let rect: CGRect
  let screenRect: CGRect
  let role: String
  let scope: ElementScope
  let selected: SupportedBool
  let text: String?
  let value: String?
  let visible: SupportedBool
  let windowID: String

  func json() -> JSONObject {
    var result: JSONObject = [
      "id": id,
      "checked": checked.json(),
      "enabled": enabled.json(),
      "expanded": expanded.json(),
      "focused": focused.json(),
      "rect": rectJSON(rect),
      "role": role,
      "scope": scope.rawValue,
      "selected": selected.json(),
      "visible": visible.json(),
      "windowId": windowID,
    ]
    if let automationID, !automationID.isEmpty {
      result["automationId"] = automationID
    }
    if let name, !name.isEmpty {
      result["name"] = name
    }
    if let parentID, !parentID.isEmpty {
      result["parentId"] = parentID
    }
    if let text {
      result["text"] = text
    }
    if let value {
      result["value"] = value
    }
    return result
  }
}

final class ElementRecord {
  let id: String
  let processID: pid_t
  var element: AXUIElement
  var windowID: String
  var parentID: String?
  var scope: ElementScope

  init(
    processID: pid_t,
    element: AXUIElement,
    windowID: String,
    parentID: String?,
    scope: ElementScope
  ) {
    id = IdentifierGenerator.shared.next("element")
    self.processID = processID
    self.element = element
    self.windowID = windowID
    self.parentID = parentID
    self.scope = scope
  }
}

final class AccessibilityEngine {
  private static let maximumTreeNodes = 5_000
  private static let maximumElementRecords = 10_000
  private static let maximumAncestorDepth = 64

  private var records: [String: ElementRecord] = [:]
  private var recordIDsByHash: [CFHashCode: [String]] = [:]

  func tree(
    window: WindowRecord,
    lease: ApplicationLeaseRecord,
    token: CancellationToken
  ) throws -> [ElementSnapshot] {
    try requireAccessibility("Accessibility tree traversal")
    let rootScope: ElementScope = window.primary ? .application : .secondaryWindow
    return try walk(
      root: window.element,
      window: window,
      lease: lease,
      parentID: nil,
      rootScope: rootScope,
      token: token
    )
  }

  func find(
    window: WindowRecord,
    lease: ApplicationLeaseRecord,
    rootElementID: String?,
    selector: JSONObject,
    token: CancellationToken
  ) throws -> [ElementSnapshot] {
    let strategy = try requireString(selector, "strategy")
    let value = selector["value"] as? String ?? ""
    let root: AXUIElement
    let parentID: String?
    let rootScope: ElementScope
    var excludedID: String?
    if let rootElementID, !rootElementID.isEmpty {
      let record = try requireRecord(rootElementID)
      guard record.windowID == window.id else {
        try fail(ErrorCode.staleElement, "The search root does not belong to the requested window.")
      }
      _ = try snapshot(elementID: rootElementID, window: window, token: token)
      root = record.element
      parentID = record.parentID
      rootScope = record.scope
      excludedID = record.id
    } else {
      root = window.element
      parentID = nil
      rootScope = window.primary ? .application : .secondaryWindow
    }
    let snapshots = try walk(
      root: root,
      window: window,
      lease: lease,
      parentID: parentID,
      rootScope: rootScope,
      token: token
    )
    return try snapshots.filter { snapshot in
      if snapshot.id == excludedID {
        return false
      }
      return try matches(snapshot: snapshot, strategy: strategy, value: value)
    }
  }

  func snapshot(
    elementID: String,
    window: WindowRecord,
    token: CancellationToken
  ) throws -> ElementSnapshot {
    try requireAccessibility("Refreshing an accessibility element")
    try token.throwIfCancelled()
    let record = try requireRecord(elementID)
    guard record.windowID == window.id, record.processID == window.processID else {
      try fail(ErrorCode.staleElement, "Element \"\(elementID)\" no longer belongs to its tracked window.")
    }
    try validateLive(record)
    return try readSnapshot(record: record, window: window)
  }

  func activeElement(
    window: WindowRecord,
    token: CancellationToken
  ) throws -> ElementSnapshot? {
    try requireAccessibility("Reading the focused accessibility element")
    try token.throwIfCancelled()
    let application = AXUIElementCreateApplication(window.processID)
    guard let focused = try copyAXAttribute(application, kAXFocusedUIElementAttribute) else {
      return nil
    }
    guard let element = axElement(focused) else {
      return nil
    }
    guard try belongsToWindow(element, window: window.element, token: token) else {
      return nil
    }
    let scope = scopeForKnownElement(element)
      ?? (window.primary ? .chrome : .secondaryWindow)
    let record = try register(
      element,
      processID: window.processID,
      windowID: window.id,
      parentID: parentIDForKnownElement(element),
      scope: scope
    )
    return try readSnapshot(record: record, window: window)
  }

  func hitTest(
    window: WindowRecord,
    x: CGFloat,
    y: CGFloat,
    token: CancellationToken
  ) throws -> ElementSnapshot? {
    let windowFrame = try window.currentFrame()
    let point = CGPoint(x: windowFrame.minX + x, y: windowFrame.minY + y)
    guard let hit = try hitElement(at: point) else {
      return nil
    }
    var pid: pid_t = 0
    if AXUIElementGetPid(hit, &pid) != .success || pid != window.processID {
      return externalWindowSnapshot(window: window, hit: hit)
    }
    guard try belongsToWindow(hit, window: window.element, token: token) else {
      return externalWindowSnapshot(window: window, hit: hit)
    }
    let resolved = try resolveKnownAncestor(hit, token: token)
    let element = resolved?.element ?? hit
    let record = try register(
      element,
      processID: window.processID,
      windowID: window.id,
      parentID: resolved?.parentID,
      scope: resolved?.scope ?? (window.primary ? .chrome : .secondaryWindow)
    )
    return try readSnapshot(record: record, window: window)
  }

  func elementOwnsPoint(
    elementID: String,
    point: CGPoint,
    token: CancellationToken
  ) throws -> Bool {
    let target = try requireRecord(elementID)
    guard let hit = try hitElement(at: point) else {
      return false
    }
    var cursor: AXUIElement? = hit
    for _ in 0..<Self.maximumAncestorDepth {
      try token.throwIfCancelled()
      guard let current = cursor else {
        break
      }
      if sameAXElement(current, target.element) {
        return true
      }
      cursor = try parent(of: current)
    }
    return false
  }

  func setFocus(_ elementID: String) throws {
    let record = try requireRecord(elementID)
    try validateLive(record)
    var settable: DarwinBoolean = false
    let settableError = AXUIElementIsAttributeSettable(record.element, kAXFocusedAttribute as CFString, &settable)
    try throwAX(settableError, operation: "Checking element focusability")
    guard settable.boolValue else {
      try fail(ErrorCode.notInteractable, "The element does not expose writable keyboard focus.")
    }
    let error = AXUIElementSetAttributeValue(record.element, kAXFocusedAttribute as CFString, kCFBooleanTrue)
    if error == .invalidUIElement {
      try fail(ErrorCode.staleElement, "Element \"\(elementID)\" is no longer available.")
    }
    guard error == .success else {
      try fail(ErrorCode.notInteractable, "Focusing the element failed because \(describeAXError(error)).")
    }
  }

  func hasFocus(_ elementID: String) throws -> Bool {
    let record = try requireRecord(elementID)
    try validateLive(record)
    return axNumber(try copyOptionalAXAttribute(record.element, kAXFocusedAttribute))?.boolValue ?? false
  }

  func accessibilityClick(_ elementID: String, token: CancellationToken) throws {
    try requireAccessibility("Accessibility click")
    try token.throwIfCancelled()
    let record = try requireRecord(elementID)
    try validateLive(record)
    let actions = try copyAXActionNames(record.element)
    let candidates = [kAXPressAction, kAXConfirmAction, kAXPickAction]
    guard let action = candidates.first(where: { actions.contains($0) }) else {
      try fail(
        ErrorCode.unsupported,
        "The element does not expose an AXPress, AXConfirm, or AXPick action, so accessibility click is unavailable."
      )
    }
    let error = AXUIElementPerformAction(record.element, action as CFString)
    if error == .invalidUIElement {
      try fail(ErrorCode.staleElement, "Element \"\(elementID)\" is no longer available.")
    }
    guard error == .success else {
      try fail(ErrorCode.automationFailed, "Performing \(action) failed because \(describeAXError(error)).")
    }
  }

  func tryClearValue(_ elementID: String) throws -> Bool {
    let record = try requireRecord(elementID)
    try validateLive(record)
    var settable: DarwinBoolean = false
    let settableError = AXUIElementIsAttributeSettable(record.element, kAXValueAttribute as CFString, &settable)
    if settableError == .attributeUnsupported || settableError == .noValue || !settable.boolValue {
      return false
    }
    if settableError == .invalidUIElement {
      try fail(ErrorCode.staleElement, "Element \"\(elementID)\" is no longer available.")
    }
    guard settableError == .success else {
      return false
    }
    let error = AXUIElementSetAttributeValue(record.element, kAXValueAttribute as CFString, "" as CFString)
    if error == .invalidUIElement {
      try fail(ErrorCode.staleElement, "Element \"\(elementID)\" is no longer available.")
    }
    return error == .success
  }

  func requireRecord(_ elementID: String) throws -> ElementRecord {
    guard let record = records[elementID] else {
      try fail(ErrorCode.staleElement, "Element \"\(elementID)\" is no longer tracked by the native helper.")
    }
    return record
  }

  func forgetWindow(_ windowID: String) {
    let removed = records.values.filter { $0.windowID == windowID }
    for record in removed {
      records.removeValue(forKey: record.id)
      let hash = CFHash(record.element)
      recordIDsByHash[hash]?.removeAll { $0 == record.id }
      if recordIDsByHash[hash]?.isEmpty == true {
        recordIDsByHash.removeValue(forKey: hash)
      }
    }
  }

  func reset() {
    records.removeAll()
    recordIDsByHash.removeAll()
  }

  func source(_ snapshots: [ElementSnapshot]) -> String {
    var children: [String: [ElementSnapshot]] = [:]
    var roots: [ElementSnapshot] = []
    for snapshot in snapshots {
      if let parentID = snapshot.parentID {
        children[parentID, default: []].append(snapshot)
      } else {
        roots.append(snapshot)
      }
    }
    var output = "<?xml version=\"1.0\" encoding=\"UTF-8\"?><application>"
    enum Visit {
      case open(ElementSnapshot)
      case close
    }
    var stack = roots.reversed().map(Visit.open)
    while let visit = stack.popLast() {
      switch visit {
      case .close:
        output += "</element>"
      case let .open(snapshot):
        output += "<element"
        output += " automationId=\"\(escapeXML(snapshot.automationID ?? ""))\""
        output += " enabled=\"\(snapshot.enabled.value == true ? "true" : "false")\""
        output += " height=\"\(formatNumber(snapshot.rect.height))\""
        output += " name=\"\(escapeXML(snapshot.name ?? ""))\""
        output += " role=\"\(escapeXML(snapshot.role))\""
        output += " scope=\"\(snapshot.scope.rawValue)\""
        if let value = snapshot.value {
          output += " value=\"\(escapeXML(value))\""
        }
        output += " visible=\"\(snapshot.visible.value == true ? "true" : "false")\""
        output += " width=\"\(formatNumber(snapshot.rect.width))\""
        output += " x=\"\(formatNumber(snapshot.rect.minX))\""
        output += " y=\"\(formatNumber(snapshot.rect.minY))\">"
        stack.append(.close)
        for child in (children[snapshot.id] ?? []).reversed() {
          stack.append(.open(child))
        }
      }
    }
    output += "</application>"
    return output
  }

  private func walk(
    root: AXUIElement,
    window: WindowRecord,
    lease: ApplicationLeaseRecord,
    parentID: String?,
    rootScope: ElementScope,
    token: CancellationToken
  ) throws -> [ElementSnapshot] {
    struct Pending {
      let element: AXUIElement
      let parentID: String?
      let scope: ElementScope
    }
    var pending = [Pending(element: root, parentID: parentID, scope: rootScope)]
    var snapshots: [ElementSnapshot] = []
    var visitedElements: [CFHashCode: [AXUIElement]] = [:]
    var visited = 0
    while let item = pending.popLast() {
      let elementHash = CFHash(item.element)
      if visitedElements[elementHash]?.contains(where: { sameAXElement($0, item.element) }) == true {
        continue
      }
      visitedElements[elementHash, default: []].append(item.element)
      guard visited < Self.maximumTreeNodes else {
        try fail(ErrorCode.treeTooLarge, "The native accessibility tree exceeds the 5000-node limit.")
      }
      if visited % 64 == 0 {
        try token.throwIfCancelled()
      }
      visited += 1

      var scope = item.scope
      let record = try register(
        item.element,
        processID: window.processID,
        windowID: window.id,
        parentID: item.parentID,
        scope: scope
      )
      var snapshot: ElementSnapshot
      do {
        snapshot = try readSnapshot(record: record, window: window)
      } catch let error as HelperError where error.code == ErrorCode.staleElement {
        continue
      }
      var childScope = scope
      if
        window.primary,
        scope != .preview,
        let storyRootTestId = lease.storyRootTestId,
        snapshot.automationID == storyRootTestId
      {
        scope = .preview
        childScope = .preview
        record.scope = .preview
        snapshot = try readSnapshot(record: record, window: window)
      } else if window.primary, scope == .application {
        childScope = .chrome
      }

      let children = axElements(try copyOptionalAXAttribute(item.element, kAXChildrenAttribute))
      for child in children.reversed() {
        pending.append(Pending(element: child, parentID: record.id, scope: childScope))
      }
      snapshots.append(snapshot)
    }
    return snapshots
  }

  private func register(
    _ element: AXUIElement,
    processID: pid_t,
    windowID: String,
    parentID: String?,
    scope: ElementScope
  ) throws -> ElementRecord {
    let hash = CFHash(element)
    for id in recordIDsByHash[hash] ?? [] {
      if let record = records[id], sameAXElement(record.element, element) {
        record.element = element
        record.windowID = windowID
        record.parentID = parentID
        record.scope = scope
        return record
      }
    }
    guard records.count < Self.maximumElementRecords else {
      try fail(
        ErrorCode.treeTooLarge,
        "The native element table reached its 10000-record safety limit. Close the session and create a new one."
      )
    }
    let record = ElementRecord(
      processID: processID,
      element: element,
      windowID: windowID,
      parentID: parentID,
      scope: scope
    )
    records[record.id] = record
    recordIDsByHash[hash, default: []].append(record.id)
    return record
  }

  private func validateLive(_ record: ElementRecord) throws {
    var pid: pid_t = 0
    guard AXUIElementGetPid(record.element, &pid) == .success, pid == record.processID, processIsAlive(pid) else {
      try fail(ErrorCode.staleElement, "Element \"\(record.id)\" is no longer available.")
    }
    var role: CFTypeRef?
    let error = AXUIElementCopyAttributeValue(record.element, kAXRoleAttribute as CFString, &role)
    if error == .invalidUIElement || role == nil {
      try fail(ErrorCode.staleElement, "Element \"\(record.id)\" is no longer available.")
    }
    try throwAX(error, operation: "Refreshing the element", staleMessage: "Element \"\(record.id)\" is no longer available.")
  }

  private func readSnapshot(record: ElementRecord, window: WindowRecord) throws -> ElementSnapshot {
    let element = record.element
    let screenRect = try axOptionalFrame(element)
    let windowFrame = try window.currentFrame()
    let rect = CGRect(
      x: screenRect.minX - windowFrame.minX,
      y: screenRect.minY - windowFrame.minY,
      width: screenRect.width,
      height: screenRect.height
    )
    let nativeRole = axString(try copyAXAttribute(element, kAXRoleAttribute)) ?? "AXUnknown"
    let subrole = axString(try copyOptionalAXAttribute(element, kAXSubroleAttribute))
    let automationID = axString(try copyOptionalAXAttribute(element, kAXIdentifierAttribute))
    let title = axString(try copyOptionalAXAttribute(element, kAXTitleAttribute))
    let description = axString(try copyOptionalAXAttribute(element, kAXDescriptionAttribute))
    let help = axString(try copyOptionalAXAttribute(element, kAXHelpAttribute))
    let name = [title, description, help].compactMap { $0 }.first { !$0.isEmpty }
    let valueObject = try copyOptionalAXAttribute(element, kAXValueAttribute)
    let value = stringValue(valueObject)
    let role = try normalizeRole(nativeRole, subrole: subrole, value: value, element: element)
    let text: String?
    if role == "text" {
      text = value ?? name
    } else if role == "textbox" || role == "document" {
      text = value
    } else {
      text = nil
    }
    let enabled = try supportedBool(
      element,
      attribute: kAXEnabledAttribute,
      reason: "The provider does not report an enabled state."
    )
    let focused = try supportedBool(
      element,
      attribute: kAXFocusedAttribute,
      reason: "The provider does not report keyboard focus."
    )
    let expanded = try supportedBool(
      element,
      attribute: kAXExpandedAttribute,
      reason: "The element does not expose expanded state."
    )
    let selected = try supportedBool(
      element,
      attribute: kAXSelectedAttribute,
      reason: "The element does not expose selected state."
    )
    let hidden = try optionalBool(element, attribute: "AXHidden")
    let visible = SupportedBool.supported(hidden != true && screenRect.width > 0 && screenRect.height > 0)
    let checked = checkedValue(role: role, value: valueObject)

    return ElementSnapshot(
      id: record.id,
      automationID: automationID,
      checked: checked,
      enabled: enabled,
      expanded: expanded,
      focused: focused,
      name: name,
      parentID: record.parentID,
      rect: rect,
      screenRect: screenRect,
      role: role,
      scope: record.scope,
      selected: selected,
      text: text,
      value: value,
      visible: visible,
      windowID: record.windowID
    )
  }

  private func supportedBool(
    _ element: AXUIElement,
    attribute: String,
    reason: String
  ) throws -> SupportedBool {
    guard let value = try optionalBool(element, attribute: attribute) else {
      return .unsupported(reason)
    }
    return .supported(value)
  }

  private func optionalBool(_ element: AXUIElement, attribute: String) throws -> Bool? {
    guard let value = axNumber(try copyOptionalAXAttribute(element, attribute)) else {
      return nil
    }
    return value.boolValue
  }

  func checkedValue(role: String, value: CFTypeRef?) -> CheckedValue {
    guard role == "checkbox" || role == "radio" || role == "switch" else {
      return .unsupported("The element role does not expose checked state.")
    }
    if let number = axNumber(value) {
      if number.intValue == 2 {
        return .mixed
      }
      return .bool(number.boolValue)
    }
    if let string = axString(value)?.lowercased() {
      let components = string.split(separator: ",").map { $0.trimmingCharacters(in: .whitespacesAndNewlines) }
      if components.contains("mixed") {
        return .mixed
      }
      if components.contains(where: { ["1", "true", "on", "selected", "checked"].contains($0) }) {
        return .bool(true)
      }
      if components.contains(where: { ["0", "false", "off", "unselected", "unchecked"].contains($0) }) {
        return .bool(false)
      }
    }
    return .unsupported("The element does not expose a Boolean or mixed accessibility value.")
  }

  private func stringValue(_ value: CFTypeRef?) -> String? {
    if let string = axString(value) {
      return string
    }
    if let number = axNumber(value) {
      return isBoolean(number) ? (number.boolValue ? "true" : "false") : number.stringValue
    }
    return nil
  }

  func normalizeRole(_ role: String, subrole: String?, value: String? = nil, element: AXUIElement? = nil) throws -> String {
    let roles: [String: String] = [
      kAXApplicationRole: "application",
      kAXBrowserRole: "document",
      kAXButtonRole: "button",
      kAXCheckBoxRole: "checkbox",
      kAXComboBoxRole: "combobox",
      kAXDisclosureTriangleRole: "button",
      kAXGroupRole: "group",
      kAXImageRole: "image",
      "AXLink": "link",
      kAXListRole: "list",
      kAXMenuRole: "menu",
      kAXMenuBarRole: "menubar",
      kAXMenuItemRole: "menuitem",
      kAXOutlineRole: "tree",
      kAXPopUpButtonRole: "combobox",
      kAXProgressIndicatorRole: "progressbar",
      kAXRadioButtonRole: "radio",
      kAXRadioGroupRole: "radiogroup",
      kAXRowRole: "row",
      kAXScrollAreaRole: "scrollarea",
      kAXScrollBarRole: "scrollbar",
      kAXSheetRole: "dialog",
      kAXSliderRole: "slider",
      kAXStaticTextRole: "text",
      kAXTabGroupRole: "tablist",
      kAXTableRole: "table",
      kAXTextAreaRole: "textbox",
      kAXTextFieldRole: "textbox",
      kAXToolbarRole: "toolbar",
      kAXWindowRole: "window",
    ]
    if subrole == kAXDialogSubrole {
      return "dialog"
    }
    if subrole == "AXSwitch" {
      return "switch"
    }
    let normalized = roles[role] ?? role.replacingOccurrences(of: "AX", with: "").lowercased()
    guard normalized == "unknown" else {
      return normalized
    }

    if let nativeRole = value?
      .split(separator: ",")
      .first?
      .trimmingCharacters(in: .whitespacesAndNewlines)
      .lowercased(),
      ["checkbox", "radio", "switch"].contains(nativeRole)
    {
      return nativeRole
    }

    if let element {
      var settable: DarwinBoolean = false
      let error = AXUIElementIsAttributeSettable(element, kAXValueAttribute as CFString, &settable)
      if error == .success, settable.boolValue {
        return "textbox"
      }
      if error != .attributeUnsupported && error != .noValue && error != .failure && error != .illegalArgument {
        try throwAX(error, operation: "Checking whether AXValue is writable")
      }
    }
    return normalized
  }

  private func matches(snapshot: ElementSnapshot, strategy: String, value: String) throws -> Bool {
    switch strategy {
    case "accessibility id":
      return snapshot.automationID == value
    case "tag name":
      return snapshot.role == normalizeRoleQuery(value)
    case "link text":
      return snapshot.name == value
    case "partial link text":
      return !value.isEmpty && (snapshot.name?.contains(value) ?? false)
    case "-furn:text":
      return snapshot.text == value || snapshot.value == value || snapshot.name == value
    default:
      try fail(ErrorCode.invalidParams, "Locator strategy \"\(strategy)\" is not supported.")
    }
  }

  private func normalizeRoleQuery(_ value: String) -> String {
    let normalized = value.trimmingCharacters(in: .whitespacesAndNewlines).lowercased()
    let aliases: [String: String] = [
      "edit": "textbox",
      "input": "textbox",
      "textfield": "textbox",
      "hyperlink": "link",
      "radiobutton": "radio",
      "combo box": "combobox",
      "listbox": "list",
      "statusbar": "status",
      "tabitem": "tab",
      "progress": "progressbar",
      "spinner": "spinbutton",
    ]
    return aliases[normalized] ?? normalized
  }

  private func parent(of element: AXUIElement) throws -> AXUIElement? {
    guard let value = try copyAXAttribute(element, kAXParentAttribute) else {
      return nil
    }
    return axElement(value)
  }

  private func belongsToWindow(
    _ element: AXUIElement,
    window: AXUIElement,
    token: CancellationToken
  ) throws -> Bool {
    var cursor: AXUIElement? = element
    for _ in 0..<Self.maximumAncestorDepth {
      try token.throwIfCancelled()
      guard let current = cursor else {
        return false
      }
      if sameAXElement(current, window) {
        return true
      }
      cursor = try parent(of: current)
    }
    return false
  }

  private func hitElement(at point: CGPoint) throws -> AXUIElement? {
    try requireAccessibility("Accessibility hit testing")
    var element: AXUIElement?
    let error = AXUIElementCopyElementAtPosition(
      AXUIElementCreateSystemWide(),
      Float(point.x),
      Float(point.y),
      &element
    )
    if error == .noValue || error == .cannotComplete {
      return nil
    }
    try throwAX(error, operation: "Hit testing the desktop")
    return element
  }

  private func resolveKnownAncestor(
    _ element: AXUIElement,
    token: CancellationToken
  ) throws -> ElementRecord? {
    var cursor: AXUIElement? = element
    for _ in 0..<Self.maximumAncestorDepth {
      try token.throwIfCancelled()
      guard let current = cursor else {
        return nil
      }
      if let record = knownRecord(current) {
        return record
      }
      cursor = try parent(of: current)
    }
    return nil
  }

  private func knownRecord(_ element: AXUIElement) -> ElementRecord? {
    let hash = CFHash(element)
    for id in recordIDsByHash[hash] ?? [] {
      if let record = records[id], sameAXElement(record.element, element) {
        return record
      }
    }
    return nil
  }

  private func scopeForKnownElement(_ element: AXUIElement) -> ElementScope? {
    knownRecord(element)?.scope
  }

  private func parentIDForKnownElement(_ element: AXUIElement) -> String? {
    knownRecord(element)?.parentID
  }

  private func externalWindowSnapshot(
    window: WindowRecord,
    hit: AXUIElement
  ) -> ElementSnapshot {
    let screenRect = (try? axFrame(hit)) ?? .zero
    let windowFrame = (try? window.currentFrame()) ?? .zero
    return ElementSnapshot(
      id: IdentifierGenerator.shared.next("external-window"),
      automationID: nil,
      checked: .unsupported("An external desktop window does not expose checked state."),
      enabled: .supported(true),
      expanded: .unsupported("An external desktop window does not expose expanded state."),
      focused: .supported(false),
      name: "External desktop window",
      parentID: nil,
      rect: CGRect(
        x: screenRect.minX - windowFrame.minX,
        y: screenRect.minY - windowFrame.minY,
        width: screenRect.width,
        height: screenRect.height
      ),
      screenRect: screenRect,
      role: "window",
      scope: .application,
      selected: .unsupported("An external desktop window does not expose selected state."),
      text: nil,
      value: nil,
      visible: .supported(true),
      windowID: window.id
    )
  }

  private func escapeXML(_ value: String) -> String {
    var output = ""
    for scalar in value.unicodeScalars {
      switch scalar.value {
      case 0x26:
        output += "&amp;"
      case 0x3C:
        output += "&lt;"
      case 0x3E:
        output += "&gt;"
      case 0x22:
        output += "&quot;"
      case 0x27:
        output += "&apos;"
      case 0..<0x20 where scalar.value != 0x09 && scalar.value != 0x0A && scalar.value != 0x0D:
        output.append(" ")
      default:
        output.unicodeScalars.append(scalar)
      }
    }
    return output
  }

  private func formatNumber(_ value: CGFloat) -> String {
    let number = rounded(value)
    if number.rounded() == number {
      return String(Int64(number))
    }
    return String(number)
  }
}
