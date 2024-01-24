import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

class RadioButton: NSButton {

	@objc public var onPress: RCTBubblingEventBlock?

	public override init(frame:NSRect) {
		super.init(frame: frame)
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
