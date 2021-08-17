import Foundation
import FluentUI

@objc(FRNButtonViewManager)
class ButtonViewManager: RCTViewManager {

	override func view() -> UIView! {
	  let button = ButtonWrapper()
	  return button
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
