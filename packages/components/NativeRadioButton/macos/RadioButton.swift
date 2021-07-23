class RadioButton: NSButton {

	@objc public var onPress:RCTBubblingEventBlock?
		
	public init() {
		super.init(frame: .zero)
		self.action = #selector(callOnPress)
		self.setButtonType(NSButton.ButtonType.radio)
		self.target = self
	}
	
	required init?(coder: NSCoder) {
		fatalError("init(coder:) has not been implemented")
	}
	
	@objc public func callOnPress() {
		if (onPress != nil){
			onPress!(nil)
		}
	}
	
	override func becomeFirstResponder() -> Bool {
		self.state = NSButton.StateValue.on
		return super.becomeFirstResponder()
	}
}
