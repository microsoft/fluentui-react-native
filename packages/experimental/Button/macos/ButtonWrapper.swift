import FluentUI

class ButtonWrapper: Button {
	/// button event block
	@objc public var onPress:RCTBubblingEventBlock?

	@objc public override init() {
		super.init()
		self.target = self
		self.action = #selector(sendCallback)
	}

	@objc private func sendCallback() {
		if onPress != nil {
			/// no data to send to JS
			onPress!(nil)
		}
	}
}
