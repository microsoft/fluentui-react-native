import FluentUI

class ButtonWrapper: Button {
	/// button event block
	@objc public var onPress:RCTBubblingEventBlock?

	@objc public override init(frame: CGRect = .zero) {
		super.init(frame: frame)
		self.addTarget(self, action: #selector(sendCallback), for: .touchUpInside)
	}

	required init?(coder aDecoder: NSCoder) {
		fatalError("init(coder:) has not been implemented")
	}

	@objc private func sendCallback() {
		if onPress != nil {
			/// no data to send to JS
			onPress!(nil)
		}
	}
}
