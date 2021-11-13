import Foundation

@objc(FRNMenuButtonManager)
class MenuButtonManager: RCTViewManager {
  override func view()->NSView! {
    return MenuButton()
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
