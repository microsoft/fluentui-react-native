import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNProgressIndicator)
class FRNProgressIndicator: NSProgressIndicator {

  @objc public var animating: Bool = false {
    didSet {
      if animating {
        startAnimation(nil)
      } else {
        stopAnimation(nil)
      }
    }
  }

  public override init(frame: NSRect) {
    super.init(frame: frame)
  }

  required init?(coder: NSCoder) {
    preconditionFailure("init(coder:) has not been implemented")
  }
}
