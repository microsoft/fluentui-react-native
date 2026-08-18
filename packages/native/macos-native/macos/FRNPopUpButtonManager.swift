import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNPopUpButtonManager)
class FRNPopUpButtonManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNPopUpButton()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
