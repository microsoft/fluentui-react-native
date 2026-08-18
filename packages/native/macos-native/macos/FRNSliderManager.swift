import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNSliderManager)
class FRNSliderManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNSlider()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
