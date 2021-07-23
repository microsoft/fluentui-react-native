import AppKit

class RadioButtonView: NSButton {

	@objc public var onChange:RCTBubblingEventBlock?

	override func becomeFirstResponder() -> Bool {
		self.state = NSButton.StateValue.on
		return super.becomeFirstResponder()
	}
}
