import Foundation

@objc(MSFRadioButtonViewManager)
class RadioButtonViewManager: RCTViewManager {
	
	override func view()->NSView! {
		let radioButton = NSButton.init();
		radioButton.setButtonType(NSButton.ButtonType.radio);
		return radioButton;
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

}
