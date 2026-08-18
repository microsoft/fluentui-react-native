import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNSlider)
class FRNSlider: NSSlider {

  @objc public var onValueChange: RCTBubblingEventBlock?

  public override init(frame: NSRect) {
    super.init(frame: frame)
    target = self
    action = #selector(sendValueChangeEvent)
  }

  required init?(coder: NSCoder) {
    preconditionFailure("init(coder:) has not been implemented")
  }

  @objc(sendValueChangeEvent:)
  private func sendValueChangeEvent(sender: NSSlider) {
    onValueChange?(["value": self.doubleValue])
  }
}
