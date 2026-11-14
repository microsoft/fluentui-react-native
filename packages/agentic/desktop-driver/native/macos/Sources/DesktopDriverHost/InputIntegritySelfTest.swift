import ApplicationServices
import Foundation

/// Stands in for the operating system under `InputController`: it records the events that would have been posted and
/// answers the pointer position from the last mouse event, so no real input ever reaches the machine.
final class InputRecorder: @unchecked Sendable {
  private let lock = NSLock()
  private var types: [CGEventType] = []
  private var scrolls: [(vertical: Int64, horizontal: Int64)] = []
  private var pointer: CGPoint = .zero
  private var pointerHidden = false
  private var permitted = true
  private var loginSession = InputRecorder.activeSession

  static let activeSession = LoginSessionState(values: [
    "kCGSSessionOnConsoleKey": true,
    "kCGSessionLoginDoneKey": true,
    "CGSSessionScreenIsLocked": false,
  ])

  var posted: [CGEventType] {
    lock.lock()
    defer { lock.unlock() }
    return types
  }

  func count(_ type: CGEventType) -> Int {
    posted.filter { $0 == type }.count
  }

  var scrollDeltas: [(vertical: Int64, horizontal: Int64)] {
    lock.lock()
    defer { lock.unlock() }
    return scrolls
  }

  func configure(trusted: Bool? = nil, session: LoginSessionState? = nil, hidePointer: Bool = false) {
    lock.lock()
    defer { lock.unlock() }
    if let trusted {
      permitted = trusted
    }
    if let session {
      loginSession = session
    }
    if hidePointer {
      pointerHidden = true
    }
  }

  var environment: InputEnvironment {
    InputEnvironment(
      post: { [self] event in
        lock.lock()
        defer { lock.unlock() }
        types.append(event.type)
        switch event.type {
        case .mouseMoved, .leftMouseDown, .leftMouseUp, .leftMouseDragged, .rightMouseDown, .rightMouseUp,
          .rightMouseDragged, .otherMouseDown, .otherMouseUp, .otherMouseDragged:
          pointer = event.location
        case .scrollWheel:
          scrolls.append((
            vertical: event.getIntegerValueField(.scrollWheelEventPointDeltaAxis1),
            horizontal: event.getIntegerValueField(.scrollWheelEventPointDeltaAxis2)
          ))
        default:
          break
        }
      },
      isTrusted: { [self] in
        lock.lock()
        defer { lock.unlock() }
        return permitted
      },
      session: { [self] in
        lock.lock()
        defer { lock.unlock() }
        return loginSession
      },
      pointerLocation: { [self] in
        lock.lock()
        defer { lock.unlock() }
        return pointerHidden ? nil : pointer
      }
    )
  }
}

extension SelfTestRunner {
  func testInputIntegrity() {
    let target = CGPoint(x: 120, y: 80)

    // A move that only places the pointer is idempotent and must not count.
    do {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      let input = InputController(effects: ledger, environment: recorder.environment)
      do {
        try input.movePointer(to: target, durationMilliseconds: 0, token: CancellationToken())
        check(
          recorder.count(.mouseMoved) == 1 && ledger.effect == .noEffect,
          "a bare pointer move is posted but leaves no effect behind"
        )
      } catch {
        check(false, "a bare pointer move succeeds: \(error)")
      }
    }

    do {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      var environment = recorder.environment
      let readPointer = environment.pointerLocation
      var reads = 0
      environment.pointerLocation = {
        reads += 1
        return reads < 4 ? .zero : readPointer()
      }
      let input = InputController(effects: ledger, environment: environment)
      do {
        try input.movePointer(to: target, durationMilliseconds: 0, token: CancellationToken())
        check(
          reads >= 4 && recorder.count(.mouseMoved) == 1 && ledger.effect == .noEffect,
          "pointer placement waits for delayed OS acknowledgment without posting the move again"
        )
      } catch {
        check(false, "delayed pointer acknowledgment succeeds without replay: \(error)")
      }
    }

    do {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      let token = CancellationToken()
      var environment = recorder.environment
      var reads = 0
      environment.pointerLocation = {
        reads += 1
        if reads > 1 { token.cancel() }
        return .zero
      }
      let input = InputController(effects: ledger, environment: environment)
      do {
        try input.click(at: target, token: token)
        check(false, "cancellation while waiting for pointer placement stops the click")
      } catch is CancelledError {
        check(
          recorder.count(.mouseMoved) == 1 && recorder.count(.leftMouseDown) == 0
            && ledger.effect == .noEffect,
          "cancellation during pointer acknowledgment never posts a button press or replays motion"
        )
      } catch {
        check(false, "pointer acknowledgment preserves cancellation: \(error)")
      }
    }

    // A button press, a drag with the button held, and the release all count; a cancelled click is not "none".
    do {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      let input = InputController(effects: ledger, environment: recorder.environment)
      let token = CancellationToken()
      do {
        try input.movePointer(to: target, durationMilliseconds: 0, token: token)
        try input.pointerDown(0, token: token)
        check(ledger.effect == .partial, "a posted button press counts as an applied effect")
        ledger.reset()
        try input.movePointer(to: CGPoint(x: 160, y: 90), durationMilliseconds: 0, token: token)
        check(
          recorder.count(.leftMouseDragged) == 1 && ledger.effect == .partial,
          "a pointer move with a button held is a counted drag"
        )
        ledger.reset()
        try input.pointerUp(0, token: token)
        check(
          recorder.count(.leftMouseUp) == 1 && ledger.effect == .partial && !input.hasDepressedInput,
          "a posted button release counts and clears the held button"
        )
      } catch {
        check(false, "a press, drag and release sequence succeeds: \(error)")
      }
    }

    do {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      let input = InputController(effects: ledger, environment: recorder.environment)
      let token = CancellationToken()
      do {
        try input.movePointer(to: target, durationMilliseconds: 0, token: token)
        try input.pointerDown(0, token: token)
        token.cancel()
        var cancelled = false
        do {
          try input.pointerUp(0, token: token)
        } catch is CancelledError {
          cancelled = true
        }
        check(cancelled, "a cancelled button release stops before posting")
        check(
          ledger.effect == .partial && input.depressedButtonCount == 1,
          "a click cancelled between press and release reports a partial effect, not none"
        )
        input.releaseAll()
        check(
          recorder.count(.leftMouseUp) == 1 && ledger.effect == .partial && !input.hasDepressedInput,
          "releasing after a cancelled click posts the release without changing the reported effect"
        )
      } catch {
        check(false, "a cancelled click scenario runs: \(error)")
      }
    }

    // Keys and wheel ticks still count.
    do {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      let input = InputController(effects: ledger, environment: recorder.environment)
      let token = CancellationToken()
      do {
        try input.keyDown("a", token: token)
        check(ledger.effect == .partial, "a posted key press counts")
        try input.keyUp("a", token: token)
        ledger.reset()
        try input.wheel(deltaX: 0, deltaY: 10, token: token)
        check(
          recorder.count(.scrollWheel) == 1 && ledger.effect == .partial,
          "a posted wheel tick counts"
        )
        // Quartz scrolls up and left with positive values; the protocol scrolls down and right.
        try input.wheel(deltaX: 7, deltaY: 10, token: token)
        let delta = recorder.scrollDeltas.last
        check(
          delta?.vertical == -10 && delta?.horizontal == -7,
          "a positive wheel delta scrolls down and right: \(String(describing: delta))"
        )
      } catch {
        check(false, "key and wheel input succeed: \(error)")
      }
    }

    // An unreadable pointer position leaves a move unverified, so it fails instead of passing.
    do {
      let recorder = InputRecorder()
      recorder.configure(hidePointer: true)
      let input = InputController(effects: EffectLedger(), environment: recorder.environment)
      do {
        try input.movePointer(to: target, durationMilliseconds: 0, token: CancellationToken())
        check(false, "a move whose pointer position cannot be read fails")
      } catch let error as HelperError {
        check(error.code == ErrorCode.inputFailed, "a move whose pointer position cannot be read fails as input-failed")
      } catch {
        check(false, "a move whose pointer position cannot be read fails with a helper error: \(error)")
      }
    }

    // A login session the helper cannot read fails closed for new input but never blocks a release.
    do {
      let recorder = InputRecorder()
      let input = InputController(effects: EffectLedger(), environment: recorder.environment)
      let token = CancellationToken()
      do {
        try input.movePointer(to: target, durationMilliseconds: 0, token: token)
        try input.pointerDown(0, token: token)
        recorder.configure(session: LoginSessionState(values: nil))
        do {
          try input.movePointer(to: CGPoint(x: 200, y: 200), durationMilliseconds: 0, token: token)
          check(false, "input fails when the login session cannot be read")
        } catch let error as HelperError {
          check(
            error.code == ErrorCode.inputUnavailable,
            "input fails closed as input-unavailable when the login session cannot be read"
          )
        }
        input.releaseAll()
        check(
          recorder.count(.leftMouseUp) == 1 && !input.hasDepressedInput,
          "a release is still posted when the login session cannot be read"
        )
      } catch {
        check(false, "the unreadable-session scenario runs: \(error)")
      }
    }

    check(
      LoginSessionState(values: nil).inputUnavailableReason != nil
        && LoginSessionState(values: nil).unavailableReason == nil
        && InputRecorder.activeSession.inputUnavailableReason == nil,
      "an unreadable login session blocks physical input while an active one does not"
    )
  }
}
