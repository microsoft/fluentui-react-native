import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNMenuButtonManager)
class MenuButtonManager: RCTViewManager {
  override func view()->NSView! {
    return MenuButton()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
