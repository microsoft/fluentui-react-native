import Foundation
import FluentUI

@objc(FRNAvatarViewManager)
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

	// We export the sizes to pass to React Native as a hardcoded height/width for the component.
	// In the future, these sizes should come from the token pipeline.
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
