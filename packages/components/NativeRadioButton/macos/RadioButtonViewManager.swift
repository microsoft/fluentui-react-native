import Foundation

@objc(RadioButtonViewManager)
class RadioButtonViewManager: RCTViewManager {

	override func view()->NSView! {
		let radioButton = RadioButton.init(radioButtonWithTitle: "", target: nil, action: nil)
		radioButton.action = #selector(radioButton.callOnPress)
		radioButton.target = radioButton
		return radioButton
	}
	
	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
