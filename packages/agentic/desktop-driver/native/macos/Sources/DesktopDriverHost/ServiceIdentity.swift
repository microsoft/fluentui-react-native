import Darwin
import Foundation

// The `--service-identity` mode: describes a Desktop Driver service process, or verifies that a recorded service still
// runs as the current user in this audit session and serves its loopback address exclusively. The answer carries only
// fixed reason tokens and fixed details, never paths or other process data from a refusal.
//
// Listeners of other users are outside what an unprivileged process can enumerate. The verifier relies on XNU refusing
// another user's bind to an address held by a listener without SO_REUSEPORT, so it refuses any matching listener that
// has SO_REUSEPORT. Root and administrators remain outside this boundary.

enum ServiceIdentity {
  static let maximumRequestBytes = 128 * 1024
  private static let maximumTableAttempts = 4

  struct Refusal: Error {
    let reason: String
    let detail: String
  }

  struct MalformedRequest: Error {}

  enum Family: Equatable {
    case ipv4
    case ipv6
  }

  struct Endpoint: Equatable {
    let family: Family
    let port: UInt16
  }

  struct Listener: Equatable {
    let pid: pid_t
    let family: Family
    /// The local address, 4 bytes for IPv4 and 16 for IPv6.
    let address: [UInt8]
    let port: UInt16
    let reusePort: Bool
  }

  struct Inspection {
    let pid: pid_t
    let startedAt: String
    let executablePath: String
    let auditSession: Int32
    let pidVersion: Int32
  }

  // MARK: Entry point

  static func run() -> Int32 {
    let answer = handle(readRequest())
    var line = (try? serializeJSON(answer)) ?? Data(#"{"ok":false,"reason":"request"}"#.utf8)
    line.append(0x0A)
    FileHandle.standardOutput.write(line)
    return (answer["ok"] as? Bool) == true ? 0 : 1
  }

  /// Reads standard input to its end, or nil when it fails or exceeds `limit` bytes.
  static func readRequest(limit: Int = maximumRequestBytes) -> Data? {
    var data = Data()
    while true {
      let chunk: Data?
      do {
        chunk = try FileHandle.standardInput.read(upToCount: 16 * 1024)
      } catch {
        return nil
      }
      // End of input reads as nil or as an empty chunk.
      guard let chunk, !chunk.isEmpty else {
        return data
      }
      data.append(chunk)
      if data.count > limit {
        return nil
      }
    }
  }

  static func handle(_ data: Data?) -> JSONObject {
    guard var data, !data.isEmpty else {
      return rejected()
    }
    if data.starts(with: [0xEF, 0xBB, 0xBF]) {
      data = data.dropFirst(3)
    }
    guard let request = (try? JSONSerialization.jsonObject(with: data, options: [])) as? JSONObject else {
      return rejected()
    }
    do {
      switch try requiredString(request, "operation") {
      case "describe":
        return try describe(request)
      case "verify":
        return try verify(request)
      default:
        return rejected()
      }
    } catch {
      return rejected()
    }
  }

  private static func rejected() -> JSONObject {
    ["ok": false, "reason": "request"]
  }

  // MARK: Operations

  private static func describe(_ request: JSONObject) throws -> JSONObject {
    let pid = try requiredPid(request, "pid")
    do {
      let inspection = try inspect(pid)
      return [
        "ok": true,
        "identity": [
          "platform": "macos",
          "pid": Int(pid),
          "startedAt": inspection.startedAt,
          "executablePath": inspection.executablePath,
          "interactiveSession": sessionLabel(inspection.auditSession),
        ] as JSONObject,
      ]
    } catch let refusal as Refusal {
      return ["ok": false, "reason": refusal.reason, "detail": refusal.detail]
    }
  }

  private static func verify(_ request: JSONObject) throws -> JSONObject {
    let url = try requiredString(request, "url")
    guard let service = request["service"] as? JSONObject else {
      throw MalformedRequest()
    }
    let platform = try requiredString(service, "platform")
    let pid = try requiredPid(service, "pid")
    let startedAt = try requiredString(service, "startedAt")
    let executablePath = try requiredString(service, "executablePath")
    let interactiveSession = try requiredString(service, "interactiveSession")
    _ = try requiredString(service, "incarnation")

    do {
      guard let destination = parseLoopbackURL(url) else {
        throw Refusal(reason: "url", detail: "The service address is not a numeric loopback http origin.")
      }
      guard platform == "macos", isTimestamp(startedAt) else {
        throw Refusal(reason: "claim", detail: "The service identity claim is not a macOS identity.")
      }
      let inspection = try inspect(pid)
      guard sameBytes(inspection.startedAt, startedAt) else {
        throw Refusal(reason: "start", detail: "The process start time differs from the claim.")
      }
      guard sameBytes(inspection.executablePath, executablePath) else {
        throw Refusal(reason: "image", detail: "The process executable differs from the claim.")
      }
      guard sameBytes(sessionLabel(inspection.auditSession), interactiveSession) else {
        throw Refusal(reason: "session", detail: "The process session differs from the claim.")
      }
      let listeners: [Listener]
      do {
        listeners = try readListeners()
      } catch let refusal as Refusal {
        throw refusal
      } catch {
        throw Refusal(reason: "listener", detail: "The listening sockets cannot be enumerated.")
      }
      guard listenersBelongTo(listeners, destination: destination, pid: pid) else {
        throw Refusal(reason: "listener", detail: "The address is not served exclusively by the process.")
      }
      // The identifier must still name the same process after the scan, so a reused identifier cannot pass.
      let after = try inspect(pid)
      guard after.pidVersion == inspection.pidVersion, sameBytes(after.startedAt, inspection.startedAt) else {
        throw Refusal(reason: "exited", detail: "The process has exited.")
      }
      return ["ok": true, "verified": true]
    } catch let refusal as Refusal {
      return ["ok": true, "verified": false, "reason": refusal.reason, "detail": refusal.detail]
    }
  }

  // MARK: Request fields

  private static func requiredString(_ object: JSONObject, _ key: String) throws -> String {
    guard let value = object[key] as? String else {
      throw MalformedRequest()
    }
    return value
  }

  static func requiredPid(_ object: JSONObject, _ key: String) throws -> pid_t {
    guard let number = object[key] as? NSNumber, CFGetTypeID(number) != CFBooleanGetTypeID() else {
      throw MalformedRequest()
    }
    let value = number.doubleValue
    guard value >= 1, value <= 2_147_483_647, value.rounded(.towardZero) == value else {
      throw MalformedRequest()
    }
    return pid_t(value)
  }

  /// Compares the UTF-8 bytes, since Swift string equality treats canonically equivalent strings as equal.
  static func sameBytes(_ left: String, _ right: String) -> Bool {
    left.utf8.elementsEqual(right.utf8)
  }

  // MARK: Formats

  static func parseLoopbackURL(_ url: String) -> Endpoint? {
    let ipv4Prefix = "http://127.0.0.1:"
    let ipv6Prefix = "http://[::1]:"
    let family: Family
    let digits: Substring
    if url.hasPrefix(ipv4Prefix) {
      family = .ipv4
      digits = url.dropFirst(ipv4Prefix.count)
    } else if url.hasPrefix(ipv6Prefix) {
      family = .ipv6
      digits = url.dropFirst(ipv6Prefix.count)
    } else {
      return nil
    }
    let bytes = Array(digits.utf8)
    guard !bytes.isEmpty, bytes.count <= 5, bytes[0] != 0x30 else {
      return nil
    }
    var port = 0
    for byte in bytes {
      guard byte >= 0x30, byte <= 0x39 else {
        return nil
      }
      port = port * 10 + Int(byte - 0x30)
    }
    guard port >= 1, port <= 65_535 else {
      return nil
    }
    return Endpoint(family: family, port: UInt16(port))
  }

  /// Formats a process start time as UTC ISO-8601 with microseconds, such as `2026-11-04T01:27:32.123456Z`.
  static func formatTimestamp(seconds: UInt64, microseconds: UInt64) -> String? {
    guard microseconds < 1_000_000, seconds <= UInt64(Int.max) else {
      return nil
    }
    var time = time_t(seconds)
    var parts = tm()
    guard gmtime_r(&time, &parts) != nil else {
      return nil
    }
    return String(
      format: "%04d-%02d-%02dT%02d:%02d:%02d.%06dZ",
      Int(parts.tm_year) + 1900,
      Int(parts.tm_mon) + 1,
      Int(parts.tm_mday),
      Int(parts.tm_hour),
      Int(parts.tm_min),
      Int(parts.tm_sec),
      Int(microseconds)
    )
  }

  /// Accepts exactly the shape `formatTimestamp` produces.
  static func isTimestamp(_ value: String) -> Bool {
    let bytes = Array(value.utf8)
    let separators: [Int: UInt8] = [4: 0x2D, 7: 0x2D, 10: 0x54, 13: 0x3A, 16: 0x3A, 19: 0x2E, 26: 0x5A]
    guard bytes.count == 27 else {
      return false
    }
    for (index, byte) in bytes.enumerated() {
      if let separator = separators[index] {
        guard byte == separator else {
          return false
        }
      } else if byte < 0x30 || byte > 0x39 {
        return false
      }
    }
    return true
  }

  static func sessionLabel(_ auditSession: Int32) -> String {
    "macos-session:\(auditSession)"
  }

  // MARK: Processes

  private static func bsdInfo(_ pid: pid_t) -> (info: proc_bsdinfo?, error: Int32) {
    var info = proc_bsdinfo()
    let size = Int32(MemoryLayout<proc_bsdinfo>.size)
    let read = proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, &info, size)
    return read == size ? (info, 0) : (nil, errno)
  }

  private static func ownAuditSession() throws -> Int32 {
    var info = auditinfo_addr()
    guard getaudit_addr(&info, Int32(MemoryLayout<auditinfo_addr>.size)) == 0, info.ai_asid > 0 else {
      throw Refusal(reason: "session", detail: "This verifier's audit session cannot be read.")
    }
    return info.ai_asid
  }

  private static func auditToken(_ pid: pid_t) -> audit_token_t? {
    var port: mach_port_name_t = 0
    guard task_name_for_pid(mach_task_self_, pid, &port) == KERN_SUCCESS else {
      return nil
    }
    defer { mach_port_deallocate(mach_task_self_, port) }
    var token = audit_token_t()
    var count = mach_msg_type_number_t(MemoryLayout<audit_token_t>.size / MemoryLayout<natural_t>.size)
    let status = withUnsafeMutablePointer(to: &token) { pointer in
      pointer.withMemoryRebound(to: integer_t.self, capacity: Int(count)) {
        task_info(port, task_flavor_t(TASK_AUDIT_TOKEN), $0, &count)
      }
    }
    return status == KERN_SUCCESS ? token : nil
  }

  /// Proves the process runs as the current user in this verifier's audit session and reads its identity.
  static func inspect(_ pid: pid_t) throws -> Inspection {
    let (read, error) = bsdInfo(pid)
    guard let info = read else {
      if error == ESRCH {
        throw Refusal(reason: "exited", detail: "No process has this identifier.")
      }
      if kill(pid, 0) != 0, errno == EPERM {
        throw Refusal(reason: "user", detail: "The process does not run as the current user.")
      }
      throw Refusal(reason: "process", detail: "The process state cannot be read.")
    }
    if info.pbi_status == UInt32(SZOMB) {
      throw Refusal(reason: "exited", detail: "The process has exited.")
    }
    let user = getuid()
    guard info.pbi_uid == user, info.pbi_ruid == user else {
      throw Refusal(reason: "user", detail: "The process does not run as the current user.")
    }
    guard let startedAt = formatTimestamp(seconds: info.pbi_start_tvsec, microseconds: info.pbi_start_tvusec) else {
      throw Refusal(reason: "process", detail: "The process start time cannot be read.")
    }
    var path = [CChar](repeating: 0, count: 4 * Int(MAXPATHLEN))
    guard proc_pidpath(pid, &path, UInt32(path.count)) > 0,
          let executablePath = String(validatingUTF8: path),
          executablePath.hasPrefix("/")
    else {
      throw Refusal(reason: "process", detail: "The executable path cannot be read.")
    }
    guard let token = auditToken(pid), audit_token_to_pid(token) == pid else {
      throw Refusal(reason: "process", detail: "The process audit token cannot be read.")
    }
    let auditSession = audit_token_to_asid(token)
    guard auditSession > 0, auditSession == (try ownAuditSession()) else {
      throw Refusal(reason: "session", detail: "The process is not in this interactive session.")
    }
    return Inspection(
      pid: pid,
      startedAt: startedAt,
      executablePath: executablePath,
      auditSession: auditSession,
      pidVersion: audit_token_to_pidversion(token)
    )
  }

  /// Lists the processes whose effective user is the current user.
  private static func ownProcesses() throws -> [pid_t] {
    let user = getuid()
    var capacity = Int(proc_listpids(UInt32(PROC_UID_ONLY), user, nil, 0)) / MemoryLayout<pid_t>.size
    for _ in 0..<maximumTableAttempts {
      capacity += 256
      var pids = [pid_t](repeating: 0, count: capacity)
      let bytes = Int(proc_listpids(UInt32(PROC_UID_ONLY), user, &pids, Int32(capacity * MemoryLayout<pid_t>.size)))
      guard bytes > 0 else {
        throw Refusal(reason: "listener", detail: "The processes cannot be enumerated.")
      }
      let count = bytes / MemoryLayout<pid_t>.size
      if count < capacity {
        return pids.prefix(count).filter { $0 > 0 }
      }
      capacity *= 2
    }
    throw Refusal(reason: "listener", detail: "The process list kept changing.")
  }

  /// True when the process is gone, a zombie, or no longer runs as the current user, so its sockets are not ours to
  /// account for.
  private static func vanished(_ pid: pid_t) -> Bool {
    let (read, error) = bsdInfo(pid)
    guard let info = read else {
      return error == ESRCH
    }
    return info.pbi_status == UInt32(SZOMB) || info.pbi_uid != getuid()
  }

  private static func fileDescriptors(_ pid: pid_t) throws -> [proc_fdinfo]? {
    let entry = MemoryLayout<proc_fdinfo>.size
    // proc_pidinfo answers 0 both on failure (errno set) and for a live process with no descriptors (errno untouched).
    errno = 0
    let estimate = Int(proc_pidinfo(pid, PROC_PIDLISTFDS, 0, nil, 0))
    if estimate == 0 && errno == 0 {
      return []
    }
    var capacity = estimate / entry
    if capacity <= 0 {
      if vanished(pid) {
        return nil
      }
      throw Refusal(reason: "listener", detail: "A process's sockets cannot be enumerated.")
    }
    for _ in 0..<maximumTableAttempts {
      capacity += 32
      var descriptors = [proc_fdinfo](repeating: proc_fdinfo(), count: capacity)
      errno = 0
      let bytes = Int(proc_pidinfo(pid, PROC_PIDLISTFDS, 0, &descriptors, Int32(capacity * entry)))
      if bytes == 0 && errno == 0 {
        return []
      }
      if bytes <= 0 || bytes % entry != 0 {
        if vanished(pid) {
          return nil
        }
        throw Refusal(reason: "listener", detail: "A process's sockets cannot be enumerated.")
      }
      let count = bytes / entry
      if count < capacity {
        return Array(descriptors.prefix(count))
      }
      capacity *= 2
    }
    throw Refusal(reason: "listener", detail: "A process's descriptor table kept changing.")
  }

  private static func listeners(of pid: pid_t) throws -> [Listener] {
    guard let descriptors = try fileDescriptors(pid) else {
      return []
    }
    var result: [Listener] = []
    for descriptor in descriptors where descriptor.proc_fdtype == UInt32(PROX_FDTYPE_SOCKET) {
      var socket = socket_fdinfo()
      let size = Int32(MemoryLayout<socket_fdinfo>.size)
      guard proc_pidfdinfo(pid, descriptor.proc_fd, PROC_PIDFDSOCKETINFO, &socket, size) == size else {
        let error = errno
        if error == EBADF {
          continue
        }
        if vanished(pid) {
          return []
        }
        throw Refusal(reason: "listener", detail: "A socket cannot be read.")
      }
      if let listener = listener(socket.psi, pid: pid) {
        result.append(listener)
      }
    }
    return result
  }

  static func listener(_ info: socket_info, pid: pid_t) -> Listener? {
    guard info.soi_kind == Int32(SOCKINFO_TCP), info.soi_proto.pri_tcp.tcpsi_state == Int32(TSI_S_LISTEN) else {
      return nil
    }
    let internet = info.soi_proto.pri_tcp.tcpsi_ini
    var local = internet.insi_laddr.ina_6
    let address = withUnsafeBytes(of: &local) { Array($0) }
    let port = UInt16(bigEndian: UInt16(truncatingIfNeeded: internet.insi_lport))
    let reusePort = (Int32(info.soi_options) & SO_REUSEPORT) != 0
    switch info.soi_family {
    case AF_INET:
      return Listener(pid: pid, family: .ipv4, address: Array(address.suffix(4)), port: port, reusePort: reusePort)
    case AF_INET6:
      return Listener(pid: pid, family: .ipv6, address: address, port: port, reusePort: reusePort)
    default:
      return nil
    }
  }

  static func readListeners() throws -> [Listener] {
    var result: [Listener] = []
    for pid in try ownProcesses() {
      result.append(contentsOf: try listeners(of: pid))
    }
    return result
  }

  // MARK: Listener policy

  private static func isZero(_ bytes: ArraySlice<UInt8>) -> Bool {
    bytes.allSatisfy { $0 == 0 }
  }

  private static let ipv4Loopback: [UInt8] = [127, 0, 0, 1]
  private static let ipv6Loopback: [UInt8] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
  private static let mappedPrefix: [UInt8] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF]

  /// True when the listener could accept a connection to the destination.
  static func couldAccept(_ listener: Listener, _ destination: Endpoint) -> Bool {
    guard listener.port == destination.port else {
      return false
    }
    let address = listener.address
    switch (destination.family, listener.family) {
    case (.ipv4, .ipv4):
      return isZero(address[...]) || address == ipv4Loopback
    case (.ipv4, .ipv6):
      // An IPv6 wildcard accepts IPv4 connections unless it is IPv6-only, so it counts either way.
      if isZero(address[...]) {
        return true
      }
      guard Array(address.prefix(12)) == mappedPrefix else {
        return false
      }
      let mapped = Array(address.suffix(4))
      return isZero(mapped[...]) || mapped == ipv4Loopback
    case (.ipv6, .ipv6):
      return isZero(address[...]) || address == ipv6Loopback
    case (.ipv6, .ipv4):
      return false
    }
  }

  /// True when the process holds a listener bound to exactly the destination, and every listener that could accept a
  /// connection to it belongs to the process and lacks SO_REUSEPORT.
  static func listenersBelongTo(_ listeners: [Listener], destination: Endpoint, pid: pid_t) -> Bool {
    let exact = destination.family == .ipv4 ? ipv4Loopback : ipv6Loopback
    var found = false
    for listener in listeners where couldAccept(listener, destination) {
      if listener.pid != pid || listener.reusePort {
        return false
      }
      if listener.family == destination.family, listener.address == exact {
        found = true
      }
    }
    return found
  }
}
