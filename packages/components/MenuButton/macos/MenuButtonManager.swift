import Foundation

@objc(MSFMenuButtonManager)
class MenuButtonManager: RCTViewManager {
  override func view()->NSView! {
    let menuButton = MenuButton()
    
//    let image = NSImage(named: NSImage.iconViewTemplateName)!
//    image.size = CGSize(width: 16, height: 16)
//    menuButton.image = image
    
    return menuButton
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }
}
