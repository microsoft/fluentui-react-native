import Foundation
import FluentUI

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	override func view()->UIView! {
		let avatarView = AvatarLegacyView(avatarSize: .small)
		return avatarView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	override func constantsToExport() -> [AnyHashable : Any]! {
		return [
			"sizes" : [
				"xSmall" : AvatarLegacySize.extraSmall.size.width,
				"small" : AvatarLegacySize.small.size.width,
				"medium" : AvatarLegacySize.medium.size.width,
				"large" : AvatarLegacySize.large.size.width,
				"xLarge" : AvatarLegacySize.extraLarge.size.width,
				"xxLarge" : AvatarLegacySize.extraExtraLarge.size.width
			]
		]
	}
}
