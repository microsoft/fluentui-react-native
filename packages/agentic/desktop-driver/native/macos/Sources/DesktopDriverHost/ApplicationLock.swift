import Darwin
import Foundation

/// One controlling helper for an exact application incarnation, independent of checkouts and TMPDIR.
final class ExactApplicationLock: @unchecked Sendable {
  private var descriptor: Int32

  private init(_ descriptor: Int32) {
    self.descriptor = descriptor
  }

  static func acquire(processID: pid_t, startedAt: String) throws -> ExactApplicationLock {
    guard ServiceIdentity.isTimestamp(startedAt) else {
      try fail(ErrorCode.leaseInvalid, "Application exclusion requires an exact native process identity.")
    }
    let root = URL(fileURLWithPath: NSHomeDirectory(), isDirectory: true)
      .appendingPathComponent("Library/Caches/com.microsoft.fluentui-react-native.desktop-driver/applications", isDirectory: true)
    do {
      try FileManager.default.createDirectory(at: root, withIntermediateDirectories: true, attributes: [.posixPermissions: 0o700])
    } catch {
      try fail(ErrorCode.attachFailed, "The per-user application exclusion directory could not be created.")
    }
    var directory = stat()
    guard lstat(root.path, &directory) == 0,
      directory.st_uid == getuid(),
      directory.st_mode & S_IFMT == S_IFDIR,
      directory.st_mode & 0o077 == 0
    else {
      try fail(ErrorCode.attachFailed, "The application exclusion directory is not an owner-only directory.")
    }
    let stamp = startedAt.filter { $0.isASCII && $0.isNumber }
    let filename = root.appendingPathComponent("\(processID)-\(stamp).lock")
    let fd = open(filename.path, O_CREAT | O_RDWR | O_CLOEXEC | O_NOFOLLOW, S_IRUSR | S_IWUSR)
    guard fd >= 0 else {
      try fail(ErrorCode.attachFailed, "The application exclusion record could not be opened.")
    }
    var info = stat()
    guard fstat(fd, &info) == 0, info.st_uid == getuid(), info.st_mode & S_IFMT == S_IFREG,
      info.st_mode & 0o077 == 0, info.st_nlink == 1
    else {
      close(fd)
      try fail(ErrorCode.attachFailed, "The application exclusion record is not an owner-only regular file.")
    }
    guard flock(fd, LOCK_EX | LOCK_NB) == 0 else {
      close(fd)
      try fail(ErrorCode.attachFailed, "Another desktop service controls this exact application incarnation.")
    }
    return ExactApplicationLock(fd)
  }

  func release() {
    if descriptor < 0 { return }
    _ = flock(descriptor, LOCK_UN)
    close(descriptor)
    descriptor = -1
  }

  deinit { release() }
}
