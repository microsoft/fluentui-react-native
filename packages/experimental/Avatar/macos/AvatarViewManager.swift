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
				"xSmall" : 16,
				"small" : 24,
				"medium" : 32,
				"large" : 40,
				"xLarge" : 52,
				"xxLarge" : 72
			]
		]
	}
}
