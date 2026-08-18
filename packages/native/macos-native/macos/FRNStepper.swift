import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNStepper)
class FRNStepper: NSStepper {

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
  private func sendValueChangeEvent(sender: NSStepper) {
    onValueChange?(["value": self.doubleValue])
  }
}
