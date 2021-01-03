import Foundation
import FluentUI

@objc(MSFUIButtonViewManager)
class UIButtonViewManager: RCTViewManager {

	override func view() -> UIView! {
		let button = UIButtonWrapper()
	return button
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
