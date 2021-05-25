import Foundation

@objc(RCTCalloutManager)
class CalloutManager: RCTViewManager {
    override func view()->NSView! {
        return RCTCalloutView(bridge: bridge)
    }

    override class func requiresMainQueueSetup() -> Bool {
        return true
    }
}
