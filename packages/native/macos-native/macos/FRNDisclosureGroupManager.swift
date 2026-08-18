import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNDisclosureGroupManager)
class FRNDisclosureGroupManager: RCTViewManager {

  override func view() -> NSView! {
    if #available(macOS 11.0, *) {
      return FRNDisclosureGroup()
    }
    return FRNDisclosureGroupFallback()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
