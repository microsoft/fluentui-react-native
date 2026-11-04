import Darwin
import Foundation

// The `--application-incarnation` mode: answers whether the exact process an application lease recorded, a process id
// and its start time, still runs. `exited` is answered only with proof: the process id is gone, or it now names a process
// that started well after the recorded one. Anything the kernel will not show this user is `unknown`.

enum ApplicationIncarnation {
  /// The recorded start time comes from the same kernel field, rounded to milliseconds.
  static let sameStartTolerance: TimeInterval = 0.01
  /// A process id whose process started this much later was reused, so the recorded process has exited.
  static let reusedStartTolerance: TimeInterval = 1

  enum State: String {
    case exited
    case running
    case unknown
  }

  enum Observation {
    case gone
    case started(Date)
    case unavailable
  }

  static func run() -> Int32 {
    let answer = handle(ServiceIdentity.readRequest())
    var line = (try? serializeJSON(answer)) ?? Data(#"{"ok":false,"reason":"request"}"#.utf8)
    line.append(0x0A)
    FileHandle.standardOutput.write(line)
    return (answer["ok"] as? Bool) == true ? 0 : 1
  }

  static func handle(_ data: Data?, observe: (pid_t) -> Observation = observe) -> JSONObject {
    guard var data, !data.isEmpty else {
      return rejected()
    }
    if data.starts(with: [0xEF, 0xBB, 0xBF]) {
      data = data.dropFirst(3)
    }
    guard
      let request = (try? JSONSerialization.jsonObject(with: data, options: [])) as? JSONObject,
      Set(request.keys) == ["pid", "startedAt"],
      let pid = try? ServiceIdentity.requiredPid(request, "pid"),
      let text = request["startedAt"] as? String,
      text.utf8.count <= 64,
      let startedAt = parseDate(text)
    else {
      return rejected()
    }
    return ["ok": true, "state": classify(recorded: startedAt, observed: observe(pid)).rawValue]
  }

  static func classify(recorded: Date, observed: Observation) -> State {
    switch observed {
    case .gone:
      return .exited
    case .unavailable:
      return .unknown
    case .started(let actual):
      let difference = actual.timeIntervalSince(recorded)
      if abs(difference) <= sameStartTolerance {
        return .running
      }
      // Process ids are reused only after the recorded process exits, so a later start proves the exit. An earlier start
      // means the record does not describe this process at all, which is not proof of anything.
      return difference > reusedStartTolerance ? .exited : .unknown
    }
  }

  static func observe(_ pid: pid_t) -> Observation {
    var info = proc_bsdinfo()
    let size = Int32(MemoryLayout<proc_bsdinfo>.size)
    errno = 0
    let read = withUnsafeMutablePointer(to: &info) {
      proc_pidinfo(pid, PROC_PIDTBSDINFO, 0, $0, size)
    }
    if read == size {
      if info.pbi_status == UInt32(SZOMB) {
        return .gone
      }
      return .started(
        Date(
          timeIntervalSince1970: TimeInterval(info.pbi_start_tvsec) + TimeInterval(info.pbi_start_tvusec) / 1_000_000
        )
      )
    }
    let failure = errno
    // proc_pidinfo answers ESRCH both for a process id that is free and for a zombie, which has exited too.
    if failure == ESRCH || (kill(pid, 0) != 0 && errno == ESRCH) {
      return .gone
    }
    return .unavailable
  }

  private static func rejected() -> JSONObject {
    ["ok": false, "reason": "request"]
  }
}
