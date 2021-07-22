import Foundation

class RadioButtonView: NSButton {

	@objc public var onChange:RCTBubblingEventBlock?

	public init() {
		super.init(frame: .zero)
		self.title = ""
		self.setButtonType(NSButton.ButtonType.radio)
		self.action = #selector(callOnChange)
		self.target = self
	}

	required public init?(coder: NSCoder) {
		fatalError("init(coder:) has not been implemented")
	}
	
	@objc private func callOnChange() {
		if onChange != nil {
			onChange!(nil)
		}
	}
}
