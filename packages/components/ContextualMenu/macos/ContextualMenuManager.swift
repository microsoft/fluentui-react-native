import Foundation

@objc(FRNContextualMenuManager)
class ContextualMenuManager: RCTViewManager {
	override func view()->NSView! {
		return ContextualMenu(bridge: bridge)
	}
	
	override func shadowView()->NSView! {
		return nil
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
