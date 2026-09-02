import ApplicationServices
import Foundation

private final class SelfTestRunner {
  private(set) var checks = 0
  private(set) var failures = 0

  func check(_ condition: @autoclosure () -> Bool, _ name: String) {
    checks += 1
    if condition() {
      print("ok - \(name)")
    } else {
      failures += 1
      print("not ok - \(name)")
    }
  }

  func run() {
    testFraming()
    testJSON()
    testInputLedger()
    testInputLock()
    testSnapshotShape()
    testAXIdentity()
    testReactNativeAccessibilityFallbacks()
    testHello()
  }

  private func testFraming() {
    do {
      let payload = Data(#"{"type":"response","id":"a"}"#.utf8)
      let frame = try Framing.encode(type: .json, payload: payload)
      check(frame.count == Framing.headerBytes + payload.count, "json frame length")
      let header = frame.prefix(Framing.headerBytes)
      let decoded = Framing.decodeHeader(Data(header))
      check(decoded?.0 == .json, "json frame type")
      check(decoded?.1 == payload.count, "json frame payload length")
      check(frame.dropFirst(Framing.headerBytes) == payload, "json frame payload round trip")

      let binary = try Framing.encodeBinary(id: "image-1", data: Data([1, 2, 3, 4]))
      let binaryHeader = Framing.decodeHeader(Data(binary.prefix(Framing.headerBytes)))
      check(binaryHeader?.0 == .binary, "binary frame type")
      check(binaryHeader?.1 == 4 + 7 + 4, "binary frame payload length")

      var corrupt = Data(repeating: 0, count: Framing.headerBytes)
      corrupt.replaceSubrange(0..<4, with: Data("FDR0".utf8))
      check(Framing.decodeHeader(corrupt) == nil, "invalid frame magic is rejected")
      var reserved = Data(repeating: 0, count: Framing.headerBytes)
      reserved.replaceSubrange(0..<4, with: Framing.magic)
      reserved[4] = FrameType.json.rawValue
      reserved[5] = 1
      check(Framing.decodeHeader(reserved) == nil, "nonzero reserved frame bytes are rejected")
    } catch {
      check(false, "framing operations do not throw")
    }
  }

  private func testJSON() {
    do {
      let document = Data(#"{"a":1,"b":-2.5,"c":"x\ny\u00e9","d":[true,false,null]}"#.utf8)
      let parsed = try parseJSON(document) as? JSONObject
      check(parsed != nil, "json object parses")
      check((parsed?["a"] as? NSNumber)?.intValue == 1, "json integer field")
      check((parsed?["b"] as? NSNumber)?.doubleValue == -2.5, "json fractional field")
      check((parsed?["c"] as? String) == "x\nyé", "json escapes decode")
      let encoded = try serializeJSON(parsed ?? [:])
      let roundTrip = try parseJSON(encoded) as? JSONObject
      check(roundTrip != nil, "json round trip")
    } catch {
      check(false, "json operations do not throw")
    }
  }

  private func testInputLedger() {
    check(isSingleWebDriverKey("A"), "ASCII key values contain one code point")
    check(isSingleWebDriverKey("😀"), "supplementary key values contain one code point")
    check(!isSingleWebDriverKey("AB"), "multi-code-point key values are rejected")
    do {
      let ledger = try parseReleaseLedger([
        "keys": ["a", "\u{E008}"],
        "buttons": [0, 2],
      ])
      check(ledger.keys.count == 2, "release ledger parses keys")
      check(ledger.buttons == [0, 2], "release ledger parses buttons")
    } catch {
      check(false, "release ledger parses")
    }
    do {
      _ = try parseReleaseLedger(["buttons": [9]])
      check(false, "invalid release ledger button is rejected")
    } catch {
      check(true, "invalid release ledger button is rejected")
    }
  }

  private func testInputLock() {
    let name = "furn-desktop-driver-self-test-\(getpid())-\(UUID().uuidString)"
    let lock = PhysicalInputLock(baseName: name)
    let token = CancellationToken()
    defer { lock.cleanupSelfTestFiles() }
    do {
      let value = try lock.withLock(token: token, timeoutMilliseconds: 200) { 42 }
      check(value == 42, "idle physical input lock is available")
    } catch {
      check(false, "idle physical input lock is available")
    }
    do {
      try lock.installDeadOwnerForSelfTest()
      _ = try lock.withLock(token: token, timeoutMilliseconds: 200, policy: .fail) { 0 }
      check(false, "dead owner record fails closed")
    } catch let error as HelperError {
      check(error.code == ErrorCode.inputBusy, "dead owner record fails closed")
    } catch {
      check(false, "dead owner record fails closed")
    }
    do {
      let value = try lock.withLock(token: token, timeoutMilliseconds: 200, policy: .adopt) { 7 }
      check(value == 7, "release-only recovery adopts a dead owner record")
      let second = try lock.withLock(token: token, timeoutMilliseconds: 200) { 8 }
      check(second == 8, "recovery clears the owner record")
    } catch {
      check(false, "release-only recovery adopts and clears a dead owner record")
    }
  }

  private func testSnapshotShape() {
    let snapshot = ElementSnapshot(
      id: "element-1",
      automationID: "button-primary",
      checked: .mixed,
      enabled: .supported(true),
      expanded: .unsupported("leaf"),
      focused: .supported(false),
      name: "Primary",
      parentID: "element-0",
      rect: CGRect(x: 10, y: 20, width: 120, height: 40),
      screenRect: CGRect(x: 100, y: 200, width: 120, height: 40),
      role: "button",
      scope: .preview,
      selected: .unsupported("no selection"),
      text: nil,
      value: nil,
      visible: .supported(true),
      windowID: "window-1"
    )
    let json = snapshot.json()
    check(json["scope"] as? String == "preview", "snapshot serializes its scope")
    check((json["checked"] as? JSONObject)?["value"] as? String == "mixed", "mixed checked state serializes")
    check(json["text"] == nil, "absent optional text is omitted")
    check((json["rect"] as? JSONObject)?["width"] as? Double == 120, "snapshot serializes logical geometry")
    check(json["id"] as? String == "element-1", "snapshot identifiers stay opaque")
  }

  private func testAXIdentity() {
    let first = AXUIElementCreateApplication(getpid())
    let second = AXUIElementCreateApplication(getpid())
    check(sameAXElement(first, second), "equivalent Accessibility elements compare equal")
    check(uniqueAXElements([first, second]).count == 1, "duplicate Accessibility elements collapse to one identity")
  }

  private func testReactNativeAccessibilityFallbacks() {
    let engine = AccessibilityEngine()
    do {
      let checkboxRole = try engine.normalizeRole("AXUnknown", subrole: nil, value: "checkbox, unchecked")
      check(
        checkboxRole == "checkbox",
        "React Native checkbox values recover the native role"
      )
      let checked = engine.checkedValue(role: "checkbox", value: "checkbox, checked" as CFString)
      check(
        (checked.json()["value"] as? Bool) == true,
        "React Native composite checkbox values recover checked state"
      )
      let unchecked = engine.checkedValue(role: "checkbox", value: "checkbox, unchecked" as CFString)
      check(
        (unchecked.json()["value"] as? Bool) == false,
        "React Native composite checkbox values recover unchecked state"
      )
    } catch {
      check(false, "React Native accessibility fallbacks do not throw")
    }
  }

  private func testHello() {
    let hello = createHello()
    check(hello["type"] as? String == "hello", "hello announces its type")
    check(
      hello["provider"] as? String == "macos" && hello["architecture"] as? String == "arm64",
      "hello reports the provider identity"
    )
    check(
      !(hello["buildId"] as? String ?? "").isEmpty && !(hello["sourceDigest"] as? String ?? "").isEmpty,
      "hello carries the generated build identity"
    )
    check((hello["protocol"] as? JSONObject)?["major"] as? Int == 1, "hello reports the wire protocol")
  }
}

func runSelfTest() -> Int32 {
  let runner = SelfTestRunner()
  runner.run()
  print(
    "\(runner.failures == 0 ? "self-test passed" : "self-test failed"): \(runner.checks - runner.failures)/\(runner.checks) checks"
  )
  return runner.failures == 0 ? 0 : 1
}
