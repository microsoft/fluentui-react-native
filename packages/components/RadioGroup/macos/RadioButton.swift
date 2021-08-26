class RadioButton: NSButton {

	@objc public var onPress: RCTBubblingEventBlock?

	public override init(frame:NSRect) {
		super.init(frame: frame)
		translatesAutoresizingMaskIntoConstraints = false;
	}
	
	required init?(coder: NSCoder) {
		preconditionFailure("init(coder:) has not been implemented")
	}
	
	@objc public func sendCallback() {
		self.window?.makeFirstResponder(self)
		if (onPress != nil) {
			onPress!(nil)
		}
	}
}
