import Foundation
import FluentUI

@objc(MSFShimmerViewManager)
class ShimmerViewManager: RCTViewManager {

	override func view() -> UIView! {
		let shimmerView = ShimmerView()
		shimmerView.shimmersLeafViews = true
		return shimmerView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
}
