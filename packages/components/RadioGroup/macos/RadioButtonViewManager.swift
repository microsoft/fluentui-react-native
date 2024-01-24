import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNRadioButtonViewManager)
class RadioButtonViewManager: RCTViewManager {

	override func view()->NSView! {
		let radioButton = RadioButton.init(radioButtonWithTitle: "", target: nil, action: nil)
		radioButton.action = #selector(radioButton.sendCallback)
		radioButton.target = radioButton
		return radioButton
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
