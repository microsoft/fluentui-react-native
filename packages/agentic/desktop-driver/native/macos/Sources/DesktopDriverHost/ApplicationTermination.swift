import AppKit
import Darwin
import Foundation

/// How long ending an owned process waits at each stage before it escalates or gives up.
struct TerminationBounds {
  let quitMilliseconds: Int
  let killMilliseconds: Int

  /// A caller's `closeApplication` or `dispose`: the application may need time to quit on its own.
  static let close = TerminationBounds(quitMilliseconds: 5_000, killMilliseconds: 3_000)
  /// A launch that failed or was cancelled. The application never reached the caller, and Node allows a helper about
  /// two seconds to acknowledge a cancellation, so this finishes well inside that.
  static let abandoned = TerminationBounds(quitMilliseconds: 400, killMilliseconds: 1_100)
  /// A launch that completed after its request ended. Nothing waits for it, so it may take longer.
  static let late = TerminationBounds(quitMilliseconds: 2_000, killMilliseconds: 3_000)
}

/// The operating-system calls that end a process, replaceable by self-tests.
struct ProcessControl {
  var observe: (pid_t) -> ApplicationIncarnation.Observation
  var requestQuit: (pid_t) -> Void
  var forceKill: (pid_t) -> Void

  static let system = ProcessControl(
    observe: { ApplicationIncarnation.observe($0) },
    requestQuit: { pid in
      // A process Launch Services does not know, such as a bare executable that never registered, still takes SIGTERM.
      if let application = NSRunningApplication(processIdentifier: pid) {
        _ = application.terminate()
      } else {
        _ = kill(pid, SIGTERM)
      }
    },
    forceKill: { pid in
      _ = kill(pid, SIGKILL)
    }
  )
}

/// Ends the process a lease or a launch owns and proves it exited: verify the incarnation, ask it to quit, wait,
/// kill it, wait, and verify again. It returns only when the process is gone (or its id now names a later process).
/// Anything it cannot prove throws, so the caller keeps the lease instead of claiming an exit that did not happen.
///
/// A `token` makes the waits cancellable; cleanup after a failure passes none so it still finishes.
func terminateOwned(
  processID: pid_t,
  startedAt: Date,
  bounds: TerminationBounds,
  token: CancellationToken? = nil,
  control: ProcessControl = .system,
  exactStartedAt: String? = nil,
  observeExact: (pid_t) -> ApplicationIncarnation.ExactObservation = ApplicationIncarnation.observeExact
) throws {
  func state() -> ApplicationIncarnation.State {
    if let exactStartedAt {
      return ApplicationIncarnation.classifyExact(recorded: exactStartedAt, observed: observeExact(processID))
    }
    return ApplicationIncarnation.classify(recorded: startedAt, observed: control.observe(processID))
  }
  func waitForExit(milliseconds: Int) throws -> Bool {
    let deadline = DispatchTime.now() + .milliseconds(max(0, milliseconds))
    while true {
      if state() == .exited {
        return true
      }
      if DispatchTime.now() >= deadline {
        return false
      }
      if let token {
        try token.wait(milliseconds: 25)
      } else {
        usleep(25_000)
      }
    }
  }
  func requireIdentity() throws -> Bool {
    switch state() {
    case .exited:
      return false
    case .running:
      return true
    case .unknown:
      try fail(
        ErrorCode.automationFailed,
        "The application process could not be matched to the process the helper started, so the helper did not signal it."
      )
    }
  }

  guard try requireIdentity() else {
    return
  }
  control.requestQuit(processID)
  if try waitForExit(milliseconds: bounds.quitMilliseconds) {
    return
  }
  guard try requireIdentity() else {
    return
  }
  control.forceKill(processID)
  if try waitForExit(milliseconds: bounds.killMilliseconds) {
    return
  }
  try fail(ErrorCode.automationFailed, "The application process did not exit after it was asked to quit and then killed.")
}

/// Ends a process that was started for a launch request but never reached a lease. It reports whether the process is
/// proven gone, so the caller can say that a hung application survived instead of hiding it.
@discardableResult
func terminateUnleased(
  processID: pid_t,
  startedAt: String? = nil,
  bounds: TerminationBounds,
  control: ProcessControl = .system
) -> Bool {
  // Never adopt whichever incarnation happens to occupy a launch PID when cleanup eventually runs.
  guard let startedAt, let date = parseDate(startedAt), ServiceIdentity.isTimestamp(startedAt) else {
    return ApplicationIncarnation.observeExact(processID).isGone
  }
  do {
    try terminateOwned(
      processID: processID, startedAt: date, bounds: bounds, control: control, exactStartedAt: startedAt
    )
    return true
  } catch {
    writeDiagnostic("furn-desktop-driver-host: ending abandoned launch \(processID) failed: \(error)")
    return false
  }
}

extension ApplicationIncarnation.Observation {
  var isGone: Bool {
    if case .gone = self {
      return true
    }
    return false
  }
}

extension ApplicationIncarnation.ExactObservation {
  var isGone: Bool {
    if case .gone = self { return true }
    return false
  }
}
