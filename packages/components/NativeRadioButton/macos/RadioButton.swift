import AppKit

class RadioButton: NSButton {

	@objc public var onChange:RCTBubblingEventBlock?
		
	public init() {
		super.init(frame: .zero)
		self.action = #selector(callOnChange)
		self.setButtonType(NSButton.ButtonType.radio)
		self.target = self
	}
	
	required init?(coder: NSCoder) {
		fatalError("init(coder:) has not been implemented")
	}
	
	@objc public func callOnChange() {
		if (onChange != nil){
			onChange!(nil)
		}
	}
	
	override func becomeFirstResponder() -> Bool {
		self.state = NSButton.StateValue.on
		return super.becomeFirstResponder()
	}
}
