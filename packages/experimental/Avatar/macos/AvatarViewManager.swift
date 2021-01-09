import Foundation
import FluentUI

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	override func view()->NSView! {
		let avatarView = AvatarView(avatarSize: 72)
		return avatarView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

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
