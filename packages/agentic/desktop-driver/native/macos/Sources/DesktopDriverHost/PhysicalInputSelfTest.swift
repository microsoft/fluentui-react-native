import ApplicationServices
import Foundation

extension SelfTestRunner {
  func testPhysicalInputReadiness() {
    let applicationElement = AXUIElementCreateApplication(getpid())
    let window = WindowRecord(
      processID: getpid(),
      leaseID: "test-lease",
      primary: true,
      element: applicationElement,
      frame: CGRect(x: 0, y: 0, width: 800, height: 600),
      title: "Test"
    )
    let accessibility = AccessibilityEngine()
    let sameProcess = accessibility.externalWindowSnapshot(window: window, hit: applicationElement)
    check(
      sameProcess.windowID == window.id && sameProcess.parentID == nil,
      "a covering window in the target process retains the no-activation obstruction scope"
    )
    let unknownProcess = accessibility.externalWindowSnapshot(window: window, hit: AXUIElementCreateSystemWide())
    check(
      unknownProcess.windowID == window.id,
      "an unproven hit owner never permits raising through a possibly same-process covering window"
    )
    let external = accessibility.externalWindowSnapshot(
      window: window, hit: AXUIElementCreateApplication(getppid())
    )
    check(
      external.windowID != window.id && external.parentID == nil,
      "an external hit never impersonates the target window and blocks its pre-click activation"
    )

    var workspaceRequests = 0
    let unchanged = activateApplication(
      isFrontmost: { false },
      accessibility: { .success },
      workspace: { workspaceRequests += 1 }
    )
    check(
      workspaceRequests == 1 && unchanged.method == "accessibility+workspace",
      "an acknowledged AXFrontmost write that does not activate uses the workspace fallback"
    )

    var frontmost = false
    workspaceRequests = 0
    let activated = activateApplication(
      isFrontmost: { frontmost },
      accessibility: { frontmost = true; return .success },
      workspace: { workspaceRequests += 1 }
    )
    check(
      workspaceRequests == 0 && activated.method == "accessibility",
      "an established Accessibility activation does not request workspace activation"
    )

    workspaceRequests = 0
    let rejected = activateApplication(
      isFrontmost: { false },
      accessibility: { .attributeUnsupported },
      workspace: { workspaceRequests += 1 }
    )
    check(
      workspaceRequests == 1 && rejected.accessibilityError == .attributeUnsupported,
      "an unsupported AXFrontmost write retains its workspace fallback and diagnostics"
    )

    func keyboardClear(
      focusReady: Bool = true,
      text: String? = "F16",
      selection: @escaping () -> CFRange? = { CFRange(location: 0, length: 3) },
      afterDelete: String = "",
      cancelledAfterDelete: Bool = false
    ) -> (error: Error?, events: Int, deletes: Int, waits: [Int], effect: MutationEffect) {
      let recorder = InputRecorder()
      let ledger = EffectLedger()
      let input = InputController(effects: ledger, environment: recorder.environment)
      let token = CancellationToken()
      var deleted = false
      var deletes = 0
      var waits: [Int] = []
      var error: Error?
      do {
        try clearWithKeyboard(
          token: token,
          focus: {},
          hasFocus: { focusReady },
          value: { deleted ? afterDelete : text },
          selectedRange: selection,
          selectAll: { try input.selectAll(token: token) },
          delete: {
            try input.deleteSelection(token: token)
            deleted = true
            deletes += 1
            if cancelledAfterDelete { token.cancel() }
          },
          wait: { waits.append($0); try token.throwIfCancelled() }
        )
      } catch let failure {
        error = failure
      }
      input.releaseAll()
      return (error, recorder.posted.count, deletes, waits, ledger.effect)
    }

    let unfocused = keyboardClear(focusReady: false)
    check(
      (unfocused.error as? HelperError)?.code == ErrorCode.notInteractable
        && unfocused.events == 0 && unfocused.effect == .noEffect,
      "keyboard clear never posts keys when the field did not take focus"
    )

    do {
      let recorder = InputRecorder()
      var environment = recorder.environment
      let post = environment.post
      var keyDowns: [(Int64, CGEventFlags)] = []
      environment.post = { event in
        if event.type == .keyDown {
          keyDowns.append((event.getIntegerValueField(.keyboardEventKeycode), event.flags))
        }
        post(event)
      }
      let input = InputController(effects: EffectLedger(), environment: environment)
      try input.selectAll(token: CancellationToken())
      check(
        keyDowns.count == 2
          && keyDowns[0].0 == 126 && keyDowns[0].1.contains(.maskCommand)
          && keyDowns[1].0 == 125 && keyDowns[1].1.contains([.maskCommand, .maskShift])
          && !input.hasDepressedInput,
        "keyboard selection navigates the document without the application's Select All menu command"
      )
    } catch {
      check(false, "keyboard document selection releases its chords: \(error)")
    }

    var selectionReads = 0
    let asynchronous = keyboardClear(selection: {
      selectionReads += 1
      return selectionReads < 3 ? CFRange(location: 3, length: 0) : CFRange(location: 0, length: 3)
    })
    check(
      asynchronous.error == nil && asynchronous.deletes == 1 && selectionReads >= 3,
      "keyboard clear waits for Select All to reach the field editor before deleting once"
    )

    let unselected = keyboardClear(selection: { CFRange(location: 3, length: 0) })
    check(
      (unselected.error as? HelperError)?.code == ErrorCode.inputFailed
        && unselected.deletes == 0 && unselected.effect == .partial,
      "a Select All that did not select the value fails with partial effect before Delete"
    )

    let retained = keyboardClear(afterDelete: "F1")
    check(
      (retained.error as? HelperError)?.code == ErrorCode.inputFailed
        && retained.deletes == 1 && retained.effect == .partial,
      "a keyboard clear that leaves text fails honestly without repeating input"
    )

    let unreadable = keyboardClear(text: nil)
    check(
      (unreadable.error as? HelperError)?.code == ErrorCode.unsupported
        && unreadable.events == 0 && unreadable.effect == .noEffect,
      "keyboard clear refuses an unreadable value before posting keys"
    )

    let cancelled = keyboardClear(afterDelete: "F16", cancelledAfterDelete: true)
    check(
      cancelled.error is CancelledError && cancelled.deletes == 1 && cancelled.effect == .partial,
      "cancellation during clear verification preserves the posted effect and does not replay keys"
    )
  }
}
