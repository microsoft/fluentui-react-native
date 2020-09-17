import Foundation
import FluentUI

@objc(MSFActivityIndicatorViewManager)
class ActivityIndicatorViewManager: RCTViewManager {
	override func view()->UIView! {
		let activityIndicatorView = ActivityIndicatorView(size: .medium)
		activityIndicatorView.startAnimating()
		return activityIndicatorView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
	
	override func constantsToExport() -> [AnyHashable : Any]! {
		return [
			"sizes" : [
				"xSmall" : ActivityIndicatorViewSize.xSmall.sideSize,
				"small" : ActivityIndicatorViewSize.small.sideSize,
				"medium" : ActivityIndicatorViewSize.medium.sideSize,
				"large" : ActivityIndicatorViewSize.large.sideSize,
				"xLarge" : ActivityIndicatorViewSize.xLarge.sideSize
			]
		]
	}
	
	
}
