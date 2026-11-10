import ApplicationServices
import Foundation

final class SelfTestRunner {
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
    testInputModifiers()
    testInputLock()
    testCaptureScale()
    testSnapshotShape()
    testAXIdentity()
    testAXWindowDiagnostics()
    testCoreGraphicsWindowSelection()
    testReactNativeAccessibilityFallbacks()
    testAccessibilityActionNames()
    testAccessibilityActionKeys()
    testPermissionDiagnostic()
    testLoginSessionState()
    testWindowEventMonitor()
    testCommandJournal()
    testEffectLedger()
    testMutationEffects()
    testHostQueuedCancellation()
    testHostLifecycle()
    testInputIntegrity()
    testApplicationTermination()
    testCaptureWindowSelection()
    testObservation()
    testServiceIdentity()
    testApplicationIncarnation()
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

  private func testInputModifiers() {
    check(modifierFlagsAfterKey(.keyCode(56), down: true, held: []) == .maskShift, "Shift down carries its modifier flag")
    check(
      modifierFlagsAfterKey(.keyCode(48), down: true, held: [.keyCode(56)]) == .maskShift,
      "Tab carries the already-posted Shift flag without relying on OS dispatch"
    )
    check(
      modifierFlagsAfterKey(.keyCode(48), down: false, held: [.keyCode(56), .keyCode(48)]) == .maskShift,
      "Tab release preserves held Shift"
    )
    check(
      modifierFlagsAfterKey(.keyCode(56), down: false, held: [.keyCode(56)]).isEmpty,
      "Shift release clears its flag"
    )
    check(
      modifierFlagsAfterKey(.keyCode(56), down: false, held: [.keyCode(56), .keyCode(60)]) == .maskShift,
      "releasing left Shift preserves held right Shift"
    )
    check(
      modifierFlags(for: [.keyCode(62), .keyCode(61), .keyCode(54)]) == [.maskControl, .maskAlternate, .maskCommand],
      "right-hand modifier keys combine their flags"
    )
    check(
      modifierFlags(for: [.unicode("x"), .keyCode(48)]).isEmpty,
      "ordinary keys do not add modifier flags"
    )
    var held: [PressedKey] = []
    let shift = PressedKey(value: "\u{E008}", stroke: .keyCode(56))
    trackKeyDown(shift, held: &held)
    trackKeyDown(shift, held: &held)
    check(held.count == 1, "repeated Shift keydown does not duplicate a held physical key")
    trackKeyUp(shift.stroke, held: &held)
    check(
      modifierFlagsAfterKey(.keyCode(48), down: true, held: held.map(\.stroke)).isEmpty,
      "Tab is unmodified after repeated Shift down and one release"
    )
    check(modifierFlags(for: held.map(\.stroke)).isEmpty, "pointer events do not retain a released repeated modifier")
    trackKeyDown(shift, held: &held)
    trackKeyDown(PressedKey(value: "left-shift-alias", stroke: .keyCode(56)), held: &held)
    trackKeyDown(PressedKey(value: "right-shift", stroke: .keyCode(60)), held: &held)
    check(held.count == 2, "aliases share a physical key while left and right Shift remain independent")
    trackKeyUp(.keyCode(56), held: &held)
    check(modifierFlags(for: held.map(\.stroke)) == .maskShift, "releasing an aliased left Shift preserves right Shift")
    trackKeyUp(.keyCode(60), held: &held)
    check(held.isEmpty, "both physical Shift keys can be released independently")
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

  private func testCaptureScale() {
    check(
      matchingBackingScaleFactor(
        displayID: 42,
        screens: [(displayID: 7, scaleFactor: 1), (displayID: 42, scaleFactor: 2)]
      ) == 2,
      "capture uses the matched display backing scale"
    )
    check(
      matchingBackingScaleFactor(displayID: 99, screens: [(displayID: 42, scaleFactor: 2)]) == 1,
      "capture defaults to one scale when the display is unknown"
    )
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
    check(strictAXElements([first, second] as CFArray)?.count == 2, "strict AX arrays accept only accessibility elements")
    check(strictAXElements([first, "invalid"] as CFArray) == nil, "strict AX arrays reject mixed element types")
  }

  private func testAXWindowDiagnostics() {
    func query(
      _ error: AXError,
      elementCount: Int = 0,
      valueValid: Bool? = nil
    ) -> AXWindowAttributeDiagnostic {
      AXWindowAttributeDiagnostic(
        attribute: kAXWindowsAttribute,
        error: error,
        returnedType: elementCount == 0 ? "none" : "CFArray",
        elementCount: elementCount,
        elements: [],
        valueValid: valueValid ?? (error == .success)
      )
    }

    let manyElements = (0..<65).map { _ in AXUIElementCreateApplication(getpid()) }
    let manyWindows = AXWindowAttributeDiagnostic(
      attribute: kAXWindowsAttribute,
      error: .success,
      returnedType: "CFArray",
      elementCount: manyElements.count,
      elements: manyElements,
      valueValid: true
    )
    check(manyWindows.elements.count == 65, "AX window diagnostics preserve every functional element")
    check(
      (manyWindows.json()["elements"] as? [JSONObject])?.count == 16,
      "AX window diagnostic evidence remains bounded"
    )

    check(
      classifyAXWindowQuery(
        queries: [query(.apiDisabled)],
        realWindowCount: 0,
        placeholderCount: 0,
        otherRoleCount: 0,
        matchingTitleCount: nil
      ) == "api-disabled",
      "AX API-disabled window queries remain distinguishable"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.cannotComplete)],
        realWindowCount: 0,
        placeholderCount: 0,
        otherRoleCount: 0,
        matchingTitleCount: nil
      ) == "target-non-response",
      "AX cannot-complete window queries remain distinguishable"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.invalidUIElement)],
        realWindowCount: 0,
        placeholderCount: 0,
        otherRoleCount: 0,
        matchingTitleCount: nil
      ) == "invalid-element",
      "invalid AX application elements remain distinguishable"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.attributeUnsupported), query(.noValue)],
        realWindowCount: 0,
        placeholderCount: 0,
        otherRoleCount: 0,
        matchingTitleCount: nil
      ) == "no-value-or-unsupported",
      "unsupported and no-value AX window attributes remain distinguishable"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.success, elementCount: 1)],
        realWindowCount: 0,
        placeholderCount: 1,
        otherRoleCount: 0,
        matchingTitleCount: nil
      ) == "placeholder-only",
      "AXApplication placeholders are never accepted as windows"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.success, elementCount: 1)],
        realWindowCount: 0,
        placeholderCount: 1,
        otherRoleCount: 0,
        matchingTitleCount: nil,
        roleErrors: [.failure]
      ) == "window-query-failed",
      "hard AX role errors take precedence over placeholder classification"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.success, elementCount: 1)],
        realWindowCount: 1,
        placeholderCount: 0,
        otherRoleCount: 0,
        matchingTitleCount: 0
      ) == "no-matching-title",
      "real windows without the configured title remain distinguishable"
    )
    check(
      classifyAXWindowQuery(
        queries: [query(.success, elementCount: 1)],
        realWindowCount: 1,
        placeholderCount: 0,
        otherRoleCount: 0,
        matchingTitleCount: 1
      ) == "matched",
      "real titled AXWindow results are accepted"
    )
    check(
      incompleteAXCandidateDiscovery(
        queries: [query(.cannotComplete)],
        roleQueries: [],
        titleErrorCount: 0
      ),
      "failed AXWindows queries make multi-process discovery incomplete"
    )
    check(
      incompleteAXCandidateDiscovery(
        queries: [query(.success, valueValid: false)],
        roleQueries: [],
        titleErrorCount: 0
      ),
      "malformed AXWindows values make multi-process discovery incomplete"
    )
    check(
      incompleteAXCandidateDiscovery(
        queries: [query(.success)],
        roleQueries: [],
        titleErrorCount: 1
      ),
      "failed window title reads make multi-process discovery incomplete"
    )
    check(
      incompleteAXCandidateDiscovery(
        queries: [query(.success)],
        roleQueries: [AXWindowRoleDiagnostic(error: .success, role: nil, valueValid: false)],
        titleErrorCount: 0
      ),
      "malformed successful AX role values make discovery incomplete"
    )
    check(
      incompleteAXCandidateDiscovery(
        queries: [query(.success, elementCount: 1)],
        roleQueries: [
          AXWindowRoleDiagnostic(error: .success, role: kAXApplicationRole, valueValid: true),
        ],
        titleErrorCount: 0
      ),
      "AXApplication placeholders make authoritative window discovery incomplete"
    )
    let authoritativeElement = AXUIElementCreateApplication(getpid())
    let fallbackElement = AXUIElementCreateSystemWide()
    let authoritativeWindows = AXWindowAttributeDiagnostic(
      attribute: kAXWindowsAttribute,
      error: .success,
      returnedType: "CFArray",
      elementCount: 1,
      elements: [authoritativeElement],
      valueValid: true
    )
    let inconsistentFallback = AXWindowAttributeDiagnostic(
      attribute: kAXMainWindowAttribute,
      error: .success,
      returnedType: "AXUIElement",
      elementCount: 1,
      elements: [fallbackElement],
      valueValid: true
    )
    check(
      incompleteAXCandidateDiscovery(
        queries: [authoritativeWindows, inconsistentFallback],
        roleQueries: [],
        titleErrorCount: 0
      ),
      "fallback windows absent from AXWindows make discovery incomplete"
    )
    check(
      !unreliableAXWindowEnumeration(queries: [authoritativeWindows, inconsistentFallback], roleQueries: []),
      "a role-verified fallback window absent from AXWindows does not invalidate window listing"
    )
    check(
      unreliableAXWindowEnumeration(queries: [query(.cannotComplete)], roleQueries: []),
      "an unreadable AXWindows result invalidates window listing"
    )
    check(
      unreliableAXWindowEnumeration(
        queries: [authoritativeWindows],
        roleQueries: [AXWindowRoleDiagnostic(error: .invalidUIElement, role: nil, valueValid: false)]
      ),
      "an unverifiable window candidate invalidates window listing"
    )
    check(
      !incompleteAXMultiProcessDiscovery(
        queriesByCandidate: [
          [authoritativeWindows],
          [
            AXWindowAttributeDiagnostic(
              attribute: kAXWindowsAttribute,
              error: .success,
              returnedType: "CFArray",
              elementCount: 1,
              elements: [fallbackElement],
              valueValid: true
            ),
          ],
        ],
        roleQueriesByCandidate: [[], []],
        titleErrorCount: 0
      ),
      "independent candidate window enumerations are not compared across processes"
    )
    check(
      !completeAXWindowTitle(error: .attributeUnsupported, title: nil),
      "unsupported AX window titles are incomplete"
    )
    check(
      completeAXWindowTitle(error: .success, title: ""),
      "successful empty AX window titles remain valid values"
    )
    check(
      classifyAXAttachment(matchCount: 1, discoveryIncomplete: true) == "incomplete",
      "one confirmed match remains ambiguous after incomplete discovery"
    )
    check(
      classifyAXAttachment(matchCount: 1, discoveryIncomplete: false) == "matched",
      "one confirmed match succeeds after complete discovery"
    )
  }

  private func testCoreGraphicsWindowSelection() {
    let frame = CGRect(x: 10, y: 20, width: 300, height: 200)
    let unique = selectCoreGraphicsWindowFrame(
      candidates: [CoreGraphicsWindowCandidate(frame: frame, title: nil)],
      title: "Expected",
      authoritativeWindowCount: 1,
      screenCaptureAccess: false
    )
    check(unique.frame == frame, "CoreGraphics fallback does not require window names for a unique PID/layer candidate")
    check(
      unique.diagnostics["reason"] as? String == "unique-candidate",
      "CoreGraphics fallback records unique-candidate evidence"
    )

    let duplicateGeometry = selectCoreGraphicsWindowFrame(
      candidates: [
        CoreGraphicsWindowCandidate(frame: frame, title: nil),
        CoreGraphicsWindowCandidate(frame: frame, title: nil),
      ],
      title: "Expected",
      authoritativeWindowCount: 1,
      screenCaptureAccess: false
    )
    check(
      duplicateGeometry.frame == frame,
      "CoreGraphics fallback accepts one unique geometry when Screen Recording hides names"
    )
    check(
      duplicateGeometry.diagnostics["titleMatchingAvailable"] as? Bool == false,
      "CoreGraphics fallback reports unavailable title matching"
    )
    let wrongTitle = selectCoreGraphicsWindowFrame(
      candidates: [CoreGraphicsWindowCandidate(frame: frame, title: "Different")],
      title: "Expected",
      authoritativeWindowCount: 1,
      screenCaptureAccess: true
    )
    check(wrongTitle.frame == nil, "CoreGraphics fallback rejects an explicitly different title")
    check(
      wrongTitle.diagnostics["reason"] as? String == "no-matching-title",
      "CoreGraphics fallback records title mismatches"
    )
    let ambiguousUntitled = selectCoreGraphicsWindowFrame(
      candidates: [CoreGraphicsWindowCandidate(frame: frame, title: nil)],
      title: "Expected",
      authoritativeWindowCount: 2,
      screenCaptureAccess: false
    )
    check(
      ambiguousUntitled.frame == nil,
      "CoreGraphics fallback rejects unnamed candidates when AX exposes multiple windows"
    )
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

  private func testPermissionDiagnostic() {
    let diagnostic = createPermissionDiagnostic(prompt: false)
    check(diagnostic["schemaVersion"] as? Int == 1, "permission diagnostics are versioned")
    check(diagnostic["type"] as? String == "permissions", "permission diagnostics identify their type")
    check(diagnostic["promptRequested"] as? Bool == false, "self-tests never prompt for privacy permissions")
    let process = diagnostic["process"] as? JSONObject
    check((process?["pid"] as? Int) == Int(getpid()), "permission diagnostics report the helper PID")
    check(process?["executablePath"] as? String != nil, "permission diagnostics report the helper executable")
    let permissions = diagnostic["permissions"] as? JSONObject
    check(permissions?["accessibility"] is JSONObject, "permission diagnostics report Accessibility preflight")
    check(permissions?["postEvent"] is JSONObject, "permission diagnostics report PostEvent preflight")
    check(permissions?["screenCapture"] is JSONObject, "permission diagnostics report Screen Recording preflight")
    let signing = diagnostic["signing"] as? JSONObject
    check(signing?["cdhash"] is JSONObject, "permission diagnostics explicitly report cdhash availability")
    check(signing?["signer"] is JSONObject, "permission diagnostics explicitly report signer availability")
    check(signing?["teamIdentifier"] is JSONObject, "permission diagnostics explicitly report team availability")
    check(
      signing?["designatedRequirement"] is JSONObject,
      "permission diagnostics explicitly report designated-requirement availability"
    )
    let session = diagnostic["session"] as? JSONObject
    check(session?["source"] as? String == LoginSessionState.source, "permission diagnostics report login-session state")
  }

  private func testWindowEventMonitor() {
    let monitor = WindowEventMonitor()
    let element = AXUIElementCreateApplication(getpid())
    var published: [String] = []
    monitor.publishWindowClosed = { published.append($0) }
    check(monitor.diagnostic(processID: getpid())["observing"] as? Bool == false, "an unobserved process reports no window observer")
    monitor.track(element, windowID: "window-test", processID: getpid())
    monitor.record(element: element, notification: kAXFocusedWindowChangedNotification)
    check(monitor.isSettling(processID: getpid()), "a recent focus change marks window publication as settling")
    check(!monitor.isClosed(windowID: "window-test"), "focus changes do not close a tracked window")
    monitor.record(element: element, notification: kAXUIElementDestroyedNotification)
    monitor.record(element: element, notification: kAXUIElementDestroyedNotification)
    check(monitor.isClosed(windowID: "window-test"), "a destroyed notification closes the tracked window")
    check(published == ["window-test"], "a tracked window close is published exactly once")
    let events = monitor.diagnostic(processID: getpid())["events"] as? [JSONObject] ?? []
    check(
      events.count == 3 && events.last?["windowId"] as? String == "window-test"
        && events.last?["notification"] as? String == kAXUIElementDestroyedNotification,
      "the window event timeline records notifications with resolved window identities"
    )
    check(
      events.first?["descriptor"] is JSONObject && events.last?["descriptor"] == nil,
      "live window events carry an element descriptor while destroyed events do not"
    )
    monitor.forget(windowID: "window-test")
    check(!monitor.isClosed(windowID: "window-test"), "forgetting a window clears its closed state")

    // A destroyed notification can arrive before the close command finishes and forgets the window.
    monitor.track(element, windowID: "window-closing", processID: getpid())
    monitor.beginHelperClose(windowID: "window-closing")
    monitor.record(element: element, notification: kAXUIElementDestroyedNotification)
    check(
      published == ["window-test"] && monitor.isClosed(windowID: "window-closing"),
      "a window closed through closeWindow is recorded as closed but publishes no event"
    )
    monitor.forget(windowID: "window-closing")
    monitor.track(element, windowID: "window-kept", processID: getpid())
    monitor.beginHelperClose(windowID: "window-kept")
    monitor.cancelHelperClose(windowID: "window-kept")
    monitor.record(element: element, notification: kAXUIElementDestroyedNotification)
    check(
      published == ["window-test", "window-kept"],
      "a closeWindow that fails leaves the window's later destruction published"
    )
    monitor.forget(windowID: "window-kept")
    for _ in 0..<(WindowEventMonitor.maximumEvents + 10) {
      monitor.record(element: element, notification: kAXApplicationActivatedNotification)
    }
    let boundedEvents = monitor.diagnostic(processID: getpid(), limit: WindowEventMonitor.maximumEvents)
    let recentEvents = boundedEvents["events"] as? [JSONObject] ?? []
    check(
      boundedEvents["eventsTruncated"] as? Bool == true
        && recentEvents.count == WindowEventMonitor.maximumEvents
        && recentEvents.allSatisfy { $0["notification"] as? String == kAXApplicationActivatedNotification },
      "the window event timeline stays bounded"
    )
    check(
      monitor.diagnostic(processID: getpid())["eventsTruncated"] as? Bool == true,
      "the default event tail reports older buffered events"
    )
    monitor.stop(processID: getpid())
    let stopped = monitor.diagnostic(processID: getpid())
    check(
      (stopped["events"] as? [JSONObject])?.isEmpty == true && stopped["eventsTruncated"] as? Bool == false,
      "stopping an application clears its event tail and truncation state"
    )
  }

  private func testCommandJournal() {
    let journal = CommandJournal()
    let first = journal.begin("windows", detail: [:])
    journal.finish(first, outcome: "ok", detail: ["windowIds": ["window-a"]])
    let second = journal.begin("click", detail: ["elementId": "element-a"])
    journal.annotate(second, detail: ["method": "accessibility"])
    journal.finish(second, outcome: ErrorCode.notInteractable)
    let entries = journal.diagnostic()
    check(
      entries.count == 2 && entries[0]["outcome"] as? String == "ok" && entries[0]["durationMs"] is Int
        && entries[1]["outcome"] as? String == ErrorCode.notInteractable,
      "the command journal records outcomes and durations"
    )
    check(
      ((entries[0]["detail"] as? JSONObject)?["windowIds"] as? [String]) == ["window-a"],
      "the command journal records listed window identities"
    )
    check(
      (entries[1]["detail"] as? JSONObject)?["method"] as? String == "accessibility"
        && (entries[1]["detail"] as? JSONObject)?["elementId"] as? String == "element-a",
      "command annotations merge with request details"
    )
    for _ in 0..<(CommandJournal.maximumEntries + 5) {
      journal.finish(journal.begin("find", detail: [:]), outcome: "ok")
    }
    check(journal.diagnostic(limit: 1000).count == CommandJournal.maximumEntries, "the command journal stays bounded")
  }

  private func testLoginSessionState() {
    let unlocked = LoginSessionState(values: ["kCGSSessionOnConsoleKey": 1, "kCGSessionLoginDoneKey": 1])
    check(unlocked.screenLocked == false && unlocked.unavailableReason == nil, "an unlocked console session is available")
    let locked = LoginSessionState(values: [
      "CGSSessionScreenIsLocked": 1,
      "kCGSSessionOnConsoleKey": 1,
      "kCGSessionLoginDoneKey": 1,
    ])
    check(locked.unavailableReason?.contains("screen is locked") == true, "a locked screen explains unavailable automation")
    let lockedJSON = locked.json["screenLocked"] as? JSONObject
    check(lockedJSON?["value"] as? Bool == true, "the session diagnostic reports the observed lock")
    let switched = LoginSessionState(values: ["kCGSSessionOnConsoleKey": 0, "kCGSessionLoginDoneKey": 1])
    check(switched.unavailableReason?.contains("console session") == true, "an off-console session explains unavailable automation")
    let missing = LoginSessionState(values: nil)
    check(
      missing.unavailableReason == nil && missing.json["status"] as? String == "unavailable",
      "an unreadable session dictionary is reported as unavailable rather than locked"
    )
  }

  private func testEffectLedger() {
    check(
      MutationEffect.noEffect.rawValue == "none" && MutationEffect.partial.rawValue == "partial"
        && MutationEffect.unknown.rawValue == "unknown",
      "effects use the protocol spellings"
    )
    let ledger = EffectLedger()
    check(ledger.effect == .noEffect, "a command that dispatched nothing has no effect")
    ledger.delivered()
    check(ledger.effect == .partial, "a delivered event that the command did not finish is a partial effect")
    ledger.reset()
    check(ledger.effect == .noEffect, "resetting the ledger starts the next command clean")

    ledger.dispatching()
    check(ledger.effect == .unknown, "an Accessibility request without a result may still be processed")
    ledger.completed(.success)
    check(ledger.effect == .partial, "an acknowledged request is a partial effect once the command stops")

    let proofOfNoEffect: [AXError] = [
      .actionUnsupported, .apiDisabled, .attributeUnsupported, .illegalArgument, .invalidUIElement, .noValue,
      .notEnoughPrecision, .notImplemented,
    ]
    for error in proofOfNoEffect {
      ledger.reset()
      ledger.dispatching()
      ledger.completed(error)
      check(ledger.effect == .noEffect, "\(axErrorName(error)) proves the target never acted")
    }
    for error in [AXError.cannotComplete, .failure] {
      ledger.reset()
      ledger.dispatching()
      ledger.completed(error)
      check(ledger.effect == .unknown, "\(axErrorName(error)) leaves the outcome unknown")
    }

    ledger.reset()
    ledger.dispatching()
    ledger.completed(.cannotComplete)
    ledger.delivered()
    check(ledger.effect == .unknown, "a later success does not settle an earlier unresolved dispatch")
    ledger.reset()
    check(ledger.effect == .noEffect, "resetting clears an unresolved dispatch")
  }

  private func testMutationEffects() {
    let residue = EffectLedger()
    let driver = Driver(effects: residue)
    let token = CancellationToken()
    func failure(_ command: String, _ params: JSONObject = [:]) -> Error? {
      do {
        _ = try driver.execute(command: command, params: params, token: token)
        return nil
      } catch {
        return error
      }
    }

    residue.dispatching()
    let click = failure("click", ["elementId": "element-missing"]) as? HelperError
    check(
      click?.code == ErrorCode.staleElement && click?.effect == .noEffect,
      "a click rejected before dispatch reports no effect, whatever the previous command left in the ledger"
    )
    let sendKeys = failure("sendKeys", ["elementId": "element-missing"]) as? HelperError
    check(
      sendKeys?.code == ErrorCode.invalidParams && sendKeys?.effect == .noEffect,
      "a malformed keyboard request reports no effect"
    )
    residue.dispatching()
    let perform = failure("performAccessibilityAction", ["elementId": "element-missing", "key": "0123"]) as? HelperError
    check(
      perform?.code == ErrorCode.staleElement && perform?.effect == .noEffect,
      "an accessibility action on a missing element reports no effect"
    )
    let unkeyed = failure("performAccessibilityAction", ["elementId": "element-missing"]) as? HelperError
    check(
      unkeyed?.code == ErrorCode.invalidParams && unkeyed?.effect == .noEffect,
      "an accessibility action without a key reports no effect"
    )
    let actions = failure("performActions", ["actions": "not-an-array"]) as? HelperError
    check(
      actions?.code == ErrorCode.invalidParams && actions?.effect == .noEffect,
      "a malformed input sequence reports no effect"
    )
    for mechanism: Any in ["pointer", "", 1, NSNull()] {
      residue.dispatching()
      let clear = failure("clear", ["elementId": "element-missing", "mechanism": mechanism]) as? HelperError
      check(
        clear?.code == ErrorCode.invalidParams && clear?.effect == .noEffect,
        "a clear naming an unknown mechanism (\(mechanism)) is refused before dispatch"
      )
    }
    for mechanism in ["semantic", "keyboard"] {
      let clear = failure("clear", ["elementId": "element-missing", "mechanism": mechanism]) as? HelperError
      check(
        clear?.code == ErrorCode.staleElement && clear?.effect == .noEffect,
        "a \(mechanism) clear of a missing element reports no effect"
      )
    }
    let probe = try? driver.execute(command: "probe", params: [:], token: token).result as? JSONObject
    check(
      (probe?["features"] as? JSONObject)?["strictClear"] as? Bool == true,
      "probe reports that clear honors a requested mechanism"
    )
    let read = failure("windows") as? HelperError
    check(read != nil && read?.effect == nil, "a read-only command does not claim an effect")
    let unsupported = failure("not-a-command") as? HelperError
    check(unsupported?.code == ErrorCode.unsupported && unsupported?.effect == nil, "an unknown command does not claim an effect")

    token.cancel()
    check(
      (failure("setWindowRect", ["windowId": "window-missing"]) as? CancelledError)?.effect == .noEffect,
      "a mutation cancelled before dispatch reports no effect"
    )
    let cancelledRead = failure("windows") as? CancelledError
    check(cancelledRead != nil && cancelledRead?.effect == nil, "a cancelled read-only command does not claim an effect")
  }

  /// Drives the real `Host` over in-process pipes: cancelling a request that is still queued acknowledges it with the
  /// right effect and keeps it from ever reaching the driver, while later requests still run.
  private func testHostQueuedCancellation() {
    let toHost = Pipe()
    let fromHost = Pipe()
    let state = NSCondition()
    var messages: [JSONObject] = []
    var executed: [String] = []
    let gate = DispatchSemaphore(value: 0)
    let hostDone = DispatchSemaphore(value: 0)
    let readerDone = DispatchSemaphore(value: 0)

    func waitUntil(_ predicate: () -> Bool) -> Bool {
      let deadline = Date().addingTimeInterval(10)
      state.lock()
      defer { state.unlock() }
      while !predicate() {
        if !state.wait(until: deadline) {
          return predicate()
        }
      }
      return true
    }
    // Callers hold `state`.
    func received(_ type: String, _ id: String) -> Bool {
      messages.contains { $0["type"] as? String == type && $0["id"] as? String == id }
    }
    func find(_ type: String, _ id: String) -> JSONObject? {
      state.lock()
      defer { state.unlock() }
      return messages.first { $0["type"] as? String == type && $0["id"] as? String == id }
    }
    func ran(_ id: String) -> Bool {
      state.lock()
      defer { state.unlock() }
      return executed.contains(id)
    }

    let host = Host()
    host.beforeExecuteForTesting = { id, _ in
      state.lock()
      executed.append(id)
      state.broadcast()
      state.unlock()
      if id == "blocker" {
        gate.wait()
      }
    }
    Thread {
      let reader = FrameReader(fromHost.fileHandleForReading)
      while let frame = try? reader.read() {
        if frame.type == .json, let message = (try? parseJSON(frame.payload)) as? JSONObject {
          state.lock()
          messages.append(message)
          state.broadcast()
          state.unlock()
        }
      }
      readerDone.signal()
    }.start()
    Thread {
      _ = host.run(input: toHost.fileHandleForReading, output: fromHost.fileHandleForWriting)
      hostDone.signal()
    }.start()

    let writer = FrameWriter(toHost.fileHandleForWriting)
    func send(_ type: String, _ id: String, _ command: String? = nil, _ params: JSONObject = [:]) {
      var message: JSONObject = ["type": type, "id": id]
      if let command {
        message["command"] = command
        message["params"] = params
      }
      try? writer.writeJSON(message)
    }

    send("request", "blocker", "probe")
    let blocked = waitUntil { executed.contains("blocker") }
    check(blocked, "the host worker starts the blocking request")
    send("request", "queued-click", "click", ["elementId": "element-never-issued"])
    send("request", "queued-read", "windows")
    send("request", "after", "probe")
    send("cancel", "queued-click")
    send("cancel", "queued-read")
    send("cancel", "never-sent")

    let acknowledged = waitUntil {
      ["queued-click", "queued-read", "never-sent"].allSatisfy { received("cancelled", $0) }
    }
    check(
      acknowledged && !ran("queued-click") && !ran("queued-read"),
      "queued requests are acknowledged as cancelled while the worker is still busy"
    )
    check(
      find("cancelled", "queued-click")?["effect"] as? String == "none",
      "a cancelled queued mutation reports no effect"
    )
    let read = find("cancelled", "queued-read")
    check(read != nil && read?["effect"] == nil, "a cancelled queued read carries no effect")
    check(
      find("cancelled", "never-sent")?["effect"] as? String == "none",
      "a cancel for an id the host does not hold reports none"
    )

    gate.signal()
    let finished = waitUntil { received("response", "blocker") && received("response", "after") }
    check(finished, "the host runs the requests around the cancelled ones")
    state.lock()
    let order = executed
    state.unlock()
    check(order == ["blocker", "after"], "cancelled queued requests never reach the driver")
    check(
      find("response", "queued-click") == nil && find("response", "queued-read") == nil,
      "cancelled queued requests never produce a response"
    )

    try? toHost.fileHandleForWriting.close()
    check(hostDone.wait(timeout: .now() + 10) == .success, "the host stops when its input ends")
    try? fromHost.fileHandleForWriting.close()
    _ = readerDone.wait(timeout: .now() + 10)
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
    check(
      (hello["features"] as? [String])?.contains("accessibilityActions") == true,
      "hello advertises accessibility action inspection"
    )
    check(
      (hello["features"] as? [String])?.contains("boundedObservation") == true,
      "hello advertises bounded observation"
    )
    check(
      (hello["features"] as? [String])?.contains("performAccessibilityAction") == true,
      "hello advertises performing accessibility actions"
    )
    check((hello["features"] as? [String])?.contains("strictClear") == true, "hello advertises strict clear")
  }

  private func testAccessibilityActionNames() {
    check(
      accessibilityActionName("Name:Toggle\nTarget:0x6190039a0880\nSelector:didActivateAccessibilityCustomAction:") == "Toggle"
        && accessibilityActionName("Name:Select\nTarget:0x61900399fe80\nSelector:didActivateAccessibilityCustomAction:") == "Select",
      "a custom action is listed by its authored name without the provider target or selector"
    )
    check(
      accessibilityActionName("Name:Open in tab\nTarget:0x1\nSelector:didActivateAccessibilityCustomAction:") == "Open in tab",
      "a custom action name keeps its spaces"
    )
    check(
      accessibilityActionName("Name:a\nTarget:b\nTarget:0x1\nSelector:s:") == "a\nTarget:b",
      "an authored name containing the target marker is not truncated"
    )
    check(accessibilityActionName("Name:Toggle") == "Toggle", "a custom action without provider fields keeps its name")
    check(accessibilityActionName("AXPress") == "AXPress", "a standard accessibility action is listed unchanged")
    check(accessibilityActionName("") == "", "an empty action name stays empty")
  }

  private func testAccessibilityActionKeys() {
    let keys = AccessibilityActionKeys()
    let toggle = "Name:Toggle\nTarget:0x6190039a0880\nSelector:didActivateAccessibilityCustomAction:"
    let key = keys.key(for: toggle)
    check(
      key.count == 32 && key.allSatisfy { "0123456789abcdef".contains($0) },
      "an action key is 32 lowercase hexadecimal digits"
    )
    check(keys.key(for: toggle) == key, "the same native action keeps its key")
    check(
      keys.key(for: "Name:Toggle\nTarget:0x6190039a0990\nSelector:didActivateAccessibilityCustomAction:") != key,
      "a custom action with the same name and another target gets another key"
    )
    check(!key.contains("6190039a0880"), "a key does not carry the action's target")
    check(AccessibilityActionKeys().key(for: toggle) != key, "keys from another secret do not match")
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
