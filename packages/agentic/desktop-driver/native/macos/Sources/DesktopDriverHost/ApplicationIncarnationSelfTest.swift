import Darwin
import Foundation

extension SelfTestRunner {
  func testApplicationIncarnation() {
    let recorded = Date(timeIntervalSince1970: 1_700_000_000.123)
    func classify(_ observed: ApplicationIncarnation.Observation) -> ApplicationIncarnation.State {
      ApplicationIncarnation.classify(recorded: recorded, observed: observed)
    }
    check(classify(.gone) == .exited, "application incarnation is exited when its pid is gone")
    check(classify(.unavailable) == .unknown, "application incarnation is unknown when the kernel will not say")
    check(classify(.started(recorded.addingTimeInterval(0.0004))) == .running, "application incarnation matches its start")
    check(classify(.started(recorded.addingTimeInterval(5))) == .exited, "application incarnation is exited after pid reuse")
    check(classify(.started(recorded.addingTimeInterval(0.5))) == .unknown, "application incarnation is unknown near its start")
    check(classify(.started(recorded.addingTimeInterval(-5))) == .unknown, "application incarnation is unknown before its start")

    func answer(_ text: String?) -> JSONObject {
      ApplicationIncarnation.handle(text.map { Data($0.utf8) })
    }
    let malformed = [
      nil, "", "[]", "{}", #"{"pid":1}"#, #"{"pid":0,"startedAt":"2023-11-14T22:13:20.123Z"}"#,
      #"{"pid":true,"startedAt":"2023-11-14T22:13:20.123Z"}"#, #"{"pid":1,"startedAt":"yesterday"}"#,
      #"{"pid":1,"startedAt":"2023-11-14T22:13:20.123Z","extra":1}"#,
    ]
    check(
      malformed.allSatisfy { (answer($0)["ok"] as? Bool) == false && (answer($0)["reason"] as? String) == "request" },
      "application incarnation rejects malformed requests"
    )
    let ownStart = processStartTime(getpid()).map(formatDate) ?? ""
    let own = answer(#"{"pid":\#(getpid()),"startedAt":"\#(ownStart)"}"#)
    check((own["ok"] as? Bool) == true && own["state"] as? String == "running", "application incarnation finds this process")
    let reused = answer(#"{"pid":\#(getpid()),"startedAt":"1970-01-01T00:00:00.000Z"}"#)
    check(reused["state"] as? String == "exited", "application incarnation treats a later start as pid reuse")
  }
}
