import Foundation

func clearWithKeyboard(
  token: CancellationToken,
  focus: () throws -> Void,
  hasFocus: () throws -> Bool,
  value: () throws -> String?,
  selectedRange: () throws -> CFRange?,
  selectAll: () throws -> Void,
  delete: () throws -> Void,
  wait: (Int) throws -> Void
) throws {
  func until(_ attempts: Int, milliseconds: Int, _ condition: () throws -> Bool) throws -> Bool {
    for attempt in 0..<attempts {
      try token.throwIfCancelled()
      if try condition() { return true }
      if attempt + 1 < attempts { try wait(milliseconds) }
    }
    return false
  }

  try token.throwIfCancelled()
  guard let initialValue = try value() else {
    try fail(ErrorCode.unsupported, "Keyboard clear requires a readable value so its result can be verified.")
  }
  try focus()
  guard try until(11, milliseconds: 20, hasFocus) else {
    try fail(ErrorCode.notInteractable, "The element did not take keyboard focus, so its value was not cleared.")
  }
  let canReadSelection = try selectedRange() != nil
  try selectAll()
  if canReadSelection {
    let selected = try until(21, milliseconds: 10) {
      guard let range = try selectedRange() else { return false }
      return range.location == 0 && range.length == initialValue.utf16.count
    }
    guard selected else {
      try fail(ErrorCode.inputFailed, "The keyboard selection did not select the complete value, so Delete was not posted.")
    }
  }
  guard try hasFocus() else {
    try fail(ErrorCode.notInteractable, "The element lost keyboard focus before Delete could be posted.")
  }
  try delete()
  guard try until(41, milliseconds: 25, { try value() == "" }) else {
    try fail(ErrorCode.inputFailed, "The keyboard clear was posted, but the element did not report an empty value.")
  }
}
