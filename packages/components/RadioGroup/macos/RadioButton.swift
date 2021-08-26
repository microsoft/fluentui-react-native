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
	
	override func reactSetFrame(_ frame: CGRect) {
		super.reactSetFrame(frame)
		self.frame = CGRect(x: frame.origin.x, y: frame.origin.y, width: intrinsicContentSize.width, height: intrinsicContentSize.height)
	}
}
