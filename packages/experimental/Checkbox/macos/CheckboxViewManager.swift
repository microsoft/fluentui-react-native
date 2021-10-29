import Foundation

@objc(FRNCheckboxViewManager)
class CheckboxViewManager: RCTViewManager {

	override func view()->NSView! {
		let checkbox = Checkbox.init(checkboxWithTitle: "", target: nil, action: nil)
		checkbox.action = #selector(checkbox.sendCallback)
		checkbox.target = checkbox
		return checkbox
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
