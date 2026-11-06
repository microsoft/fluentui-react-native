import Darwin
import Foundation

extension SelfTestRunner {
  func testServiceIdentity() {
    testServiceIdentityFormats()
    testServiceIdentityListenerPolicy()
    testServiceIdentityRequests()
  }

  private func testServiceIdentityFormats() {
    let ipv4 = ServiceIdentity.parseLoopbackURL("http://127.0.0.1:4723")
    check(ipv4 == ServiceIdentity.Endpoint(family: .ipv4, port: 4723), "service url accepts an IPv4 loopback origin")
    let ipv6 = ServiceIdentity.parseLoopbackURL("http://[::1]:65535")
    check(ipv6 == ServiceIdentity.Endpoint(family: .ipv6, port: 65535), "service url accepts an IPv6 loopback origin")
    let refused = [
      "http://localhost:4723", "https://127.0.0.1:4723", "http://127.0.0.1", "http://127.0.0.1:",
      "http://127.0.0.1:4723/status", "http://127.0.0.1:04723", "http://127.0.0.1:0", "http://127.0.0.1:65536",
      "http://127.0.0.2:4723", "http://[::1]:4723/", "http://127.0.0.1:47 23", "http://127.0.0.1:123456",
    ]
    check(refused.allSatisfy { ServiceIdentity.parseLoopbackURL($0) == nil }, "service url refuses other origins")

    check(
      ServiceIdentity.formatTimestamp(seconds: 0, microseconds: 0) == "1970-01-01T00:00:00.000000Z",
      "service start time formats the epoch"
    )
    let formatted = ServiceIdentity.formatTimestamp(seconds: 1_700_000_000, microseconds: 123_456)
    check(formatted == "2023-11-14T22:13:20.123456Z", "service start time keeps microseconds")
    check(ServiceIdentity.formatTimestamp(seconds: 0, microseconds: 1_000_000) == nil, "service start time refuses overflow")
    check(ServiceIdentity.isTimestamp("2023-11-14T22:13:20.123456Z"), "service claim accepts the start time shape")
    check(
      !ServiceIdentity.isTimestamp("2023-11-14T22:13:20.123Z") && !ServiceIdentity.isTimestamp("2023-11-14T22:13:20.123456")
        && !ServiceIdentity.isTimestamp("2023-11-14 22:13:20.123456Z"),
      "service claim refuses other start time shapes"
    )
    check(!ServiceIdentity.sameBytes("/Apps/caf\u{E9}", "/Apps/cafe\u{301}"), "service paths compare exact bytes")
  }

  private func testServiceIdentityListenerPolicy() {
    typealias Listener = ServiceIdentity.Listener
    let loopback4: [UInt8] = [127, 0, 0, 1]
    let any4: [UInt8] = [0, 0, 0, 0]
    let loopback6: [UInt8] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1]
    let any6 = [UInt8](repeating: 0, count: 16)
    let mapped: [UInt8] = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 127, 0, 0, 1]
    let v4 = ServiceIdentity.Endpoint(family: .ipv4, port: 4723)
    let v6 = ServiceIdentity.Endpoint(family: .ipv6, port: 4723)
    func listener(_ pid: pid_t, _ family: ServiceIdentity.Family, _ address: [UInt8], port: UInt16 = 4723, reuse: Bool = false)
      -> Listener
    {
      Listener(pid: pid, family: family, address: address, port: port, reusePort: reuse)
    }
    let own4 = listener(10, .ipv4, loopback4)
    let own6 = listener(10, .ipv6, loopback6)

    check(ServiceIdentity.listenersBelongTo([own4], destination: v4, pid: 10), "service listener owned exactly")
    check(!ServiceIdentity.listenersBelongTo([], destination: v4, pid: 10), "service listener missing is refused")
    check(
      !ServiceIdentity.listenersBelongTo([listener(10, .ipv4, any4)], destination: v4, pid: 10),
      "service listener on a wildcard only is refused"
    )
    check(
      !ServiceIdentity.listenersBelongTo([own4, listener(11, .ipv4, any4)], destination: v4, pid: 10),
      "service listener shared with an IPv4 wildcard is refused"
    )
    check(
      !ServiceIdentity.listenersBelongTo([own4, listener(11, .ipv6, any6)], destination: v4, pid: 10),
      "service listener shared with an IPv6 wildcard is refused"
    )
    check(
      !ServiceIdentity.listenersBelongTo([own4, listener(11, .ipv6, mapped)], destination: v4, pid: 10),
      "service listener shared with a mapped address is refused"
    )
    check(
      !ServiceIdentity.listenersBelongTo([listener(10, .ipv4, loopback4, reuse: true)], destination: v4, pid: 10),
      "service listener with SO_REUSEPORT is refused"
    )
    check(
      ServiceIdentity.listenersBelongTo(
        [own4, listener(11, .ipv6, loopback6), listener(11, .ipv4, any4, port: 4724)],
        destination: v4,
        pid: 10
      ),
      "service listener ignores other families and ports"
    )
    check(
      ServiceIdentity.listenersBelongTo([own6, listener(11, .ipv4, any4)], destination: v6, pid: 10),
      "service IPv6 listener ignores IPv4 wildcards"
    )
    check(
      !ServiceIdentity.listenersBelongTo([own6, listener(11, .ipv6, any6)], destination: v6, pid: 10),
      "service IPv6 listener shared with an IPv6 wildcard is refused"
    )
  }

  private func testServiceIdentityRequests() {
    func answer(_ text: String?) -> JSONObject {
      ServiceIdentity.handle(text.map { Data($0.utf8) })
    }
    let malformed = [
      nil, "", "[]", "{}", #"{"operation":"other"}"#, #"{"operation":"describe"}"#,
      #"{"operation":"describe","pid":true}"#, #"{"operation":"describe","pid":1.5}"#,
      #"{"operation":"describe","pid":0}"#, #"{"operation":"describe","pid":"1"}"#,
      #"{"operation":"verify","url":"http://127.0.0.1:1"}"#,
      #"{"operation":"verify","url":"http://127.0.0.1:1","service":{"platform":"macos","pid":1}}"#,
    ]
    check(
      malformed.allSatisfy { (answer($0)["ok"] as? Bool) == false && (answer($0)["reason"] as? String) == "request" },
      "service identity rejects malformed requests"
    )
    check(
      ServiceIdentity.handle(Data(repeating: 0x20, count: ServiceIdentity.maximumRequestBytes + 1))["reason"] as? String
        == "request",
      "service identity rejects an oversize request"
    )

    let own = answer("\u{FEFF}" + #"{"operation":"describe","pid":\#(getpid())}"#)
    let identity = own["identity"] as? JSONObject
    check((own["ok"] as? Bool) == true && identity?["platform"] as? String == "macos", "service describes this process")
    check((identity?["pid"] as? Int) == Int(getpid()), "service description keeps the pid")
    check(
      ServiceIdentity.isTimestamp(identity?["startedAt"] as? String ?? ""),
      "service description formats the start time"
    )
    check((identity?["executablePath"] as? String)?.hasPrefix("/") == true, "service description has an absolute path")
    check(
      (identity?["interactiveSession"] as? String)?.hasPrefix("macos-session:") == true,
      "service description names the audit session"
    )

    guard let identity else {
      return
    }
    func verify(url: String = "http://127.0.0.1:1", _ change: (inout JSONObject) -> Void = { _ in }) -> JSONObject {
      var service = identity
      service["incarnation"] = "self-test"
      change(&service)
      let request: JSONObject = ["operation": "verify", "url": url, "service": service]
      guard let data = try? serializeJSON(request) else {
        return [:]
      }
      return ServiceIdentity.handle(data)
    }
    func refused(_ result: JSONObject, _ reason: String) -> Bool {
      (result["ok"] as? Bool) == true && (result["verified"] as? Bool) == false && (result["reason"] as? String) == reason
    }
    check(refused(verify(url: "http://localhost:1"), "url"), "service verify refuses a named host")
    check(refused(verify { $0["platform"] = "windows" }, "claim"), "service verify refuses another platform")
    check(refused(verify { $0["startedAt"] = "2023-11-14T22:13:20.123456Z" }, "start"), "service verify checks the start")
    check(refused(verify { $0["executablePath"] = "/bin/false" }, "image"), "service verify checks the executable")
    check(refused(verify { $0["interactiveSession"] = "macos-session:1" }, "session"), "service verify checks the session")
    check(refused(verify(), "listener"), "service verify refuses an address the process does not serve")
    check(refused(verify { $0["pid"] = 1 }, "user"), "service verify refuses another user's process")
  }
}
