import Foundation

@objc(MSFRadioButtonViewManager)
class RadioButtonViewManager: RCTViewManager {
	
	override func view()->NSView! {
		let radioButton = NSButton.init(radioButtonWithTitle: "", target: self, action: #selector(callOnChange));
		return radioButton;
	}
	
	@objc private func callOnChange() {

	}
	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

}
