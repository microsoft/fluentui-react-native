import Foundation
import FluentUI

@objc(MSFAvatarViewManager)
class AvatarViewManager: RCTViewManager {
	
	override func view()->UIView! {
		let viewWrapper = MSFAvatar()
        let view = viewWrapper.view
        
        // Store the key value pair for lookup when we set props
        let storage = MSFAvatar.storage()
        let key = NSValue(nonretainedObject: view)
        storage[key] = viewWrapper
        
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
