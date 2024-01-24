import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

class Checkbox: NSButton {

	@objc public var onPress: RCTBubblingEventBlock?

	public override init(frame:NSRect) {
		super.init(frame: frame)
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
