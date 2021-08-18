class RadioButton: NSButton {

	@objc public var onPress: RCTBubblingEventBlock?

	@objc public func sendCallback() {
		self.window?.makeFirstResponder(self)
		if (onPress != nil) {
			onPress!(nil)
		}
	}
}
