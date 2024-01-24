import AppKit
import Foundation
import React

@objc(FRNVibrancyViewManager)
class VibrancyViewManager: RCTViewManager {

  override func view()->NSView! {
	return VibrancyView()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
