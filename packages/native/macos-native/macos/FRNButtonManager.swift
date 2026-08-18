import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNButtonManager)
class FRNButtonManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNButton()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
