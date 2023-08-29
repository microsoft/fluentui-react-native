/// React Native macOS inherits some assumptions from React Native on iOS / UIKit.
/// This serves as an issue when we want to write our own native components derived from NSView, as we don't
/// inherit the "fixes" we need from RCTView to get views working properly.. This subclass "fixes" the minimal amount
/// so that our native component works as expected.
internal class FixedVisualEffectView: NSVisualEffectView {

	/// React Native macOS uses a flipped coordinate space by default. to match the other platforms.
	/// Let's stay consistent and ensure any views hosting React Native views are also flipped.
	/// This helps RCTTouchHandler register clicks in the right location, and ensures `layer.geometryFlipped` is true.
	override var isFlipped: Bool {
		return true
	}

	/// This subclass is necessary due to differences' in hitTest()'s implementation between iOS and macOS
	///	On iOS / UIKit, hitTest(_ point:, with event:) takes a point in the receiver's local coordinate system.
	///	On macOS / AppKit, hitTest(_ point) takes a point in the reciever's superviews' coordinate system.
	/// RCTView assumes the iOS implementation, so it has  an override of hitTest(_ point). Let's copy the
	/// implementatation to our  native component, so that clicks for subviews of type RCTView are handled properly.
	/// Another solution would be to add an RCTView subview that covers the full bounds of our native view
	open override func hitTest(_ point: NSPoint) -> NSView? {
		var pointForHitTest = point
		for subview in subviews {
			if let subview = subview as? RCTView {
				pointForHitTest = subview.convert(point, from: superview)
			}
			let result = subview.hitTest(pointForHitTest)
			if (result != nil) {
				return result
			}
		}
		return nil
	}
}
