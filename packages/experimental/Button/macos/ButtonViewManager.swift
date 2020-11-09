import Foundation
import FluentUI

@objc(MSFButtonViewManager)
class ButtonViewManager: RCTViewManager {

	override func view() -> NSView! {
		let button = Button()
		return button
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
