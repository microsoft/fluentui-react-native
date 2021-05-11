import Foundation
import FluentUI

// TODO Add Macro
extension MSFAvatar {
    var storage: NSMutableDictionary {
        return MSFAvatarStorage.sharedInstance().viewToControllerMapping
    }
}

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	
	override func view()->UIView! {
		let controller = MSFAvatar()
        let view = controller.view
        
        let avatarStorage = MSFAvatarStorage.sharedInstance()
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
