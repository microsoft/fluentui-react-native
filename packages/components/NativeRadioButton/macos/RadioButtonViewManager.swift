import Foundation

@objc(RadioButtonViewManager)
class RadioButtonViewManager: RCTViewManager {

	override func view()->NSView! {
		let radioButton = RadioButton()
		return radioButton
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
