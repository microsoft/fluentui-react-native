import AppKit
#if USE_REACT_AS_MODULE
import React
#endif

@objc(FRNNativeCoreRangeTargetManager)
class RangeTargetManager: RCTViewManager {
    override class func requiresMainQueueSetup() -> Bool { true }

    override func view() -> NSView! {
        MainActor.assumeIsolated { RangeTargetView(frame: .zero) }
    }
}
