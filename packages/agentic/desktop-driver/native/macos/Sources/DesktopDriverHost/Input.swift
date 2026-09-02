import ApplicationServices
import Foundation

enum KeyStroke {
  case keyCode(CGKeyCode)
  case unicode(String)
}

struct PressedKey {
  let value: String
  let stroke: KeyStroke
}

struct ReleaseLedger {
  let keys: [String]
  let buttons: [Int]
}

final class InputController {
  private let source = CGEventSource(stateID: .hidSystemState)
  private var pressedKeys: [PressedKey] = []
  private var pressedButtons: [Int] = []
  private(set) var pointer: CGPoint = .zero
  private var pointerInitialized = false

  var hasDepressedInput: Bool {
    !pressedKeys.isEmpty || !pressedButtons.isEmpty
  }

  var depressedKeyCount: Int { pressedKeys.count }
  var depressedButtonCount: Int { pressedButtons.count }

  func physicalInputAvailable() -> Bool {
    AXIsProcessTrusted()
  }

  func syncPointer() {
    if let position = CGEvent(source: nil)?.location {
      pointer = position
      pointerInitialized = true
    }
  }

  func movePointer(to target: CGPoint, durationMilliseconds: Int, token: CancellationToken) throws {
    try requirePhysicalInput()
    if !pointerInitialized {
      syncPointer()
    }
    let start = pointer
    let duration = max(0, min(durationMilliseconds, 30_000))
    let steps = duration == 0 ? 1 : max(1, min(60, duration / 16))
    for step in 1...steps {
      try token.throwIfCancelled()
      let progress = CGFloat(step) / CGFloat(steps)
      let position = CGPoint(
        x: start.x + (target.x - start.x) * progress,
        y: start.y + (target.y - start.y) * progress
      )
      try postMouse(type: moveEventType(), point: position, button: pressedButtons.last ?? 0)
      pointer = position
      if step < steps {
        try token.wait(milliseconds: max(1, duration / steps))
      }
    }
    pointer = target
    try token.wait(milliseconds: 16)
    if let observed = CGEvent(source: nil)?.location,
      abs(observed.x - target.x) > 2 || abs(observed.y - target.y) > 2
    {
      try fail(ErrorCode.inputFailed, "macOS did not move the pointer to the requested native element coordinate.")
    }
  }

  func pointerDown(_ button: Int, token: CancellationToken) throws {
    try requirePhysicalInput()
    try token.throwIfCancelled()
    _ = try mouseButton(button)
    if pressedButtons.contains(button) {
      return
    }
    try postMouse(type: mouseEventType(button: button, down: true), point: pointer, button: button)
    pressedButtons.append(button)
  }

  func pointerUp(_ button: Int, token: CancellationToken) throws {
    try token.throwIfCancelled()
    _ = try mouseButton(button)
    guard let index = pressedButtons.lastIndex(of: button) else {
      return
    }
    try requirePhysicalInput()
    try postMouse(type: mouseEventType(button: button, down: false), point: pointer, button: button)
    pressedButtons.remove(at: index)
  }

  func pointerCancel() {
    for button in pressedButtons.reversed() {
      try? postMouse(type: mouseEventType(button: button, down: false), point: pointer, button: button)
    }
    pressedButtons.removeAll()
  }

  func click(at point: CGPoint, token: CancellationToken) throws {
    try movePointer(to: point, durationMilliseconds: 0, token: token)
    try token.wait(milliseconds: 50)
    try pointerDown(0, token: token)
    try token.wait(milliseconds: 50)
    try pointerUp(0, token: token)
  }

  func wheel(deltaX: Double, deltaY: Double, token: CancellationToken) throws {
    try requirePhysicalInput()
    try token.throwIfCancelled()
    guard let event = CGEvent(
      scrollWheelEvent2Source: source,
      units: .pixel,
      wheelCount: 2,
      wheel1: Int32(clamping: Int((-deltaY).rounded())),
      wheel2: Int32(clamping: Int(deltaX.rounded())),
      wheel3: 0
    ) else {
      try fail(ErrorCode.inputFailed, "Creating the macOS wheel event failed.")
    }
    event.post(tap: .cghidEventTap)
  }

  func keyDown(_ value: String, token: CancellationToken) throws {
    try requirePhysicalInput()
    try token.throwIfCancelled()
    guard isSingleWebDriverKey(value) else {
      try fail(ErrorCode.invalidParams, "A keyDown value must contain exactly one Unicode code point.")
    }
    if value == "\u{E000}" {
      releaseAll()
      return
    }
    let stroke = strokeForValue(value)
    try postKey(stroke, down: true)
    pressedKeys.append(PressedKey(value: value, stroke: stroke))
  }

  func keyUp(_ value: String, token: CancellationToken) throws {
    try token.throwIfCancelled()
    guard isSingleWebDriverKey(value) else {
      try fail(ErrorCode.invalidParams, "A keyUp value must contain exactly one Unicode code point.")
    }
    if value == "\u{E000}" {
      releaseAll()
      return
    }
    try requirePhysicalInput()
    if let index = pressedKeys.lastIndex(where: { $0.value == value }) {
      let stroke = pressedKeys[index].stroke
      try postKey(stroke, down: false)
      pressedKeys.remove(at: index)
      return
    }
    try postKey(strokeForValue(value), down: false)
  }

  func typeText(_ text: String, token: CancellationToken) throws {
    try requirePhysicalInput()
    for scalar in text.unicodeScalars {
      try token.throwIfCancelled()
      let value = String(scalar)
      if value == "\r" {
        continue
      }
      let normalized = value == "\n" ? "\u{E006}" : value
      let stroke = strokeForValue(normalized)
      try postKey(stroke, down: true)
      pressedKeys.append(PressedKey(value: normalized, stroke: stroke))
      try postKey(stroke, down: false)
      pressedKeys.removeLast()
    }
  }

  func pressCommandADelete(token: CancellationToken) throws {
    try chord([.keyCode(55), .keyCode(0)], token: token)
    try chord([.keyCode(51)], token: token)
  }

  func releaseAll() {
    for key in pressedKeys.reversed() {
      try? postKey(key.stroke, down: false)
    }
    pressedKeys.removeAll()
    pointerCancel()
  }

  func releaseExact(_ ledger: ReleaseLedger) throws -> (keys: Int, buttons: Int) {
    if ledger.keys.isEmpty && ledger.buttons.isEmpty {
      return (0, 0)
    }
    try requirePhysicalInput()
    syncPointer()
    for key in ledger.keys.reversed() {
      try postKey(strokeForValue(key), down: false)
    }
    for button in ledger.buttons.reversed() {
      _ = try mouseButton(button)
      try postMouse(type: mouseEventType(button: button, down: false), point: pointer, button: button)
    }
    return (ledger.keys.count, ledger.buttons.count)
  }

  func releaseDesktopModifiers() throws -> (keys: Int, buttons: Int) {
    try requirePhysicalInput()
    let modifierCodes: [CGKeyCode] = [56, 60, 59, 62, 58, 61, 55, 54]
    var keyCount = 0
    for code in modifierCodes where CGEventSource.keyState(.combinedSessionState, key: code) {
      try postKey(.keyCode(code), down: false)
      keyCount += 1
    }
    syncPointer()
    var buttonCount = 0
    for button in 0...4 where CGEventSource.buttonState(.combinedSessionState, button: try mouseButton(button)) {
      try postMouse(type: mouseEventType(button: button, down: false), point: pointer, button: button)
      buttonCount += 1
    }
    return (keyCount, buttonCount)
  }

  private func chord(_ strokes: [KeyStroke], token: CancellationToken) throws {
    try requirePhysicalInput()
    let base = pressedKeys.count
    for (index, stroke) in strokes.enumerated() {
      try token.throwIfCancelled()
      try postKey(stroke, down: true)
      pressedKeys.append(PressedKey(value: "chord:\(index)", stroke: stroke))
    }
    while pressedKeys.count > base {
      let stroke = pressedKeys.last!.stroke
      try postKey(stroke, down: false)
      pressedKeys.removeLast()
    }
  }

  private func requirePhysicalInput() throws {
    guard physicalInputAvailable() else {
      try fail(
        ErrorCode.inputUnavailable,
        "Physical input requires Accessibility permission. Enable Furn Desktop Driver Host in System Settings > Privacy & Security > Accessibility, then restart the helper."
      )
    }
  }

  private func postKey(_ stroke: KeyStroke, down: Bool) throws {
    let event: CGEvent?
    switch stroke {
    case let .keyCode(code):
      event = CGEvent(keyboardEventSource: source, virtualKey: code, keyDown: down)
    case let .unicode(value):
      event = CGEvent(keyboardEventSource: source, virtualKey: 0, keyDown: down)
      if let event {
        let units = Array(value.utf16)
        units.withUnsafeBufferPointer {
          event.keyboardSetUnicodeString(stringLength: $0.count, unicodeString: $0.baseAddress)
        }
      }
    }
    guard let event else {
      try fail(ErrorCode.inputFailed, "Creating a macOS keyboard event failed.")
    }
    event.post(tap: .cghidEventTap)
  }

  private func postMouse(type: CGEventType, point: CGPoint, button: Int) throws {
    let nativeButton = try mouseButton(button)
    guard let event = CGEvent(
      mouseEventSource: source,
      mouseType: type,
      mouseCursorPosition: point,
      mouseButton: nativeButton
    ) else {
      try fail(ErrorCode.inputFailed, "Creating a macOS pointer event failed.")
    }
    event.setIntegerValueField(.mouseEventButtonNumber, value: Int64(nativeButton.rawValue))
    event.post(tap: .cghidEventTap)
  }

  private func moveEventType() -> CGEventType {
    guard let button = pressedButtons.last else {
      return .mouseMoved
    }
    switch button {
    case 0:
      return .leftMouseDragged
    case 2:
      return .rightMouseDragged
    default:
      return .otherMouseDragged
    }
  }

  private func mouseEventType(button: Int, down: Bool) -> CGEventType {
    switch button {
    case 0:
      return down ? .leftMouseDown : .leftMouseUp
    case 2:
      return down ? .rightMouseDown : .rightMouseUp
    default:
      return down ? .otherMouseDown : .otherMouseUp
    }
  }

  private func mouseButton(_ button: Int) throws -> CGMouseButton {
    switch button {
    case 0:
      return .left
    case 1:
      return .center
    case 2:
      return .right
    case 3:
      return CGMouseButton(rawValue: 3)!
    case 4:
      return CGMouseButton(rawValue: 4)!
    default:
      try fail(ErrorCode.invalidParams, "Pointer button \(button) is not supported on macOS.")
    }
  }

  private func strokeForValue(_ value: String) -> KeyStroke {
    if let code = specialKeyCodes[value] {
      return .keyCode(code)
    }
    return .unicode(value)
  }
}

func isSingleWebDriverKey(_ value: String) -> Bool {
  value.unicodeScalars.count == 1
}

private let specialKeyCodes: [String: CGKeyCode] = [
  "\u{E001}": 53,
  "\u{E002}": 114,
  "\u{E003}": 51,
  "\u{E004}": 48,
  "\u{E005}": 71,
  "\u{E006}": 36,
  "\u{E007}": 76,
  "\u{E008}": 56,
  "\u{E009}": 59,
  "\u{E00A}": 58,
  "\u{E00B}": 113,
  "\u{E00C}": 53,
  "\u{E00D}": 49,
  "\u{E00E}": 116,
  "\u{E00F}": 121,
  "\u{E010}": 119,
  "\u{E011}": 115,
  "\u{E012}": 123,
  "\u{E013}": 126,
  "\u{E014}": 124,
  "\u{E015}": 125,
  "\u{E016}": 114,
  "\u{E017}": 117,
  "\u{E018}": 41,
  "\u{E019}": 24,
  "\u{E01A}": 82,
  "\u{E01B}": 83,
  "\u{E01C}": 84,
  "\u{E01D}": 85,
  "\u{E01E}": 86,
  "\u{E01F}": 87,
  "\u{E020}": 88,
  "\u{E021}": 89,
  "\u{E022}": 91,
  "\u{E023}": 92,
  "\u{E024}": 67,
  "\u{E025}": 69,
  "\u{E026}": 65,
  "\u{E027}": 78,
  "\u{E028}": 65,
  "\u{E029}": 75,
  "\u{E031}": 122,
  "\u{E032}": 120,
  "\u{E033}": 99,
  "\u{E034}": 118,
  "\u{E035}": 96,
  "\u{E036}": 97,
  "\u{E037}": 98,
  "\u{E038}": 100,
  "\u{E039}": 101,
  "\u{E03A}": 109,
  "\u{E03B}": 103,
  "\u{E03C}": 111,
  "\u{E03D}": 55,
  "\u{E050}": 60,
  "\u{E051}": 62,
  "\u{E052}": 61,
  "\u{E053}": 54,
  "\u{E054}": 116,
  "\u{E055}": 121,
  "\u{E056}": 119,
  "\u{E057}": 115,
  "\u{E058}": 123,
  "\u{E059}": 126,
  "\u{E05A}": 124,
  "\u{E05B}": 125,
  "\u{E05C}": 114,
  "\u{E05D}": 117,
]

func parseReleaseLedger(_ value: Any) throws -> ReleaseLedger {
  guard let object = value as? JSONObject else {
    try fail(ErrorCode.invalidParams, "The release ledger must be a JSON object.")
  }
  for key in object.keys where key != "keys" && key != "buttons" {
    try fail(ErrorCode.invalidParams, "The release ledger contains the unknown field \"\(key)\".")
  }
  let rawKeys = object["keys"] ?? []
  let rawButtons = object["buttons"] ?? []
  guard let keyValues = rawKeys as? [Any] else {
    try fail(ErrorCode.invalidParams, "The release ledger field \"keys\" must be an array.")
  }
  guard let buttonValues = rawButtons as? [Any] else {
    try fail(ErrorCode.invalidParams, "The release ledger field \"buttons\" must be an array.")
  }
  var keys: [String] = []
  for value in keyValues {
    guard let value = value as? String, isSingleWebDriverKey(value) else {
      try fail(ErrorCode.invalidParams, "Every release ledger key must be one WebDriver key value.")
    }
    keys.append(value)
  }
  var buttons: [Int] = []
  for value in buttonValues {
    guard let number = value as? NSNumber, !isBoolean(number) else {
      try fail(ErrorCode.invalidParams, "Every release ledger button must be a number.")
    }
    let button = number.intValue
    guard number.doubleValue == Double(button), (0...4).contains(button) else {
      try fail(ErrorCode.invalidParams, "Release ledger buttons must be W3C pointer buttons between 0 and 4.")
    }
    buttons.append(button)
  }
  return ReleaseLedger(keys: keys, buttons: buttons)
}
