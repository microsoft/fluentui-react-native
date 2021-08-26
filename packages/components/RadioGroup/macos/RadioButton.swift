class RadioButton: NSButton {

	@objc public var onPress: RCTBubblingEventBlock?

	@objc public func sendCallback() {
		self.window?.makeFirstResponder(self)
		if (onPress != nil) {
			onPress!(nil)
		}
	}
	
	override func reactSetFrame(_ frame: CGRect) {
		super.reactSetFrame(frame)
		translatesAutoresizingMaskIntoConstraints = false;
		self.frame = CGRect(x: frame.origin.x, y: frame.origin.y, width: intrinsicContentSize.width, height: intrinsicContentSize.height)
	}
}
