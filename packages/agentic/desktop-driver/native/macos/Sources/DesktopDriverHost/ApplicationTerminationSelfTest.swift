import Darwin
import Foundation

/// A process whose exit the test controls, standing in for the operating-system calls `terminateOwned` makes.
private final class FakeProcess: @unchecked Sendable {
  private let lock = NSLock()
  private let startedAt: Date
  private var running: Bool
  private let exitsOnQuit: Bool
  private let exitsOnKill: Bool
  private let readable: Bool
  private let reused: Bool
  private var quitCalls = 0
  private var killCalls = 0

  init(
    startedAt: Date,
    running: Bool = true,
    exitsOnQuit: Bool = false,
    exitsOnKill: Bool = false,
    readable: Bool = true,
    reused: Bool = false
  ) {
    self.startedAt = startedAt
    self.running = running
    self.exitsOnQuit = exitsOnQuit
    self.exitsOnKill = exitsOnKill
    self.readable = readable
    self.reused = reused
  }

  var quits: Int { locked { quitCalls } }
  var kills: Int { locked { killCalls } }

  private func locked<T>(_ body: () -> T) -> T {
    lock.lock()
    defer { lock.unlock() }
    return body()
  }

  var control: ProcessControl {
    ProcessControl(
      observe: { [self] _ in
        locked {
          if !readable {
            return .unavailable
          }
          if reused {
            return .started(startedAt.addingTimeInterval(30))
          }
          return running ? .started(startedAt) : .gone
        }
      },
      requestQuit: { [self] _ in
        locked {
          quitCalls += 1
          if exitsOnQuit {
            running = false
          }
        }
      },
      forceKill: { [self] _ in
        locked {
          killCalls += 1
          if exitsOnKill {
            running = false
          }
        }
      }
    )
  }
}

extension SelfTestRunner {
  func testApplicationTermination() {
    let started = Date(timeIntervalSince1970: 1_700_000_000.25)
    let bounds = TerminationBounds(quitMilliseconds: 80, killMilliseconds: 80)

    func attempt(_ process: FakeProcess, token: CancellationToken? = nil) -> Error? {
      do {
        try terminateOwned(processID: 4242, startedAt: started, bounds: bounds, token: token, control: process.control)
        return nil
      } catch {
        return error
      }
    }

    let gone = FakeProcess(startedAt: started, running: false)
    check(
      attempt(gone) == nil && gone.quits == 0 && gone.kills == 0,
      "ending an already exited process succeeds without signalling it"
    )

    let reused = FakeProcess(startedAt: started, reused: true)
    check(
      attempt(reused) == nil && reused.quits == 0 && reused.kills == 0,
      "a process id reused by a later process counts as exited and is never signalled"
    )

    let polite = FakeProcess(startedAt: started, exitsOnQuit: true)
    check(
      attempt(polite) == nil && polite.quits == 1 && polite.kills == 0,
      "a process that quits when asked is not killed"
    )

    let stubborn = FakeProcess(startedAt: started, exitsOnKill: true)
    check(
      attempt(stubborn) == nil && stubborn.quits == 1 && stubborn.kills == 1,
      "a process that ignores the quit request is killed and then proven gone"
    )

    let immortal = FakeProcess(startedAt: started)
    let survivor = attempt(immortal)
    check(
      (survivor as? HelperError)?.code == ErrorCode.automationFailed && immortal.quits == 1 && immortal.kills == 1,
      "a process that survives the kill fails the close so the lease is kept"
    )

    let unknown = FakeProcess(startedAt: started, readable: false)
    check(
      (attempt(unknown) as? HelperError)?.code == ErrorCode.automationFailed && unknown.quits == 0 && unknown.kills == 0,
      "a process whose identity cannot be proven is neither signalled nor reported closed"
    )

    let cancelled = CancellationToken()
    cancelled.cancel()
    let interrupted = FakeProcess(startedAt: started)
    check(
      attempt(interrupted, token: cancelled) is CancelledError && interrupted.kills == 0,
      "a cancelled close stops waiting before it escalates to a kill"
    )

    testRealProcessTermination()
  }

  private func testRealProcessTermination() {
    func spawn(_ script: String) -> Process? {
      let process = Process()
      process.executableURL = URL(fileURLWithPath: "/bin/sh")
      process.arguments = ["-c", script]
      do {
        try process.run()
        return process
      } catch {
        return nil
      }
    }
    func reap(_ process: Process) {
      if process.isRunning {
        kill(process.processIdentifier, SIGKILL)
      }
      process.waitUntilExit()
    }

    guard let polite = spawn("exec sleep 60") else {
      check(false, "the self-test can start a child process")
      return
    }
    defer { reap(polite) }
    let politeID = polite.processIdentifier
    let politeStart = processStartTime(politeID)
    check(politeStart != nil, "the start time of a running child is readable")
    if let politeStart {
      do {
        try terminateOwned(
          processID: politeID,
          startedAt: politeStart,
          bounds: TerminationBounds(quitMilliseconds: 3_000, killMilliseconds: 3_000)
        )
        check(ApplicationIncarnation.observe(politeID).isGone, "a real process that receives the quit request is proven gone")
      } catch {
        check(false, "a real process that receives the quit request is ended: \(error)")
      }
    }

    // A SIGTERM disposition of "ignore" survives exec, so this child can only be ended by the kill.
    guard let stubborn = spawn("trap '' TERM; exec sleep 60") else {
      check(false, "the self-test can start a SIGTERM-ignoring child process")
      return
    }
    defer { reap(stubborn) }
    let stubbornID = stubborn.processIdentifier
    // The shell has to reach `exec` before the ignore disposition is the one the signal meets.
    usleep(300_000)
    if let stubbornStart = processStartTime(stubbornID) {
      let began = Date()
      do {
        try terminateOwned(
          processID: stubbornID,
          startedAt: stubbornStart,
          bounds: TerminationBounds(quitMilliseconds: 250, killMilliseconds: 3_000)
        )
        check(ApplicationIncarnation.observe(stubbornID).isGone, "a real process that ignores the quit request is killed and proven gone")
        check(Date().timeIntervalSince(began) >= 0.2, "the kill waits for the quit period to elapse first")
      } catch {
        check(false, "a real process that ignores the quit request is ended: \(error)")
      }
      check(
        terminateUnleased(processID: stubbornID, bounds: .abandoned),
        "ending an unleased process that already exited reports it gone"
      )
    } else {
      check(false, "the start time of a SIGTERM-ignoring child is readable")
    }
  }
}
