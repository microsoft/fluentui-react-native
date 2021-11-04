import Foundation

@objc(FRNCalloutManager)
class CalloutManager: RCTViewManager {
	override func view()->NSView! {
		return CalloutView(bridge: bridge)
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
