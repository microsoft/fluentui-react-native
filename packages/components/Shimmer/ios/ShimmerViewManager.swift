import Foundation
import FluentUI


@objc(FRNShimmerViewManager)
class ShimmerViewManager: RCTViewManager {
  override func view() -> UIView! {
	let shimmer = ShimmerLinesView()
	return shimmer
  }

  override class func requiresMainQueueSetup() -> Bool {
	return true
  }
}
