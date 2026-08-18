import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNProgressIndicatorManager)
class FRNProgressIndicatorManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNProgressIndicator()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
