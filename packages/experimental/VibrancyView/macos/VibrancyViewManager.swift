import Foundation

@objc(FRNVibrancyViewManager)
class VibrancyViewManager: RCTViewManager {

  override func view()->NSView! {
	return VibrancyView()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
