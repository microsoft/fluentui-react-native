import AppKit
#if USE_REACT_AS_MODULE
import React
#endif

@objc(FRNNativeCoreDialogWindowManager)
class DialogWindowManager: RCTViewManager {
    override class func requiresMainQueueSetup() -> Bool { true }

    override func view() -> NSView! {
        nonisolated(unsafe) let manager = self
        return MainActor.assumeIsolated { DialogWindowView(bridge: manager.bridge) }
    }
}
