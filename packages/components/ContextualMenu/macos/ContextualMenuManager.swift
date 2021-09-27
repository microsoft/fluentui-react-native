import Foundation

@objc(FRNContextualMenuManager)
class ContextualMenuManager: RCTViewManager {

	override class func requiresMainQueueSetup() -> Bool {
		return true
	}

	override func view()->NSView! {
		return ContextualMenu(bridge: bridge)
	}

//	override func shadowView()->RCTShadowView {
//		return ContextualMenuShadowView()
//	}
}

//class ContextualMenuShadowView: RCTShadowView {
//
//	override func setLocalData(_ localData: NSObject!) {
//		let yogaFrame: CGRect = .zero
//		let node = yogaNode
//		YGNodeStyleSetPositionType(node, YGPositionType.absolute)
//		YGNodeStyleSetWidth(node, 0)
//		YGNodeStyleSetHeight(node, 0)
//		YGNodeStyleSetPosition(node, YGEdge.left, 0)
//		YGNodeStyleSetPosition(node, YGEdge.top, 0)
//		YGNodeStyleSetDisplay(node, YGDisplay.flex)
//	}
	
//	override func isYogaLeafNode() -> Bool {
//		return true
//	}
//
//	override func canHaveSubviews() -> Bool {
//		return false
//	}
//}
