import FluentUI

class ButtonWrapper: Button {
	/// button event block
	@objc public var onPress:RCTBubblingEventBlock?
	@objc public var isImageTinted: Bool = true
	override var image: NSImage?{
		didSet {
			image?.isTemplate = isImageTinted ? true : false
		}
	}
	@objc public init() {
		super.init(title: "", image: nil, imagePosition: .imageLeading, format: ButtonFormat())
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
