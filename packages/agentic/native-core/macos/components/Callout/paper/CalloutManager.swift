import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(RCTCalloutManager)
class CalloutManager: RCTViewManager {
	override func view()->NSView! {
		return CalloutView(bridge: bridge)
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	// React Native calls these on the module's method queue; views can only be looked up on the main queue.
	@objc func focusWindow(_ viewTag: NSNumber) {
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			(manager.bridge?.uiManager?.view(forReactTag: viewTag) as? CalloutView)?.focusWindow()
		}
	}

	@objc func blurWindow(_ viewTag: NSNumber) {
		nonisolated(unsafe) let manager = self
		DispatchQueue.main.async {
			(manager.bridge?.uiManager?.view(forReactTag: viewTag) as? CalloutView)?.blurWindow()
		}
	}
}
