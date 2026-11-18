import Foundation
import Darwin

enum AbandonPolicy {
  case fail
  case adopt
}

struct InputLockOwner: Codable {
  let pid: Int32
  let processStartedAt: String
  let recoveryID: String?
}

final class PhysicalInputLock: @unchecked Sendable {
  static let shared = PhysicalInputLock(
    recoveryID: ProcessInfo.processInfo.environment["FURN_INTERNAL_DESKTOP_DRIVER_INPUT_LOCK_OWNER"]
  )

  private let stateLock = NSLock()
  private var depth = 0
  private var descriptor: Int32 = -1
  private let lockDirectory: URL
  private let lockURL: URL
  private let ownerURL: URL
  private let recoveryID: String?

  private enum OwnerState {
    case missing
    case valid(InputLockOwner)
    case invalid
  }

  init(
    baseName: String = "furn-desktop-driver-physical-input-v1-\(getuid())",
    directory: URL? = nil,
    recoveryID: String? = nil
  ) {
    lockDirectory = directory ?? URL(fileURLWithPath: NSHomeDirectory(), isDirectory: true)
      .appendingPathComponent("Library/Caches/com.microsoft.fluentui-react-native.desktop-driver", isDirectory: true)
    lockURL = lockDirectory.appendingPathComponent(baseName + ".lock", isDirectory: false)
    ownerURL = lockDirectory.appendingPathComponent(baseName + ".owner.json", isDirectory: false)
    self.recoveryID = recoveryID
  }

  func withLock<T>(
    token: CancellationToken,
    timeoutMilliseconds: Int = 30_000,
    policy: AbandonPolicy = .fail,
    _ body: () throws -> T
  ) throws -> T {
    try acquire(token: token, timeoutMilliseconds: timeoutMilliseconds, policy: policy)
    defer { release() }
    return try body()
  }

  func acquire(token: CancellationToken, timeoutMilliseconds: Int, policy: AbandonPolicy) throws {
    stateLock.lock()
    if depth > 0 {
      depth += 1
      stateLock.unlock()
      return
    }
    stateLock.unlock()

    do {
      try FileManager.default.createDirectory(
        at: lockDirectory,
        withIntermediateDirectories: true,
        attributes: [.posixPermissions: 0o700]
      )
      try FileManager.default.setAttributes([.posixPermissions: 0o700], ofItemAtPath: lockDirectory.path)
    } catch {
      try fail(ErrorCode.inputBusy, "Creating the physical input lock directory failed: \(error.localizedDescription)")
    }
    let fd = open(lockURL.path, O_CREAT | O_RDWR | O_CLOEXEC, S_IRUSR | S_IWUSR)
    guard fd >= 0 else {
      try fail(ErrorCode.inputBusy, "Creating the physical input lock failed with errno \(errno).")
    }
    let deadline = DispatchTime.now() + .milliseconds(timeoutMilliseconds)
    do {
      while flock(fd, LOCK_EX | LOCK_NB) != 0 {
        if errno != EWOULDBLOCK && errno != EAGAIN {
          try fail(ErrorCode.inputBusy, "Acquiring the physical input lock failed with errno \(errno).")
        }
        try token.throwIfCancelled()
        if DispatchTime.now() >= deadline {
          var holder = "Another desktop driver helper"
          if case let .valid(owner) = readOwner() {
            holder += " (recorded PID \(owner.pid))"
          }
          try fail(
            ErrorCode.inputBusy,
            "\(holder) held physical input for longer than \(timeoutMilliseconds) ms. Wait for that session to finish, or run the helper with --release-input if it is gone."
          )
        }
        try token.wait(milliseconds: 50)
      }

      switch readOwner() {
      case let .valid(owner):
        guard ownerState(owner) == .exited else {
          try fail(
            ErrorCode.inputBusy,
            "The physical input owner record names PID \(owner.pid), which is live or cannot be verified as exited. Wait for it to finish before running the helper with --release-input."
          )
        }
        if policy == .fail {
          try fail(
            ErrorCode.inputBusy,
            "Desktop driver helper PID \(owner.pid) terminated while holding physical input, so keys or buttons may still be depressed. Run the helper with --release-input to recover, then retry the command."
          )
        }
        writeDiagnostic("furn-desktop-driver-host: adopting physical input abandoned by a terminated helper.")
      case .invalid:
        if policy == .fail {
          try fail(
            ErrorCode.inputBusy,
            "The physical input owner record is invalid, so prior input cleanup cannot be proven. Use --release-input with a known ledger, or --release-input --sweep after confirming no live owner."
          )
        }
        writeDiagnostic("furn-desktop-driver-host: adopting an invalid physical input owner record for recovery.")
      case .missing:
        break
      }

      try writeOwner()
      stateLock.lock()
      descriptor = fd
      depth = 1
      stateLock.unlock()
    } catch {
      _ = flock(fd, LOCK_UN)
      close(fd)
      throw error
    }
  }

  func release() {
    stateLock.lock()
    guard depth > 0 else {
      stateLock.unlock()
      return
    }
    depth -= 1
    if depth > 0 {
      stateLock.unlock()
      return
    }
    let fd = descriptor
    descriptor = -1
    stateLock.unlock()

    try? FileManager.default.removeItem(at: ownerURL)
    _ = flock(fd, LOCK_UN)
    close(fd)
  }

  func recoverAbandonedOwner() throws {
    // A masked supervisor supplies an empty tag. With no tag, an operator can recover a proven-dead owner.
    guard recoveryID != "" else { return }
    let fd = open(lockURL.path, O_RDWR | O_CLOEXEC | O_NOFOLLOW)
    guard fd >= 0 else {
      if errno == ENOENT { return }
      try fail(ErrorCode.inputBusy, "Opening the physical input lock for recovery failed with errno \(errno).")
    }
    defer { close(fd) }
    guard flock(fd, LOCK_EX | LOCK_NB) == 0 else {
      if errno == EWOULDBLOCK || errno == EAGAIN { return }
      try fail(ErrorCode.inputBusy, "Checking the physical input lock for recovery failed with errno \(errno).")
    }
    // Observe and remove under the same kernel lock. Never overwrite another session's recovery fence.
    guard case let .valid(owner) = readOwner(),
      recoveryID == nil || recoveryID == owner.recoveryID,
      ownerState(owner) == .exited
    else { return }
    try FileManager.default.removeItem(at: ownerURL)
  }

  private func ownerState(_ owner: InputLockOwner) -> ApplicationIncarnation.State {
    guard let start = parseDate(owner.processStartedAt) else { return .unknown }
    return ApplicationIncarnation.classify(recorded: start, observed: ApplicationIncarnation.observe(owner.pid))
  }

  private func readOwner() -> OwnerState {
    let fd = open(ownerURL.path, O_RDONLY | O_CLOEXEC | O_NOFOLLOW | O_NONBLOCK)
    guard fd >= 0 else {
      return errno == ENOENT ? .missing : .invalid
    }
    let handle = FileHandle(fileDescriptor: fd, closeOnDealloc: true)
    var status = stat()
    guard fstat(fd, &status) == 0, (status.st_mode & S_IFMT) == S_IFREG,
      let data = try? handle.read(upToCount: 4097), !data.isEmpty, data.count <= 4096
    else {
      return .invalid
    }
    guard let owner = try? JSONDecoder().decode(InputLockOwner.self, from: data), owner.pid > 0 else {
      return .invalid
    }
    return .valid(owner)
  }

  private func writeOwner() throws {
    guard let start = processStartTime(getpid()) else {
      try fail(ErrorCode.inputBusy, "The helper could not read its process start time for physical input ownership.")
    }
    let owner = InputLockOwner(pid: getpid(), processStartedAt: formatDate(start), recoveryID: recoveryID)
    do {
      let data = try JSONEncoder().encode(owner)
      try data.write(to: ownerURL, options: [.atomic])
      try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: ownerURL.path)
    } catch {
      try fail(ErrorCode.inputBusy, "Writing the physical input owner record failed: \(error.localizedDescription)")
    }
  }

  func installDeadOwnerForSelfTest() throws {
    let owner = InputLockOwner(pid: Int32.max, processStartedAt: "1970-01-01T00:00:00.000Z", recoveryID: recoveryID)
    try JSONEncoder().encode(owner).write(to: ownerURL, options: [.atomic])
  }

  func cleanupSelfTestFiles() {
    try? FileManager.default.removeItem(at: ownerURL)
    try? FileManager.default.removeItem(at: lockURL)
  }
}
