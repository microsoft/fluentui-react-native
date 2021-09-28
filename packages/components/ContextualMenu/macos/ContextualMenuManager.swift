import Foundation

@objc(FRNContextualMenuManager)
class ContextualMenuManager: RCTViewManager {

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	override func view()->NSView! {
		return ContextualMenu(bridge: bridge)
	}
}
