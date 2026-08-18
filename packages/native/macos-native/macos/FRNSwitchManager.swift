import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNSwitchManager)
class FRNSwitchManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNSwitch()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
