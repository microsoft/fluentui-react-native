import AppKit
#if USE_REACT_AS_MODULE
import React
#endif

@objc(FRNNativeCoreSingleSelectManager)
class SingleSelectManager: RCTViewManager {
    override class func requiresMainQueueSetup() -> Bool { true }

    override func view() -> NSView! {
        MainActor.assumeIsolated { SingleSelectView(frame: .zero, pullsDown: false) }
    }
}
