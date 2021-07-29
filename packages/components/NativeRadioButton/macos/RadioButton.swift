class RadioButton: NSButton {

	@objc public var onPress:RCTBubblingEventBlock?
	
	@objc public func callOnPress() {
		self.window?.makeFirstResponder(self)
		if (onPress != nil) {
			onPress!(nil)
		}
	}
	
	/// Set button state to 'on' when it becomes focused
	override func becomeFirstResponder() -> Bool {
		/// fire onChange event
		if (state != NSButton.StateValue.on) {
			callOnPress()
		}
		state = NSButton.StateValue.on
		return super.becomeFirstResponder()
	}
}
