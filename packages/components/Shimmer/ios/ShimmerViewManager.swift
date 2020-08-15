import Foundation
import FluentUI

@objc(MSFShimmerViewManager)
class ShimmerViewManager: RCTViewManager {
	
  override func view() -> UIView! {
	return ShimmerContainerView()
  }

  override class func requiresMainQueueSetup() -> Bool {
	return true
  }
}
