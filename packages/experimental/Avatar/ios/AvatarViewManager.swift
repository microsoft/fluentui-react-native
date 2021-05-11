import Foundation
import FluentUI

@objc(MSFAvatarStorage)
class AvatarStorage: NSObject {
	
	static let SharedInstance = AvatarStorage()
	
	private init() {
		super.init()
	}
	
	@objc static var viewToControllerMap: [UIView:MSFAvatar] = [:]

	
	func addControllerViewMapping(controller: MSFAvatar) {
		let view = controller.view
		AvatarStorage.viewToControllerMap[view] = controller
	}
	
	func controllerForView(view: UIView) -> MSFAvatar {
		return AvatarStorage.viewToControllerMap[view] ?? nil
	}
}

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	
	override func view()->UIView! {
		let avatarHostingController = MSFAvatar()
		AvatarStorage.SharedInstance.addControllerViewMapping(controller: avatarHostingController)
		return avatarHostingController.view
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
				"large" : 42,
				"xLarge" : 52,
				"xxLarge" : 72,
			]
		]
	}
}
