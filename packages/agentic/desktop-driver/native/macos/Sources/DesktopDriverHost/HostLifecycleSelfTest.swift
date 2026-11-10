import ApplicationServices
import Darwin
import Foundation

/// Runs a real `Host` in process over pipes with a driver whose input is recorded and whose physical-input lock is
/// private to the test, so shutdown and transport failures can be driven without touching the machine.
private final class HostHarness: @unchecked Sendable {
  let toHost = Pipe()
  let fromHost = Pipe()
  let recorder = InputRecorder()
  let input: InputController
  let lockName = "furn-desktop-driver-self-test-\(getpid())-\(UUID().uuidString)"
  let host: Host

  private let state = NSCondition()
  private var messages: [JSONObject] = []
  private var dispatched: [String] = []
  private var exits: [Int32] = []
  private var code: Int32?
  private let writer: FrameWriter

  init() {
    signal(SIGPIPE, SIG_IGN)
    let effects = EffectLedger()
    input = InputController(effects: effects, environment: recorder.environment)
    host = Host(driver: Driver(effects: effects, input: input, inputLock: PhysicalInputLock(baseName: lockName)))
    writer = FrameWriter(toHost.fileHandleForWriting)
    host.beforeExecuteForTesting = { [self] id, _ in
      state.lock()
      dispatched.append(id)
      state.broadcast()
      state.unlock()
    }
    host.exitForTesting = { [self] status in
      state.lock()
      exits.append(status)
      state.broadcast()
      state.unlock()
    }
  }

  deinit {
    PhysicalInputLock(baseName: lockName).cleanupSelfTestFiles()
  }

  func startHost() {
    Thread { [self] in
      let status = host.run(input: toHost.fileHandleForReading, output: fromHost.fileHandleForWriting)
      state.lock()
      code = status
      state.broadcast()
      state.unlock()
    }.start()
  }

  /// Consumes the host's output on a background thread, like the Node client does.
  func startDraining() {
    Thread { [self] in
      let reader = FrameReader(fromHost.fileHandleForReading)
      while let frame = try? reader.read() {
        if frame.type == .json, let message = (try? parseJSON(frame.payload)) as? JSONObject {
          state.lock()
          messages.append(message)
          state.broadcast()
          state.unlock()
        }
      }
    }.start()
  }

  func send(_ id: String, _ command: String, _ params: JSONObject = [:]) {
    try? writer.writeJSON(["type": "request", "id": id, "command": command, "params": params])
  }

  func sendRaw(_ payload: String) {
    guard let frame = try? Framing.encode(type: .json, payload: Data(payload.utf8)) else {
      return
    }
    try? toHost.fileHandleForWriting.write(contentsOf: frame)
  }

  func closeInput() {
    try? toHost.fileHandleForWriting.close()
  }

  func closeOutputReader() {
    try? fromHost.fileHandleForReading.close()
  }

  func finish() {
    closeInput()
    try? fromHost.fileHandleForWriting.close()
  }

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

  func responded(_ id: String) -> Bool {
    waitUntil { messages.contains { $0["type"] as? String == "response" && $0["id"] as? String == id } }
  }

  func dispatchedIDs() -> [String] {
    state.lock()
    defer { state.unlock() }
    return dispatched
  }

  func waitForDispatch(_ id: String) -> Bool {
    waitUntil { dispatched.contains(id) }
  }

  func waitForExitRequest() -> [Int32]? {
    waitUntil { !exits.isEmpty } ? exitRequests() : nil
  }

  private func exitRequests() -> [Int32] {
    state.lock()
    defer { state.unlock() }
    return exits
  }

  func waitForExitCode() -> Int32? {
    waitUntil { code != nil } ? finishedCode() : nil
  }

  private func finishedCode() -> Int32? {
    state.lock()
    defer { state.unlock() }
    return code
  }

  /// Whether another helper could take the physical input lock right now.
  func lockIsFree() -> Bool {
    let other = PhysicalInputLock(baseName: lockName)
    do {
      try other.acquire(token: CancellationToken(), timeoutMilliseconds: 500, policy: .fail)
      other.release()
      return true
    } catch {
      return false
    }
  }
}

private let heldButton: JSONObject = [
  "actions": [["type": "pointer", "id": "mouse", "actions": [["type": "pointerDown", "button": 0]]]]
]

extension SelfTestRunner {
  func testHostLifecycle() {
    testHostEndOfInputReleasesInput()
    testHostDropsQueuedWorkWhenStopping()
    testHostWriteFailureReleasesInput()
    testHostRejectsInvalidJSON()
    testIdleReleaseActionsDoesNotQueue()
  }

  private func testHostEndOfInputReleasesInput() {
    let harness = HostHarness()
    harness.startHost()
    harness.startDraining()
    harness.send("down", "performActions", heldButton)
    check(harness.responded("down"), "the host answers a button press that stays held")
    check(
      harness.recorder.count(.leftMouseDown) == 1 && harness.input.depressedButtonCount == 1 && !harness.lockIsFree(),
      "a held button keeps the physical input lock until it is released"
    )

    harness.closeInput()
    check(harness.waitForExitCode() == 0, "the host returns cleanly when its input ends")
    check(
      harness.recorder.count(.leftMouseUp) == 1 && !harness.input.hasDepressedInput,
      "the host releases a button held by an abandoned command before it returns"
    )
    check(harness.lockIsFree(), "the host frees the physical input lock before it returns")
    harness.finish()
  }

  private func testHostDropsQueuedWorkWhenStopping() {
    let harness = HostHarness()
    harness.startHost()
    harness.startDraining()
    harness.send(
      "blocker",
      "performActions",
      ["actions": [["type": "pointer", "id": "mouse", "actions": [["type": "pause", "duration": 30_000]]]]]
    )
    check(harness.waitForDispatch("blocker"), "the host worker starts a long command")
    harness.send("queued", "probe")
    harness.closeInput()
    check(harness.waitForExitCode() == 0, "the host stops while a command is running and another is queued")
    check(
      harness.dispatchedIDs() == ["blocker"],
      "a request queued behind the running command never starts once the host is stopping"
    )
    harness.finish()
  }

  private func testHostWriteFailureReleasesInput() {
    let harness = HostHarness()
    harness.startHost()
    // Read the hello synchronously so the output pipe can then be closed with nothing else consuming it.
    let hello = try? FrameReader(harness.fromHost.fileHandleForReading).read()
    check(hello?.type == .json, "the host greets the client before it serves requests")
    harness.closeOutputReader()
    harness.send("down", "performActions", heldButton)
    check(harness.waitForExitRequest() == [EXIT_FAILURE], "a response that cannot be written ends the helper")
    check(
      harness.recorder.count(.leftMouseUp) == 1 && !harness.input.hasDepressedInput && harness.lockIsFree(),
      "the helper releases held input and its lock before it exits on a failed write"
    )
    harness.closeInput()
    check(harness.waitForExitCode() == 1, "a host whose transport failed reports failure")
    harness.finish()
  }

  private func testHostRejectsInvalidJSON() {
    for (payload, name) in [("{", "a frame that is not valid JSON"), ("[]", "a JSON frame that is not an object")] {
      let harness = HostHarness()
      harness.startHost()
      harness.startDraining()
      harness.sendRaw(payload)
      check(harness.waitForExitCode() == 1, "the host fails its transport on \(name)")
      harness.finish()
    }
  }

  private func testIdleReleaseActionsDoesNotQueue() {
    let name = "furn-desktop-driver-self-test-\(getpid())-\(UUID().uuidString)"
    let other = PhysicalInputLock(baseName: name)
    let effects = EffectLedger()
    let recorder = InputRecorder()
    let driver = Driver(
      effects: effects,
      input: InputController(effects: effects, environment: recorder.environment),
      inputLock: PhysicalInputLock(baseName: name)
    )
    defer { other.cleanupSelfTestFiles() }
    let token = CancellationToken()
    do {
      try other.acquire(token: token, timeoutMilliseconds: 500, policy: .fail)
      defer { other.release() }
      // A helper that holds nothing must not wait behind another helper's physical input just to release nothing.
      DispatchQueue.global().asyncAfter(deadline: .now() + 2) { token.cancel() }
      let began = Date()
      _ = try driver.execute(command: "releaseActions", params: [:], token: token)
      check(Date().timeIntervalSince(began) < 1.5, "releasing with nothing held does not wait for another helper's input lock")
    } catch {
      check(false, "releasing with nothing held succeeds while another helper holds input: \(error)")
    }
  }
}
