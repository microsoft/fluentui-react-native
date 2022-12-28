import Foundation
import FluentUI

@objc(FRNAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	override func view()->NSView! {
		let avatarView = AvatarView(avatarSize: 72)
		return avatarView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

// https://github.com/microsoft/fluentui-apple/issues/391
// These enum values should be defined in FluentUI Apple and not FluentUI React Native
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
