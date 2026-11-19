import ApplicationServices
import Foundation

private let leasedPID: pid_t = 101
private let foreignPID: pid_t = 102
private let leasedStart = "2026-01-01T00:00:00.000001Z"

extension ActionTargetOwnership {
  static var selfTestLease: ActionTargetOwnership {
    ActionTargetOwnership(
      windowOwner: { _, _ in leasedPID },
      focusedApplication: { leasedPID },
      leaseStarts: { $0 == leasedPID ? [leasedStart] : [] },
      observe: { _ in .started(leasedStart) },
      activatePrimary: { _ in false }
    )
  }
}

extension SelfTestRunner {
  func testActionTargetOwnership() {
    let recorder = InputRecorder()
    let effects = EffectLedger()
    let input = InputController(effects: effects, environment: recorder.environment)
    let lockName = "furn-desktop-driver-self-test-\(UUID().uuidString)"
    let lock = PhysicalInputLock(baseName: lockName)
    defer { lock.cleanupSelfTestFiles() }
    var windowPID: () -> pid_t? = { foreignPID }
    var foreground: pid_t? = foreignPID
    var foregroundOverride: (() -> pid_t?)?
    var observed = ApplicationIncarnation.ExactObservation.started(leasedStart)
    var activations = 0
    var bringsLeaseForward = false
    let driver = Driver(
      effects: effects, input: input, inputLock: lock,
      actionTargetOwnership: ActionTargetOwnership(
        windowOwner: { _, _ in windowPID() },
        focusedApplication: {
          if let foregroundOverride { return foregroundOverride() }
          return foreground
        },
        leaseStarts: { $0 == leasedPID ? [leasedStart] : [] },
        observe: { _ in observed },
        activatePrimary: { _ in
          activations += 1
          if bringsLeaseForward { foreground = leasedPID }
          return true
        }
      )
    )
    let button: JSONObject = ["type": "pointerDown", "button": 0]
    let scroll: JSONObject = ["type": "scroll", "origin": "pointer", "x": 4, "y": 2, "deltaX": 0, "deltaY": 1]
    let key: JSONObject = ["type": "keyDown", "value": "a"]

    func perform(_ source: String, _ actions: [JSONObject], token: CancellationToken = CancellationToken()) throws {
      _ = try driver.execute(command: "performActions", params: ["actions": [["type": source, "actions": actions]]], token: token)
    }

    func refuse(_ label: String, _ source: String, _ action: JSONObject, posts: [CGEventType] = []) {
      let before = recorder.posted.count
      do {
        try perform(source, [action])
        check(false, "\(label) is refused")
      } catch let error as HelperError {
        check(
          error.code == ErrorCode.notInteractable && error.effect == .noEffect
            && Array(recorder.posted.dropFirst(before)) == posts,
          "\(label) is refused without posting the guarded action"
        )
      } catch {
        check(false, "\(label) returns a helper error: \(error)")
      }
    }

    refuse("a button press over an unrelated window", "pointer", button)
    refuse("a scroll over an unrelated window, including pointer placement", "wheel", scroll)
    windowPID = { nil }
    refuse("a button press without a proven window", "pointer", button)
    windowPID = { leasedPID }
    observed = .started("2026-01-01T00:00:00.000002Z")
    refuse("a button press over a reused leased PID", "pointer", button)
    observed = .unavailable
    refuse("a button press over a leased PID with unreadable identity", "pointer", button)
    observed = .started(leasedStart)
    var hits = 0
    windowPID = {
      hits += 1
      return hits == 1 ? leasedPID : foreignPID
    }
    refuse("a scroll after the owner has changed during placement", "wheel", scroll, posts: [.mouseMoved])

    refuse("a key press when activation leaves an unrelated foreground", "key", key)
    foreground = nil
    refuse("a key press with unreadable foreground", "key", key)
    check(activations == 2, "each command attempts activation at most once if no leased foreground can be proven")

    do {
      foreground = foreignPID
      bringsLeaseForward = true
      let before = recorder.posted.count
      try perform("key", [key])
      check(activations == 3 && input.depressedKeyCount == 1, "an exactly leased foreground is verified again after activation")
      foreground = foreignPID
      try perform("key", [["type": "keyUp", "value": "b"], ["type": "keyUp", "value": "a"]])
      check(
        Array(recorder.posted.dropFirst(before)) == [.keyDown, .keyUp] && !input.hasDepressedInput && activations == 3,
        "focus loss does not block release of the owned key, and an unowned keyUp posts nothing"
      )

      let beforeFocusSwitch = recorder.posted.count
      foregroundOverride = { recorder.posted.count == beforeFocusSwitch ? leasedPID : foreignPID }
      do {
        try perform("key", [key, ["type": "keyDown", "value": "b"]])
        check(false, "focus loss between key presses is refused without reactivating")
      } catch let error as HelperError {
        check(
          error.code == ErrorCode.notInteractable && error.effect == .partial && activations == 3
            && Array(recorder.posted.dropFirst(beforeFocusSwitch)) == [.keyDown, .keyUp] && !input.hasDepressedInput,
          "focus loss between key presses refuses the second press and unwinds the first"
        )
      }
      foregroundOverride = nil

      windowPID = { leasedPID }
      try perform("pointer", [button])
      windowPID = { foreignPID }
      refuse(
        "a drag over an unrelated window", "pointer",
        ["type": "pointerMove", "origin": "pointer", "x": 20, "y": 0], posts: [.leftMouseUp]
      )
      check(!input.hasDepressedInput, "a refused drag unwinds the held button")

      foreground = leasedPID
      try perform("key", [key])
      foreground = foreignPID
      let cancelled = CancellationToken()
      foregroundOverride = {
        cancelled.cancel()
        return foreignPID
      }
      let beforeCancellation = recorder.posted.count
      do {
        try perform("key", [key], token: cancelled)
        check(false, "cancelled actions unwind an owned key after focus loss")
      } catch let error as CancelledError {
        check(
          error.effect == .noEffect && Array(recorder.posted.dropFirst(beforeCancellation)) == [.keyUp]
            && !input.hasDepressedInput && activations == 3,
          "cancelled actions unwind an owned key without checking or changing foreground"
        )
      }
      foregroundOverride = nil

      foreground = leasedPID
      try perform("key", [key])
      windowPID = { leasedPID }
      try perform("pointer", [button])
      foreground = foreignPID
      windowPID = { foreignPID }
      let beforeRelease = recorder.posted.count
      _ = try driver.execute(command: "releaseActions", params: [:], token: CancellationToken())
      check(
        Array(recorder.posted.dropFirst(beforeRelease)) == [.keyUp, .leftMouseUp] && !input.hasDepressedInput && activations == 3,
        "releaseActions unwinds its ledger despite focus and pointer ownership changes"
      )
      try PhysicalInputLock(baseName: lockName).withLock(token: CancellationToken(), timeoutMilliseconds: 0) {
        check(true, "release after losing the target relinquishes the physical input lock")
      }
    } catch {
      check(false, "owned input and cleanup work with mixed focus: \(error)")
    }
  }
}
