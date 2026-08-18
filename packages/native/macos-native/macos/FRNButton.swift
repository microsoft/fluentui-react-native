import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNButton)
class FRNButton: NSButton {

  @objc public var onPress: RCTBubblingEventBlock?

  public override init(frame: NSRect) {
    super.init(frame: frame)
    setButtonType(.momentaryPushIn)
    target = self
    action = #selector(sendPressEvent)
  }

  required init?(coder: NSCoder) {
    preconditionFailure("init(coder:) has not been implemented")
  }

  @objc(sendPressEvent:)
  private func sendPressEvent(sender: NSButton) {
    onPress?([:])
  }
}
