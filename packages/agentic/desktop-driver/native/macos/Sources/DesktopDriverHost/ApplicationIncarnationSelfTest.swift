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
    let exact = "2023-11-14T22:13:20.123456Z"
    check(ApplicationIncarnation.classifyExact(recorded: exact, observed: .started(exact)) == .running,
      "exact application incarnation matches without rounding")
    check(ApplicationIncarnation.classifyExact(recorded: exact, observed: .started("2023-11-14T22:13:20.123457Z")) == .exited,
      "exact application incarnation detects PID reuse one microsecond later")
    check(ApplicationIncarnation.classifyExact(recorded: exact, observed: .started("2023-11-14T22:13:20.123455Z")) == .unknown,
      "an earlier exact identity is not proof of recorded exit")
    check(ApplicationIncarnation.classifyExact(recorded: exact, observed: .unavailable) == .unknown,
      "exact application incarnation fails closed on permission failure")
    check(ApplicationIncarnation.captureCausalIdentity(matchesProcess: { true }, inspect: { exact }) == exact,
      "causal process capture retains an exact kernel identity")
    var causalChecks = 0
    let replaced = ApplicationIncarnation.captureCausalIdentity(matchesProcess: {
      causalChecks += 1
      return causalChecks == 1
    }, inspect: { exact })
    check(replaced == nil && causalChecks == 2, "causal process capture rejects replacement during inspection")
    check(ApplicationIncarnation.captureCausalIdentity(matchesProcess: { false }, inspect: { exact }) == nil,
      "causal process capture refuses a foreign process")
    check(ApplicationIncarnation.captureCausalIdentity(matchesProcess: { true }, inspect: { nil }) == nil,
      "causal process capture fails closed when the kernel identity is unavailable")

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
    testExactApplicationExclusion()
  }

  private func testExactApplicationExclusion() {
    do {
      let own = try ServiceIdentity.inspect(getpid())
      let first = try ExactApplicationLock.acquire(processID: getpid(), startedAt: own.startedAt)
      defer { first.release() }
      do {
        let unexpected = try ExactApplicationLock.acquire(processID: getpid(), startedAt: own.startedAt)
        unexpected.release()
        check(false, "two application owners cannot acquire the same exact incarnation")
      } catch {
        check(true, "two application owners cannot acquire the same exact incarnation")
      }
      first.release()
      let next = try ExactApplicationLock.acquire(processID: getpid(), startedAt: own.startedAt)
      next.release()
      check(true, "application exclusion is released after exact lease cleanup")
    } catch {
      check(false, "exact application exclusion can inspect and lock this process: \(error)")
    }
  }
}
