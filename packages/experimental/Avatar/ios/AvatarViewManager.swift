import Foundation
import FluentUI

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	override func view()->UIView! {
		let avatarView = AvatarView(avatarSize: .small)
		return avatarView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	override func constantsToExport() -> [AnyHashable : Any]! {
		return [
			"sizes" : [
				"xSmall" : AvatarSize.extraSmall.size.width,
				"small" : AvatarSize.small.size.width,
				"medium" : AvatarSize.medium.size.width,
				"large" : AvatarSize.large.size.width,
				"xLarge" : AvatarSize.extraLarge.size.width,
				"xxLarge" : AvatarSize.extraExtraLarge.size.width
			]
		]
	}
}
