import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNCalloutManager)
class CalloutManager: RCTViewManager {
	override func view()->NSView! {
		return CalloutView(bridge: bridge)
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
