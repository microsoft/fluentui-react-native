import Foundation

@objc(FRNVisualEffectViewManager)
class VisualEffectViewManager: RCTViewManager {
  override func view()->NSView! {
    return NSVisualEffectView()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
