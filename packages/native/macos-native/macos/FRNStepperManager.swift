import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNStepperManager)
class FRNStepperManager: RCTViewManager {

  override func view() -> NSView! {
    return FRNStepper()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
