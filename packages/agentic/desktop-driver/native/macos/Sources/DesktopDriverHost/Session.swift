import CoreGraphics
import Foundation

/// Login-session state for diagnosing automation that cannot reach the interactive desktop.
///
/// `kCGSSessionOnConsoleKey` and `kCGSessionLoginDoneKey` are the public CGSession.h key values. macOS adds
/// `CGSSessionScreenIsLocked` to the same dictionary only while the screen is locked; it is used here as a
/// diagnostic signal, not as an authorization decision.
struct LoginSessionState {
  static let source = "CGSessionCopyCurrentDictionary"
  private static let onConsoleKey = "kCGSSessionOnConsoleKey"
  private static let loginDoneKey = "kCGSessionLoginDoneKey"
  private static let screenLockedKey = "CGSSessionScreenIsLocked"

  let available: Bool
  let onConsole: Bool?
  let loginDone: Bool?
  let screenLocked: Bool?

  static func current() -> LoginSessionState {
    LoginSessionState(values: CGSessionCopyCurrentDictionary() as? [String: Any])
  }

  init(values: [String: Any]?) {
    guard let values else {
      available = false
      onConsole = nil
      loginDone = nil
      screenLocked = nil
      return
    }
    available = true
    onConsole = (values[Self.onConsoleKey] as? NSNumber)?.boolValue
    loginDone = (values[Self.loginDoneKey] as? NSNumber)?.boolValue
    screenLocked = (values[Self.screenLockedKey] as? NSNumber)?.boolValue ?? false
  }

  /// Why Accessibility window publication and physical input cannot reach applications, if the session explains it.
  var unavailableReason: String? {
    if screenLocked == true {
      return "The macOS screen is locked, so applications cannot publish accessibility windows or receive physical input. Unlock the login session and retry."
    }
    if onConsole == false {
      return "The macOS login session is not the active console session, so applications cannot publish accessibility windows or receive physical input. Switch to this user's session and retry."
    }
    return nil
  }

  var json: JSONObject {
    guard available else {
      return [
        "reason": "CoreGraphics did not return a login-session dictionary for the helper.",
        "source": Self.source,
        "status": "unavailable",
      ]
    }
    var result: JSONObject = [
      "loginDone": field(loginDone, key: Self.loginDoneKey),
      "onConsole": field(onConsole, key: Self.onConsoleKey),
      "screenLocked": field(screenLocked, key: Self.screenLockedKey),
      "source": Self.source,
      "status": "available",
    ]
    if let unavailableReason {
      result["unavailableReason"] = unavailableReason
    }
    return result
  }

  private func field(_ value: Bool?, key: String) -> JSONObject {
    if let value {
      return ["status": "available", "value": value]
    }
    return ["reason": "The login-session dictionary did not include \(key).", "status": "unavailable"]
  }
}

/// Fails with an explicit session diagnosis when the login session explains an automation failure.
func failIfSessionUnavailable(_ operation: String, data: JSONObject = [:]) throws {
  let session = LoginSessionState.current()
  guard let reason = session.unavailableReason else {
    return
  }
  var diagnostic = data
  diagnostic["session"] = session.json
  try fail(ErrorCode.inputUnavailable, "\(operation) failed. \(reason)", data: diagnostic)
}
