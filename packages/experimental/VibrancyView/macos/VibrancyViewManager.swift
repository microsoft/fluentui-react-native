import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNVibrancyViewManager)
class VibrancyViewManager: RCTViewManager {

  override func view()->NSView! {
	return VibrancyView()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
