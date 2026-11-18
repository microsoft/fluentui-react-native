import Darwin
import Foundation

extension SelfTestRunner {
  func testEmptyInputRecovery() {
    let directory = FileManager.default.temporaryDirectory.appendingPathComponent("furn-input-recovery-\(UUID().uuidString)")
    defer { try? FileManager.default.removeItem(at: directory) }
    let baseName = "input"
    let lockURL = directory.appendingPathComponent("\(baseName).lock")
    let ownerURL = directory.appendingPathComponent("\(baseName).owner.json")
    let ownerID = UUID().uuidString
    let lock = PhysicalInputLock(baseName: baseName, directory: directory, recoveryID: ownerID)
    let recorder = InputRecorder()
    let input = InputController(environment: recorder.environment)
    let ledger = ReleaseLedger(keys: [], buttons: [])
    let token = CancellationToken()

    do {
      try FileManager.default.createDirectory(at: directory, withIntermediateDirectories: false, attributes: [.posixPermissions: 0o700])
      // The child inherits the locked file description through stdin. It cannot post any input.
      var fd = open(lockURL.path, O_CREAT | O_RDWR | O_CLOEXEC, S_IRUSR | S_IWUSR)
      defer { if fd >= 0 { close(fd) } }
      guard fd >= 0, flock(fd, LOCK_EX | LOCK_NB) == 0 else {
        check(false, "the private input fixture obtains a lock")
        return
      }
      let child = Process()
      child.executableURL = URL(fileURLWithPath: "/bin/sleep")
      child.arguments = ["30"]
      child.standardInput = FileHandle(fileDescriptor: fd, closeOnDealloc: false)
      try child.run()
      defer {
        if child.isRunning { kill(child.processIdentifier, SIGKILL) }
        child.waitUntilExit()
      }
      close(fd)
      fd = -1
      let pid = child.processIdentifier
      guard let startedAt = processStartTime(pid) else {
        check(false, "the input lock fixture has a readable start time")
        return
      }
      let receipt = try JSONEncoder().encode(InputLockOwner(pid: pid, processStartedAt: formatDate(startedAt), recoveryID: ownerID))
      try receipt.write(to: ownerURL)

      do {
        try lock.withLock(token: token, timeoutMilliseconds: 0) {}
        check(false, "the fixture child still holds the input lock")
      } catch let error as HelperError {
        check(
          error.code == ErrorCode.inputBusy && error.message.contains("held physical input")
            && error.message.contains("PID \(pid)") && error.message.contains("--release-input"),
          "input-busy names the live lock owner PID and recovery command"
        )
      }
      let began = DispatchTime.now()
      let counts = try input.recoverInput(ledger, lock: lock, token: token)
      check(
        counts.keys == 0 && counts.buttons == 0 && DispatchTime.now() < began + .seconds(1)
          && (try? Data(contentsOf: ownerURL)) == receipt,
        "empty recovery returns promptly without changing another process's live lock or owner record"
      )

      kill(pid, SIGKILL)
      child.waitUntilExit()
      check(child.terminationReason == .uncaughtSignal && child.terminationStatus == SIGKILL, "the isolated lock holder is killed")

      for (label, recoveryID, trusted) in [
        ("a different owner", UUID().uuidString, true),
        ("masked input", "", true),
        ("unavailable input", ownerID, false),
      ] {
        recorder.configure(trusted: trusted)
        let recovery = PhysicalInputLock(baseName: baseName, directory: directory, recoveryID: recoveryID)
        let result = try input.recoverInput(ledger, lock: recovery, token: token)
        check(
          result.keys == 0 && result.buttons == 0 && (try? Data(contentsOf: ownerURL)) == receipt,
          "empty recovery for \(label) succeeds without deleting the crashed owner's record"
        )
      }
      recorder.configure(trusted: true)
      let released = try input.recoverInput(ledger, lock: lock, token: token)
      check(
        released.keys == 0 && released.buttons == 0 && !FileManager.default.fileExists(atPath: ownerURL.path),
        "empty recovery for the exact crashed owner deletes the stale record"
      )
      try lock.withLock(token: token, timeoutMilliseconds: 0) {
        check(true, "the next normal acquirer succeeds without manual recovery")
      }

      guard let liveStart = processStartTime(getpid()) else {
        check(false, "the self-test has a readable start time")
        return
      }
      let liveReceipt = try JSONEncoder().encode(
        InputLockOwner(pid: getpid(), processStartedAt: formatDate(liveStart), recoveryID: ownerID)
      )
      try liveReceipt.write(to: ownerURL)
      _ = try input.recoverInput(ledger, lock: lock, token: token)
      check(
        (try? Data(contentsOf: ownerURL)) == liveReceipt,
        "a matching record for a live process stays fenced even when the kernel lock is idle"
      )
      let unknownReceipt = try JSONEncoder().encode(InputLockOwner(pid: pid, processStartedAt: "unknown", recoveryID: ownerID))
      try unknownReceipt.write(to: ownerURL)
      _ = try input.recoverInput(ledger, lock: lock, token: token)
      check((try? Data(contentsOf: ownerURL)) == unknownReceipt, "a matching but unverifiable owner record stays fenced")
      check(recorder.posted.isEmpty, "empty-ledger recovery never posts input")
    } catch {
      check(false, "the isolated empty-ledger recovery scenarios succeed: \(error)")
    }
  }
}
