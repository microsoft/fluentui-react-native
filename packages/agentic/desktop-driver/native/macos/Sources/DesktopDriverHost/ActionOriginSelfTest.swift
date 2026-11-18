import ApplicationServices
import Foundation

extension SelfTestRunner {
  func testActionOriginGeometry() {
    let recorder = InputRecorder()
    let effects = EffectLedger()
    let lock = PhysicalInputLock(baseName: "furn-desktop-driver-self-test-\(UUID().uuidString)")
    defer { lock.cleanupSelfTestFiles() }
    let oldFrame = CGRect(x: 200, y: 300, width: 80, height: 40)
    let window = WindowRecord(
      processID: getpid(), leaseID: "test", primary: true,
      element: AXUIElementCreateApplication(getpid()), frame: oldFrame, title: "Test"
    )
    var elementFrame: CGRect?
    var viewportFrame: CGRect?
    var viewportError: HelperError?
    let driver = Driver(
      effects: effects,
      input: InputController(effects: effects, environment: recorder.environment),
      inputLock: lock,
      actionOriginFrames: ActionOriginFrames(
        element: { _, _ in elementFrame },
        viewport: {
          try window.readActionOriginFrame { _ in
            if let viewportError { throw viewportError }
            return viewportFrame
          }
        }
      )
    )
    let element: JSONObject = ["elementId": "element-test"]
    let token = CancellationToken()

    func perform(_ source: String, _ action: JSONObject) throws {
      _ = try driver.execute(command: "performActions", params: ["actions": [["type": source, "actions": [action]]]], token: token)
    }

    func refuse(_ label: String, source: String, action: JSONObject, reason: String? = nil) {
      let before = recorder.posted.count
      do {
        try perform(source, action)
        check(false, "\(label) is refused")
      } catch let error as HelperError {
        check(
          error.code == ErrorCode.moveTargetOutOfBounds && error.effect == .noEffect
            && recorder.posted.count == before && error.data?["reason"] as? String == reason,
          "\(label) is refused without posting input"
        )
      } catch {
        check(false, "\(label) returns a helper error: \(error)")
      }
    }

    refuse("an unreadable element origin", source: "pointer", action: ["type": "pointerMove", "origin": element, "x": 1, "y": 2])
    elementFrame = CGRect(x: 200, y: 300, width: -2, height: 20)
    refuse(
      "an element origin with negative width", source: "wheel",
      action: ["type": "scroll", "origin": element, "x": 1, "y": 2, "deltaX": 0, "deltaY": 1]
    )
    refuse("a missing live viewport even with a cached frame", source: "pointer", action: ["type": "pointerMove", "x": 1, "y": 2])
    viewportError = HelperError(code: ErrorCode.automationFailed, message: "AX read failed", data: ["reason": "target-non-response"])
    refuse(
      "a failing viewport geometry query", source: "wheel",
      action: ["type": "scroll", "origin": "viewport", "x": 1, "y": 2, "deltaX": 0, "deltaY": 1],
      reason: "target-non-response"
    )
    viewportError = nil
    viewportFrame = CGRect(x: CGFloat.infinity, y: 300, width: 80, height: 40)
    refuse("a non-finite viewport origin", source: "pointer", action: ["type": "pointerMove", "x": 1, "y": 2])

    do {
      elementFrame = CGRect(x: 90, y: 120, width: 40, height: 60)
      try perform("pointer", ["type": "pointerMove", "origin": element, "x": 1, "y": 2])
      check(recorder.environment.pointerLocation() == CGPoint(x: 111, y: 152), "a readable element origin uses its live center")
      viewportFrame = CGRect(x: 20, y: 30, width: 80, height: 40)
      try perform("pointer", ["type": "pointerMove", "x": 1, "y": 2])
      check(recorder.environment.pointerLocation() == CGPoint(x: 21, y: 32), "a readable viewport uses its live origin, not its cached frame")
    } catch {
      check(false, "valid action origins still move to the requested point: \(error)")
    }
  }
}
