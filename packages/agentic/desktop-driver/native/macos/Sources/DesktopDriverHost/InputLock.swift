import Foundation
import Darwin

enum AbandonPolicy {
  case fail
  case adopt
}

struct InputLockOwner: Codable {
  let pid: Int32
  let processStartedAt: String
}

final class PhysicalInputLock: @unchecked Sendable {
  static let shared = PhysicalInputLock()

  private let stateLock = NSLock()
  private var depth = 0
  private var descriptor: Int32 = -1
  private let lockURL: URL
  private let ownerURL: URL

  private enum OwnerState {
    case missing
    case valid(InputLockOwner)
    case invalid
  }

  init(baseName: String = "furn-desktop-driver-physical-input-v1-\(getuid())") {
    let directory = FileManager.default.temporaryDirectory
    lockURL = directory.appendingPathComponent(baseName + ".lock", isDirectory: false)
    ownerURL = directory.appendingPathComponent(baseName + ".owner.json", isDirectory: false)
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
          try fail(
            ErrorCode.inputBusy,
            "Another desktop driver helper held physical input for longer than \(timeoutMilliseconds) ms. Wait for that session to finish, or run the helper with --release-input if it is gone."
          )
        }
        try token.wait(milliseconds: 50)
      }

      switch readOwner() {
      case let .valid(owner):
        let ownerStart = parseDate(owner.processStartedAt)
        let actualStart = processStartTime(owner.pid)
        let sameIdentity = ownerStart != nil && actualStart != nil
          && abs(ownerStart!.timeIntervalSince(actualStart!)) <= 0.01
        if processIsAlive(owner.pid) && sameIdentity {
          try fail(
            ErrorCode.inputBusy,
            "The physical input owner record still names a live desktop driver helper. Wait for it to finish before retrying."
          )
        }
        if policy == .fail {
          try fail(
            ErrorCode.inputBusy,
            "A previous desktop driver helper terminated while holding physical input, so keys or buttons may still be depressed. Run the helper with --release-input to recover, then retry the command."
          )
        }
        writeDiagnostic("furn-desktop-driver-host: adopting physical input abandoned by a terminated helper.")
      case .invalid:
        if policy == .fail {
          try fail(
            ErrorCode.inputBusy,
            "The physical input owner record is invalid, so prior input cleanup cannot be proven. Run the helper with --release-input to recover, then retry the command."
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

  private func readOwner() -> OwnerState {
    guard FileManager.default.fileExists(atPath: ownerURL.path) else {
      return .missing
    }
    guard let data = try? Data(contentsOf: ownerURL), !data.isEmpty, data.count <= 4096 else {
      return .invalid
    }
    guard let owner = try? JSONDecoder().decode(InputLockOwner.self, from: data) else {
      return .invalid
    }
    return .valid(owner)
  }

  private func writeOwner() throws {
    guard let start = processStartTime(getpid()) else {
      try fail(ErrorCode.inputBusy, "The helper could not read its process start time for physical input ownership.")
    }
    let owner = InputLockOwner(pid: getpid(), processStartedAt: formatDate(start))
    do {
      let data = try JSONEncoder().encode(owner)
      try data.write(to: ownerURL, options: [.atomic])
      try FileManager.default.setAttributes([.posixPermissions: 0o600], ofItemAtPath: ownerURL.path)
    } catch {
      try fail(ErrorCode.inputBusy, "Writing the physical input owner record failed: \(error.localizedDescription)")
    }
  }

  func installDeadOwnerForSelfTest() throws {
    let owner = InputLockOwner(pid: Int32.max, processStartedAt: "1970-01-01T00:00:00.000Z")
    try JSONEncoder().encode(owner).write(to: ownerURL, options: [.atomic])
  }

  func cleanupSelfTestFiles() {
    try? FileManager.default.removeItem(at: ownerURL)
    try? FileManager.default.removeItem(at: lockURL)
  }
}
