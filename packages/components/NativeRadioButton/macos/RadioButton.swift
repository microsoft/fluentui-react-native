class RadioButton: NSButton {

	@objc public var onPress:RCTBubblingEventBlock?
	
	@objc public func callOnPress() {
		if (onPress != nil) {
			onPress!(nil)
		}
	}
	/// Set button state to 'on' when it becomes focused
	override func becomeFirstResponder() -> Bool {
		self.state = NSButton.StateValue.on
		return super.becomeFirstResponder()
	}
}
