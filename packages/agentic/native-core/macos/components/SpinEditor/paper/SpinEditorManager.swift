import AppKit
#if USE_REACT_AS_MODULE
import React
#endif

@objc(FRNNativeCoreSpinEditorManager)
class SpinEditorManager: RCTViewManager {
    override class func requiresMainQueueSetup() -> Bool { true }

    override func view() -> NSView! {
        MainActor.assumeIsolated { SpinEditorView(frame: .zero) }
    }
}
