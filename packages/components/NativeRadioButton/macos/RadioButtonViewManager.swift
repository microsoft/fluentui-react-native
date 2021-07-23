import Foundation

@objc(MSFRadioButtonViewManager)
class RadioButtonViewManager: RCTViewManager {
	var radioButton :RadioButtonView?
	
	override func view()->NSView! {
		radioButton = RadioButtonView.init(radioButtonWithTitle: "", target: self, action: #selector(callOnChange))
		return radioButton
	}
	@objc public func callOnChange() {
		if let onChange = radioButton?.onChange {
			onChange(nil)
		}
	}
	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
