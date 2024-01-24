import Foundation
import FluentUI
import React
import UIKit

@objc(FRNAvatarViewManager)
class AvatarViewManager: RCTViewManager {

	override func view()->UIView! {
		return MSFAvatar()
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	// We export the sizes to pass to React Native as a hardcoded height/width for the component.
	// In the future, these sizes should come from the token pipeline.
	override func constantsToExport() -> [AnyHashable : Any]! {
		return [
			"sizes" : [
				"size16" : 16,
				"size20" : 20,
				"size24" : 24,
				"size32" : 32,
				"size40" : 40,
				"size56" : 56,
				"size72" : 72,
			]
		]
	}
}
