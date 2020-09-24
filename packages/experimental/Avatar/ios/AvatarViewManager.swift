import Foundation
import FluentUI

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	override func view()->UIView! {
		let avatarView = AvatarView(avatarSize: .large)
		avatarView.setup(primaryText: "Saad Najmi", secondaryText: "Software Engineer", image: nil, presence: .none, convertTextToInitials: true)
		return avatarView
	}

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}
	
	override func constantsToExport() -> [AnyHashable : Any]! {
			return [
				"sizes" : [
					"xSmall" :	AvatarSize.extraSmall.size,
					"small" : AvatarSize.small.size,
					"medium" : AvatarSize.medium.size,
					"large" : AvatarSize.large.size,
					"xLarge" : AvatarSize.extraLarge.size,
					"xxLarge" : AvatarSize.extraExtraLarge.size
				]
			]
		}
}
