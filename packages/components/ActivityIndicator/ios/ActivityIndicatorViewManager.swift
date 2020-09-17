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
}
