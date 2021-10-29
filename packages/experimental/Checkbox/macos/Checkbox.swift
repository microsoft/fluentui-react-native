class Checkbox: NSButton {

	@objc public var onPress: RCTBubblingEventBlock?

	public override init(frame:NSRect) {
		super.init(frame: frame)
		translatesAutoresizingMaskIntoConstraints = false;
	}

	required init?(coder: NSCoder) {
		preconditionFailure("init(coder:) has not been implemented")
	}

	@objc public func sendCallback(sender: NSButton) {
		if (onPress != nil) {
			let isChecked = self.state == NSControl.StateValue.on
			onPress!(["isChecked": isChecked]);
		}
	}
}
