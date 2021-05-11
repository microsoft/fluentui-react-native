import Foundation
import FluentUI

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	
	override func view()->UIView! {
		let controller = MSFAvatar()
        let view = controller.view
        
        let avatarStorage = MSFAvatarStorage.sharedInstance()
//        avatarStorage.viewToControllerMapping.setObject(controller, forKey: NSValue(nonretainedObject: view))
//        avatarStorage.viewToControllerMapping[NSValue(nonretainedObject: view)] = controller
        avatarStorage.addNewHostingController(controller)
        
		return view
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
