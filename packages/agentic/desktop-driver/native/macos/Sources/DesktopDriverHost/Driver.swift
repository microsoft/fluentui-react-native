import AppKit
import ApplicationServices
import Foundation

struct CommandResult {
  var result: Any = NSNull()
  var binaryID: String?
  var binaryData: Data?
  var binaryMetadata: JSONObject?
}

final class Driver {
  private let applications = ApplicationManager()
  private let accessibility = AccessibilityEngine()
  private let input = InputController()
  private let capture = CaptureEngine()
  private let inputLock = PhysicalInputLock.shared
  private var persistentInputLock = false

  func execute(command: String, params: JSONObject, token: CancellationToken) throws -> CommandResult {
    try token.throwIfCancelled()
    switch command {
    case "probe":
      return CommandResult(result: probe(params))
    case "launch":
      return CommandResult(result: try applications.launch(params, token: token).json())
    case "attach":
      return CommandResult(result: try applications.attach(params, token: token).json())
    case "closeApplication":
      let lease = try requireObject(params["lease"], "The closeApplication request is missing its lease.")
      let leaseID = try requireString(lease, "id")
      for windowID in applications.windowIDs(for: leaseID) {
        accessibility.forgetWindow(windowID)
      }
      _ = try applications.closeApplication(leaseID, token: token)
      return CommandResult()
    case "windows":
      let lease = try requireObject(params["lease"], "The windows request is missing its lease.")
      let records = try applications.listWindows(try requireString(lease, "id"), token: token)
      return CommandResult(result: try records.map(windowJSON))
    case "closeWindow":
      let windowID = try requireString(params, "windowId")
      let window = try applications.requireWindow(windowID)
      try closeWindow(window)
      accessibility.forgetWindow(windowID)
      applications.forgetWindow(windowID)
      return CommandResult()
    case "activate":
      try activate(try applications.requireWindow(try requireString(params, "windowId")), token: token)
      return CommandResult()
    case "getWindowRect":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      return CommandResult(result: rectJSON(try window.currentFrame()))
    case "setWindowRect":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      let rect = try requireObject(params["rect"], "The setWindowRect request is missing its rectangle.")
      return CommandResult(result: rectJSON(try setWindowRect(window, requested: rect, token: token)))
    case "find":
      let root = try requireObject(params["root"], "The find request requires a root and a selector.")
      let selector = try requireObject(params["selector"], "The find request requires a root and a selector.")
      let window = try applications.requireWindow(try requireString(root, "windowId"))
      guard let lease = applications.lease(for: window) else {
        try fail(ErrorCode.noSuchLease, "The requested window no longer belongs to a held application lease.")
      }
      let snapshots = try accessibility.find(
        window: window,
        lease: lease,
        rootElementID: optionalString(root, "elementId"),
        selector: selector,
        token: token
      )
      return CommandResult(result: snapshots.map { $0.json() })
    case "snapshot":
      let elementID = try requireString(params, "elementId")
      let window = try windowForElement(elementID)
      return CommandResult(result: try accessibility.snapshot(elementID: elementID, window: window, token: token).json())
    case "activeElement":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      let snapshot = try accessibility.activeElement(window: window, token: token)
      return CommandResult(result: snapshot?.json() ?? NSNull())
    case "hitTest":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      let snapshot = try accessibility.hitTest(
        window: window,
        x: CGFloat(number(params, "x")),
        y: CGFloat(number(params, "y")),
        token: token
      )
      return CommandResult(result: snapshot?.json() ?? NSNull())
    case "click":
      try click(
        elementID: try requireString(params, "elementId"),
        mode: optionalString(params, "mode") ?? "auto",
        token: token
      )
      return CommandResult()
    case "clear":
      try clear(elementID: try requireString(params, "elementId"), token: token)
      return CommandResult()
    case "sendKeys":
      guard let text = params["text"] as? String else {
        try fail(ErrorCode.invalidParams, "The sendKeys request requires a string \"text\".")
      }
      try sendKeys(elementID: try requireString(params, "elementId"), text: text, token: token)
      return CommandResult()
    case "performActions":
      guard let actions = params["actions"] as? [Any] else {
        try fail(ErrorCode.invalidParams, "The performActions request requires an array of input sources.")
      }
      try withPhysicalInput(token: token) {
        try performActions(actions, token: token)
      }
      return CommandResult()
    case "releaseActions":
      try withPhysicalInput(token: token) {
        input.releaseAll()
      }
      return CommandResult()
    case "captureWindow":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      return try captureResult(
        capture.captureWindow(window: window, title: try windowTitle(window), token: token)
      )
    case "captureElement":
      let elementID = try requireString(params, "elementId")
      let window = try windowForElement(elementID)
      let snapshot = try accessibility.snapshot(elementID: elementID, window: window, token: token)
      return try captureResult(
        capture.captureElement(
          window: window,
          title: try windowTitle(window),
          element: snapshot,
          token: token
        )
      )
    case "source":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      guard let lease = applications.lease(for: window) else {
        try fail(ErrorCode.noSuchLease, "The requested window no longer belongs to a held application lease.")
      }
      return CommandResult(result: try accessibility.source(accessibility.tree(window: window, lease: lease, token: token)))
    case "tree":
      let window = try applications.requireWindow(try requireString(params, "windowId"))
      guard let lease = applications.lease(for: window) else {
        try fail(ErrorCode.noSuchLease, "The requested window no longer belongs to a held application lease.")
      }
      return CommandResult(
        result: try accessibility.tree(window: window, lease: lease, token: token).map { $0.json() }
      )
    case "dispose":
      releaseInput()
      applications.dispose(token: token)
      accessibility.reset()
      return CommandResult()
    default:
      try fail(ErrorCode.unsupported, "The macOS helper does not implement the \"\(command)\" command.")
    }
  }

  func releaseInput() {
    if persistentInputLock {
      input.releaseAll()
      inputLock.release()
      persistentInputLock = false
      return
    }
    guard input.hasDepressedInput else {
      return
    }
    let idle = CancellationToken()
    do {
      try inputLock.withLock(token: idle, timeoutMilliseconds: 5_000, policy: .adopt) {
        input.releaseAll()
      }
    } catch {
      writeDiagnostic("furn-desktop-driver-host: input cleanup failed: \(error)")
    }
  }

  private func probe(_ params: JSONObject) -> JSONObject {
    let trusted = AXIsProcessTrusted()
    let screenshot = capture.available
    return [
      "endpoint": optionalString(params, "endpoint") ?? "macos",
      "features": [
        "accessibilityClick": trusted,
        "elementScreenshot": screenshot,
        "focus": trusted,
        "keyboard": trusted,
        "physicalClick": trusted,
        "screenshot": screenshot,
        "setWindowRect": trusted,
        "wheel": trusted,
      ],
      "platformName": "macos",
      "protocolVersion": 1,
    ]
  }

  private func windowJSON(_ window: WindowRecord) throws -> JSONObject {
    [
      "id": window.id,
      "rect": rectJSON(try window.currentFrame()),
      "title": try windowTitle(window),
    ]
  }

  private func windowTitle(_ window: WindowRecord) throws -> String {
    axString(try copyAXAttribute(window.element, kAXTitleAttribute)) ?? ""
  }

  private func windowForElement(_ elementID: String) throws -> WindowRecord {
    let record = try accessibility.requireRecord(elementID)
    return try applications.requireWindow(record.windowID)
  }

  private func closeWindow(_ window: WindowRecord) throws {
    try requireAccessibility("Closing an application window")
    guard
      let closeButtonValue = try copyAXAttribute(window.element, kAXCloseButtonAttribute),
      let closeButton = axElement(closeButtonValue)
    else {
      try fail(ErrorCode.unsupported, "The application window does not expose an accessibility close button.")
    }
    let error = AXUIElementPerformAction(closeButton, kAXPressAction as CFString)
    guard error == .success else {
      try fail(ErrorCode.automationFailed, "Closing the application window failed because \(describeAXError(error)).")
    }
  }

  private func activate(_ window: WindowRecord, token: CancellationToken) throws {
    try requireAccessibility("Activating an application window")
    guard let application = NSRunningApplication(processIdentifier: window.processID) else {
      try fail(ErrorCode.noSuchWindow, "The requested window's application is no longer running.")
    }
    _ = application.activate(options: [])
    _ = AXUIElementSetAttributeValue(window.element, kAXMainAttribute as CFString, kCFBooleanTrue)
    let raised = AXUIElementPerformAction(window.element, kAXRaiseAction as CFString)
    if raised != .success && raised != .actionUnsupported {
      try fail(ErrorCode.windowActivation, "Raising the application window failed because \(describeAXError(raised)).")
    }
    let deadline = DispatchTime.now() + .seconds(2)
    while DispatchTime.now() < deadline {
      try token.throwIfCancelled()
      let main = axNumber(try copyAXAttribute(window.element, kAXMainAttribute))?.boolValue == true
      if NSWorkspace.shared.frontmostApplication?.processIdentifier == window.processID && main {
        return
      }
      try token.wait(milliseconds: 50)
    }
    try fail(
      ErrorCode.windowActivation,
      "The target window did not become the active foreground application window."
    )
  }

  private func setWindowRect(
    _ window: WindowRecord,
    requested: JSONObject,
    token: CancellationToken
  ) throws -> CGRect {
    try requireAccessibility("Setting an application window rectangle")
    try token.throwIfCancelled()
    let current = try window.currentFrame()
    var target = CGRect(
      x: requested["x"] == nil ? current.minX : CGFloat(number(requested, "x")),
      y: requested["y"] == nil ? current.minY : CGFloat(number(requested, "y")),
      width: requested["width"] == nil ? current.width : CGFloat(number(requested, "width")),
      height: requested["height"] == nil ? current.height : CGFloat(number(requested, "height"))
    )
    guard
      target.minX.isFinite,
      target.minY.isFinite,
      target.width.isFinite,
      target.height.isFinite,
      target.width > 0,
      target.height > 0
    else {
      try fail(ErrorCode.invalidParams, "The requested window rectangle must contain finite positive dimensions.")
    }
    try setAXGeometry(window.element, attribute: kAXPositionAttribute, point: target.origin)
    try setAXGeometry(window.element, attribute: kAXSizeAttribute, size: target.size)
    try token.wait(milliseconds: 16)
    let refreshed = try axFrame(window.element)
    if refreshed.width > 0, refreshed.height > 0 {
      target = refreshed
    }
    window.lastKnownFrame = target
    return target
  }

  private func setAXGeometry(_ element: AXUIElement, attribute: String, point: CGPoint) throws {
    var settable: DarwinBoolean = false
    let check = AXUIElementIsAttributeSettable(element, attribute as CFString, &settable)
    try throwAX(check, operation: "Checking window position support")
    guard settable.boolValue else {
      try fail(ErrorCode.unsupported, "The application window position cannot be changed through Accessibility.")
    }
    var point = point
    guard let value = AXValueCreate(.cgPoint, &point) else {
      try fail(ErrorCode.internalError, "Creating the accessibility window position failed.")
    }
    let error = AXUIElementSetAttributeValue(element, attribute as CFString, value)
    guard error == .success else {
      try fail(ErrorCode.automationFailed, "Setting the window position failed because \(describeAXError(error)).")
    }
  }

  private func setAXGeometry(_ element: AXUIElement, attribute: String, size: CGSize) throws {
    var settable: DarwinBoolean = false
    let check = AXUIElementIsAttributeSettable(element, attribute as CFString, &settable)
    try throwAX(check, operation: "Checking window size support")
    guard settable.boolValue else {
      try fail(ErrorCode.unsupported, "The application window size cannot be changed through Accessibility.")
    }
    var size = size
    guard let value = AXValueCreate(.cgSize, &size) else {
      try fail(ErrorCode.internalError, "Creating the accessibility window size failed.")
    }
    let error = AXUIElementSetAttributeValue(element, attribute as CFString, value)
    guard error == .success else {
      try fail(ErrorCode.automationFailed, "Setting the window size failed because \(describeAXError(error)).")
    }
  }

  private func click(elementID: String, mode: String, token: CancellationToken) throws {
    let window = try windowForElement(elementID)
    _ = try accessibility.snapshot(elementID: elementID, window: window, token: token)
    if mode == "accessibility" {
      try accessibility.accessibilityClick(elementID, token: token)
      return
    }
    guard mode == "physical" || mode == "auto" else {
      try fail(ErrorCode.invalidParams, "Click mode \"\(mode)\" is not supported.")
    }
    if !input.physicalInputAvailable() {
      if mode == "auto" {
        try accessibility.accessibilityClick(elementID, token: token)
        return
      }
      try fail(
        ErrorCode.inputUnavailable,
        "Physical pointer input requires Accessibility permission in System Settings > Privacy & Security > Accessibility."
      )
    }
    try withPhysicalInput(token: token) {
      try activate(window, token: token)
      let snapshot = try accessibility.snapshot(elementID: elementID, window: window, token: token)
      guard
        snapshot.enabled.value != false,
        snapshot.visible.value == true,
        snapshot.screenRect.width > 0,
        snapshot.screenRect.height > 0
      else {
        try fail(ErrorCode.notInteractable, "The element is disabled, hidden, or does not occupy a clickable area.")
      }
      let point = CGPoint(x: snapshot.screenRect.midX, y: snapshot.screenRect.midY)
      guard try accessibility.elementOwnsPoint(elementID: elementID, point: point, token: token) else {
        try fail(ErrorCode.notInteractable, "Another desktop element owns the element's physical click point.")
      }
      try input.click(at: point, token: token)
    }
  }

  private func clear(elementID: String, token: CancellationToken) throws {
    let window = try windowForElement(elementID)
    _ = try accessibility.snapshot(elementID: elementID, window: window, token: token)
    if try accessibility.tryClearValue(elementID) {
      return
    }
    guard input.physicalInputAvailable() else {
      try fail(
        ErrorCode.inputUnavailable,
        "The element does not expose a writable value and physical input requires Accessibility permission."
      )
    }
    try withPhysicalInput(token: token) {
      try activate(window, token: token)
      try accessibility.setFocus(elementID)
      try token.wait(milliseconds: 16)
      try input.pressCommandADelete(token: token)
    }
  }

  private func sendKeys(elementID: String, text: String, token: CancellationToken) throws {
    guard input.physicalInputAvailable() else {
      try fail(
        ErrorCode.inputUnavailable,
        "Physical keyboard input requires Accessibility permission in System Settings > Privacy & Security > Accessibility."
      )
    }
    let window = try windowForElement(elementID)
    _ = try accessibility.snapshot(elementID: elementID, window: window, token: token)
    try withPhysicalInput(token: token) {
      try activate(window, token: token)
      try accessibility.setFocus(elementID)
      for _ in 0..<10 where try !accessibility.hasFocus(elementID) {
        try token.wait(milliseconds: 20)
      }
      guard try accessibility.hasFocus(elementID) else {
        try fail(ErrorCode.notInteractable, "The element did not take keyboard focus, so text could not be typed.")
      }
      try input.typeText(text, token: token)
    }
  }

  private func withPhysicalInput<T>(
    token: CancellationToken,
    _ body: () throws -> T
  ) throws -> T {
    let hadPersistentLock = persistentInputLock
    try inputLock.acquire(token: token, timeoutMilliseconds: 30_000, policy: .fail)
    input.syncPointer()
    do {
      let result = try body()
      if hadPersistentLock {
        inputLock.release()
        if !input.hasDepressedInput {
          inputLock.release()
          persistentInputLock = false
        }
      } else if input.hasDepressedInput {
        persistentInputLock = true
      } else {
        inputLock.release()
      }
      return result
    } catch {
      input.releaseAll()
      inputLock.release()
      if hadPersistentLock {
        inputLock.release()
        persistentInputLock = false
      }
      throw error
    }
  }

  private func performActions(_ actions: [Any], token: CancellationToken) throws {
    let sources = try actions.map {
      try requireObject($0, "Every input source must be an object.")
    }
    let ticks = sources.reduce(0) { maximum, source in
      max(maximum, (source["actions"] as? [Any])?.count ?? 0)
    }
    for tick in 0..<ticks {
      try token.throwIfCancelled()
      var pause = 0
      for source in sources {
        guard let list = source["actions"] as? [Any], tick < list.count else {
          continue
        }
        let action = try requireObject(list[tick], "Every input action must be an object.")
        let type = optionalString(action, "type") ?? ""
        let sourceType = optionalString(source, "type") ?? "none"
        if type == "pause" {
          pause = max(pause, actionDuration(action))
          continue
        }
        switch sourceType {
        case "key":
          guard let value = action["value"] as? String, isSingleWebDriverKey(value) else {
            try fail(ErrorCode.invalidParams, "A key action value must contain exactly one Unicode code point.")
          }
          if type == "keyDown" {
            try input.keyDown(value, token: token)
          } else if type == "keyUp" {
            try input.keyUp(value, token: token)
          } else {
            try fail(ErrorCode.invalidParams, "Key input sources support only keyDown, keyUp, and pause.")
          }
        case "pointer":
          if type == "pointerMove" {
            try input.movePointer(
              to: try resolveActionPoint(action, token: token),
              durationMilliseconds: actionDuration(action),
              token: token
            )
          } else if type == "pointerDown" {
            try input.pointerDown(actionButton(action), token: token)
          } else if type == "pointerUp" {
            try input.pointerUp(actionButton(action), token: token)
          } else if type == "pointerCancel" {
            input.pointerCancel()
          } else {
            try fail(ErrorCode.invalidParams, "Pointer input sources support only move, down, up, cancel, and pause.")
          }
        case "wheel":
          guard type == "scroll" else {
            try fail(ErrorCode.invalidParams, "Wheel input sources support only scroll and pause.")
          }
          try input.movePointer(to: resolveActionPoint(action, token: token), durationMilliseconds: 0, token: token)
          try input.wheel(
            deltaX: number(action, "deltaX"),
            deltaY: number(action, "deltaY"),
            token: token
          )
        case "none":
          try fail(ErrorCode.invalidParams, "None input sources support only pause.")
        default:
          try fail(ErrorCode.invalidParams, "Input source type \"\(sourceType)\" is not supported.")
        }
      }
      if pause > 0 {
        try token.wait(milliseconds: pause)
      }
    }
  }

  private func resolveActionPoint(_ action: JSONObject, token: CancellationToken) throws -> CGPoint {
    let x = CGFloat(number(action, "x"))
    let y = CGFloat(number(action, "y"))
    if let origin = action["origin"] as? JSONObject {
      let elementID = try requireString(origin, "elementId")
      let window = try windowForElement(elementID)
      let snapshot = try accessibility.snapshot(elementID: elementID, window: window, token: token)
      return CGPoint(x: snapshot.screenRect.midX + x, y: snapshot.screenRect.midY + y)
    }
    if action["origin"] as? String == "pointer" {
      return CGPoint(x: input.pointer.x + x, y: input.pointer.y + y)
    }
    guard
      let lease = applications.primaryLease(),
      let primaryWindowID = lease.primaryWindowID
    else {
      try fail(
        ErrorCode.invalidParams,
        "The helper does not hold an application window to resolve viewport coordinates against."
      )
    }
    let window = try applications.requireWindow(primaryWindowID)
    let frame = try window.currentFrame()
    return CGPoint(x: frame.minX + x, y: frame.minY + y)
  }

  private func actionDuration(_ action: JSONObject) -> Int {
    max(0, min(30_000, integer(action, "duration")))
  }

  private func actionButton(_ action: JSONObject) -> Int {
    integer(action, "button")
  }

  private func captureResult(_ image: EncodedImage) throws -> CommandResult {
    let binaryID = IdentifierGenerator.shared.next("image")
    let metadata: JSONObject = [
      "id": binaryID,
      "mimeType": "image/png",
      "height": image.height,
      "width": image.width,
      "scaleFactor": image.scaleFactor,
    ]
    return CommandResult(
      result: [
        "height": image.height,
        "mimeType": "image/png",
        "scaleFactor": image.scaleFactor,
        "width": image.width,
      ],
      binaryID: binaryID,
      binaryData: image.data,
      binaryMetadata: metadata
    )
  }
}
