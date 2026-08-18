import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNSegmentedControlManager)
class FRNSegmentedControlManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNSegmentedControl()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
