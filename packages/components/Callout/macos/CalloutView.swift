import AppKit
import Foundation
import React

/// Return the text length of a provided RCTShadowView
func getLengthOfTextShadowNode(shadowView: RCTShadowView) -> Int {
	// If it's a RawTextShadowView, the length is simply its text length
	if let rawTextView = shadowView as? RCTRawTextShadowView {
		if let rawTextLength = rawTextView.text?.count {
			return rawTextLength
		}

		return 0
	}

	// If it's a BaseTextShadowView, it may have multiple nested texts that
	// should be summed together
	var sumTextLength = 0
	if let baseTextView = shadowView as? RCTBaseTextShadowView {
			baseTextView.reactSubviews().forEach { subview in
					sumTextLength += getLengthOfTextShadowNode(shadowView: subview)
			}
	}

	return sumTextLength
}

/// Search for the provided reactTag in the provided ShadowView's subtree
/// When successfully found, returns:
///   found: true
///   startCharRange: number of characters in the text string before the reactTag subrange
///
/// When not found, returns:
///   found: false
///   startCharRange: 0
func getStartCharRangeForTag(reactTag: NSNumber, shadowView: RCTShadowView) -> (found: Bool, startCharRange: Int) {
	if shadowView.reactTag == reactTag {
		// If this shadowView is our target, we're done; return that we found it
		return (found: true, startCharRange: 0)
	} else if let rawTextShadowView = shadowView as? RCTRawTextShadowView {
		// If this shadowView is a rawText view, it has no subviews; return the length of the text to be added
		// to the startCharRange index
		if let rawTextLength = rawTextShadowView.text?.count {
			return (found: false, startCharRange: rawTextLength)
		}
	} else {
		// Otherwise our target view may be a subview; sum the character range for each subview subtree
		// before and including the subview that contains our target view
		var startCharRange = 0
		for subview in shadowView.reactSubviews() {
			let subviewSearch = getStartCharRangeForTag(reactTag:reactTag, shadowView: subview)
			startCharRange += subviewSearch.startCharRange
			if (subviewSearch.found) {
				return (found: subviewSearch.found, startCharRange: startCharRange)
			}
		}

		return (found: false, startCharRange: startCharRange)
	}

	return (found: false, startCharRange: 0)
}

@objc(FRNCalloutView)
class CalloutView: RCTView, CalloutWindowLifeCycleDelegate {

	@objc public var target: NSNumber? {
		didSet {
			updateCalloutFrameToAnchor()
		}
	}

	@objc public var anchorRect: NSRect = .null {
		didSet {
			updateCalloutFrameToAnchor()
		}
	}

	@objc public var directionalHint: NSRectEdge = .maxY {
		didSet {
			updateCalloutFrameToAnchor()
		}
	}

	@objc public var setInitialFocus: Bool = false

	@objc public var onShow: RCTDirectEventBlock?

	@objc public var onDismiss: RCTDirectEventBlock?

	public weak var bridge: RCTBridge?

	private init() {
		super.init(frame: .zero)
	}

	required init?(coder: NSCoder) {
		preconditionFailure()
	}

	convenience init(bridge: RCTBridge) {
		self.init()
		self.bridge = bridge

		// Listens for mouse clicks in the main menu bar while callout is shown
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(menuDidBeginTracking),
			name: NSMenu.didBeginTrackingNotification,
			object: nil)
	}

	override func viewDidMoveToWindow() {
		super.viewDidMoveToWindow()
		if (window != nil) {
			showCallout()
		} else {
			dismissCallout()
		}
	}

	override func updateLayer() {
		if let layer = calloutWindow.contentView?.layer {
			layer.borderColor = borderColor.cgColor
			layer.borderWidth = borderWidth
			layer.backgroundColor = backgroundColor.cgColor
			layer.cornerRadius = borderRadius
		}
	}

	// MARK: RCTComponent Overrides

	override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
		proxyView.insertReactSubview(subview, at: atIndex)
	}

	override func didUpdateReactSubviews() {
		proxyView.didUpdateReactSubviews()
	}

	override func reactSetFrame(_ frame: CGRect) {
		proxyView.reactSetFrame(frame)
		updateCalloutFrameToAnchor()
	}

	// MARK: WindowLifeCycleDelegate

	func calloutWillDismiss(window: CalloutWindow) {
		onDismissCallout()
	}

	// MARK: Private methods

	private func showCallout() {
		guard !isCalloutWindowShown else {
			return
		}

		updateCalloutFrameToAnchor()
		calloutWindow.orderFront(self)
		if (setInitialFocus) {
			calloutWindow.makeKey()
		}

		// Dismiss the Callout if the window is no longer active.
		NotificationCenter.default.addObserver(self, selector: #selector(dismissCallout), name: NSApplication.didResignActiveNotification, object: nil)

		mouseEventMonitor.addLocalMonitorForEvents(matching: .leftMouseDown, handler: { [weak self] (event) -> NSEvent? in
			func isClickInsideWindowHierarchy(window: NSWindow?, event: NSEvent) -> Bool {
				guard let window = window else {
					return false
				}
				guard let clickedWindow = event.window else {
					return false
				}

				var isClickInHierarchy = false

				if (window.isEqual(to: clickedWindow)) {
					isClickInHierarchy = true
				} else {
					if let childWindows = window.childWindows {
						for childWindow in childWindows {
							isClickInHierarchy = isClickInsideWindowHierarchy(window: childWindow, event: event)
						}
					}
				}

				return isClickInHierarchy
			}

			var window: NSWindow? = self?.calloutWindow
			while (window?.parent as? CalloutWindow != nil) {
				window = window?.parent
			}

			if (!isClickInsideWindowHierarchy(window: window, event: event)) {
				self?.dismissCallout()
			}

			return event
		})

		isCalloutWindowShown = true
		onShowCallout()
	}

	@objc private func dismissCallout() {
		guard isCalloutWindowShown else {
			return
		}

		// Dismiss any children Callouts (I.E: Submenus) first
		if let childWindows = calloutWindow.childWindows {
			for childWindow in childWindows {
				if let childCallout = childWindow as? CalloutWindow {
					childCallout.dismissCallout()
				}
			}
		}

		calloutWindow.dismissCallout()

		NotificationCenter.default.removeObserver(self)
		mouseEventMonitor.removeMonitor()

		isCalloutWindowShown = false
	}

	/// Return the TextView and TextShadowView of a Leaf node ShadowView for specialized nested TextView anchoring
	private func getTextViews(leafShadowView: RCTShadowView) -> (textView: RCTTextView, textShadowView: RCTTextShadowView)? {
		// Do not proceed if the preconditions of this function are not met
		guard leafShadowView.isYogaLeafNode() else {
				preconditionFailure("leafshadow is not a leaf node")
		}

		// Do not proceed if the leaf shadow is not a root text shadow view, which we're specializing for right now
		// In the future this could be generalized for other complex yoga leaf nodes with subviews, such as react-native-svg
		guard let textShadowView = leafShadowView as? RCTTextShadowView else {
				return nil
		}
		
		// Do not proceed if we:
		//   - don't have a UI Manager
		//   - don't have the NSView corresponding to the yoga leaf view
		//   - the leafView is somehow not an RCTTextView (should not be possible for an RCTTextShadowView)
		guard let leafTextView = bridge?.uiManager?.view(forReactTag: leafShadowView.reactTag) as? RCTTextView else {
				return nil
		}

		return (leafTextView, textShadowView)
	}

	/// Return the boundingRect for a shadowView that is a subview of a Yoga leaf node
	/// The boundingRect is returned relative to the Yoga leaf node
	private func getBoundsForSubShadowOfLeafShadow(subShadowView: RCTShadowView, leafShadowView: RCTShadowView) -> NSRect? {
		// Do not proceed if the preconditions of this function are not met
		guard subShadowView.viewIsDescendant(of: leafShadowView) else {
				preconditionFailure("subShadowView is not a descendant of the leaf node ShadowView")
		}

		// Get the TextView and TextShadowView we need to calculate the bounds of the subview
		guard let (textView, textShadowView) = getTextViews(leafShadowView: leafShadowView) else {
			return nil
		}

		// Search for our target tag and get its startCharRange index in the overall Text view
		let startCharRangeSearch = getStartCharRangeForTag(reactTag: subShadowView.reactTag, shadowView: textShadowView)
		if (!startCharRangeSearch.found) {
				// Did not find our reactTag
				return nil
		}

		// Having found our target, return the bounding rect for its corresponding character range
		return textView.getRectForCharRange(NSRange(location: startCharRangeSearch.startCharRange, length: getLengthOfTextShadowNode(shadowView: subShadowView)))
	}

	/// Get the leaf shadow view corresponding to a leaf Yoga node for the provided ShadowView
	private func getLeafShadowViewForShadowView(shadowView: RCTShadowView?) -> RCTShadowView? {
			var shadowParentIter = shadowView
			while let shadowViewIter = shadowParentIter {
					if (shadowViewIter.isYogaLeafNode()) {
							return shadowViewIter
					}
					shadowParentIter = shadowViewIter.superview
			}

			return nil
	}

	/// Return the anchor rect for the target prop if available
	private func getAnchorRectForTarget() -> NSRect? {
		guard let reactTag = target, let reactBridge = bridge else {
				return nil
		}

		// If the targetView is backed by an NSView and has a representative rect, return it as the anchor rect for the target
		if let targetView = reactBridge.uiManager.view(forReactTag: reactTag) {
			if !targetView.bounds.equalTo(CGRect.zero) {
					return calculateAnchorViewScreenRect(anchorView: targetView)
			}
		}

		// If the targetView could not be found or was not a representative rect, it may be a child of a yoga leaf node e.g. virtualized text
		guard let targetShadowView = reactBridge.uiManager.shadowView(forReactTag: target) else {
				return nil
		}

		// Find the leaf ShadowView of our targetView
		guard let leafShadowView = getLeafShadowViewForShadowView(shadowView: targetShadowView) else {
			return nil
		}

		// Ensure we have a real NSView for our leaf ShadowView
		guard let leafNSView = reactBridge.uiManager.view(forReactTag: leafShadowView.reactTag) else {
			return nil
		}

		// Find the bounding rect of our targetView relative to the leafShadowView
		guard let targetViewBounds = getBoundsForSubShadowOfLeafShadow(subShadowView: targetShadowView, leafShadowView: leafShadowView) else {
			return nil
		}

		// If we could find the bounding rect of our target view and it's a representative rect, return it as the anchor rect for the target
		if !targetViewBounds.equalTo(CGRect.zero) {
				return calculateAnchorViewScreenRect(anchorView: leafNSView, subviewAnchorBounds: targetViewBounds)
		}

		// Unfortunately our efforts could not determine a valid anchor rect for our target prop
		return nil
	}

	/// Get the AnchorScreenRect to use for Callout anchoring, prioritizing the target prop over the anchorRect prop
	private func getAnchorScreenRect() -> NSRect? {
		if target != nil {
				return getAnchorRectForTarget();
		} else {
				return calculateAnchorRectScreenRect();
		}
	}

	/// Sets the frame of the Callout Window (in screen coordinates to be off of the Anchor on the preferred edge
	private func updateCalloutFrameToAnchor() {
		guard window != nil else {
			return
		}

		guard let anchorScreenRect = getAnchorScreenRect() else {
			return
		}

		let calloutScreenRect = bestCalloutRect(relativeTo: anchorScreenRect)

		// Because we immediately update the rect as props come in, there's a possibility that we have neither
		// of anchorRect and target. Don't update until we have at least one.
		guard !calloutScreenRect.isEmpty else {
			return
		}

		proxyView.frame.origin = .zero
		calloutWindow.setFrame(calloutScreenRect, display: false)
	}

	/// Calculates the NSRect of the Anchor Rect in screen coordinates
	private func calculateAnchorRectScreenRect() -> NSRect {
		guard let window = window else {
			preconditionFailure("No window found")
		}

		if (window.screen == nil) {
			preconditionFailure("No screen Available")
		}

		// The anchor Rect is given in the coordinate space of the root view.
		// Find the root view to convert to screen coordinates
		var rootView: NSView = self
		while (!rootView.isReactRootView()) {
			rootView = rootView.reactSuperview()
		}

		let anchorRect = self.anchorRect

		// Since the root view is flipped, we already have anchorRect in the "correct"
		// (i.e. flipped) coordinate space. Since we need to provide screen rects to Apple,
		// we will once again arrive at the "correct" (not flipped) coordinate space.
		let anchorRectInWindow = rootView.convert(anchorRect, to: nil)
		let anchorRectInScreenCoordinates = window.convertToScreen(anchorRectInWindow)

		return anchorRectInScreenCoordinates
	}

	/// Calculates the NSRect of the anchorView in the coordinate space of the current screen
	private func calculateAnchorViewScreenRect(anchorView: NSView, subviewAnchorBounds: NSRect? = nil) -> NSRect {
		guard let window = window else {
			preconditionFailure("No window found")
		}

		let anchorBoundsInWindow = anchorView.convert(subviewAnchorBounds ?? anchorView.bounds, to: nil)
		let anchorFrameInScreenCoordinates = window.convertToScreen(anchorBoundsInWindow)

		return anchorFrameInScreenCoordinates
	}

	/// Calculates the rect in screen coordinates the callout should be positioned in relative to the anchor rect, adjusting if we are close to a screen edge
	private func bestCalloutRect(relativeTo anchorScreenRect: NSRect) -> NSRect {

		guard let screenFrame = window?.screen?.visibleFrame ?? NSScreen.main?.visibleFrame else {
			preconditionFailure("No Screen Available")
		}

		let calloutFrame = proxyView.frame

		// Find our preferred origin based on the directional hint
		let calloutOrigin: NSPoint = {
			var origin = NSPoint()

			switch(directionalHint) {
			case .minX:
				origin.x = NSMinX(anchorScreenRect) - calloutFrame.size.width
				origin.y = NSMaxY(anchorScreenRect) - calloutFrame.size.height
			case .minY:
				origin.x = NSMinX(anchorScreenRect)
				origin.y = NSMaxY(anchorScreenRect)
			case .maxX:
				origin.x = NSMaxX(anchorScreenRect)
				origin.y = NSMaxY(anchorScreenRect) - calloutFrame.size.height
			case .maxY:
				// When in RTL mode, align the right edges of the menu and flyout anchor
				if (NSApp.userInterfaceLayoutDirection == .rightToLeft || RCTI18nUtil.sharedInstance().isRTL()) {
					origin.x = NSMaxX(anchorScreenRect) - calloutFrame.size.width
				} else {
					origin.x = NSMinX(anchorScreenRect);
				}
				origin.y = NSMinY(anchorScreenRect) - calloutFrame.size.height
			@unknown default:
				preconditionFailure("Unknown directional hint")
			}
			return origin
		}()

		var calloutScreenRect = NSRect(origin: calloutOrigin, size: calloutFrame.size)

		// Reposition the callout if it doesn't fit on screen
		if (!NSContainsRect(screenFrame, calloutScreenRect)) {
			switch(directionalHint) {
			case .minX:
				// If we go off the left edge, we may need to flip to presenting rightward from the rightEdge of anchorScreenRect
				if (NSMinX(calloutScreenRect) < NSMinX(screenFrame)) {
					let maxXEdgeSpace = NSMaxX(screenFrame) - NSMaxX(anchorScreenRect)
					let minXEdgeSpace = NSMinX(anchorScreenRect) - NSMinX(screenFrame)
					if (maxXEdgeSpace > minXEdgeSpace) {
						calloutScreenRect.origin.x = NSMaxX(anchorScreenRect);
					}
				}
				// If we go off the bottom of the screen, just slide up until we fit
				if (NSMinY(calloutScreenRect) < NSMinY(screenFrame)) {
					calloutScreenRect.origin.y = NSMinY(screenFrame)
				}
			case .minY:
				// If we go off the top of the screen, check if there's more room on screen below the anchorScreenRect.
				if (NSMaxY(calloutScreenRect) > NSMaxY(screenFrame)) {
					let maxYEdgeSpace = NSMaxY(screenFrame) - NSMaxY(anchorScreenRect)
					let minYEdgeSpace = NSMinY(anchorScreenRect) - NSMinY(screenFrame)

					// Flip to presenting below anchorScreenRect
					if (minYEdgeSpace > maxYEdgeSpace) {
						calloutScreenRect.origin.y = NSMinY(anchorScreenRect) - NSHeight(calloutScreenRect)
					}
				}
				// If we go off the right edge, just slide to the left until we fit
				if (NSMaxX(calloutScreenRect) > NSMaxX(screenFrame)) {
					calloutScreenRect.origin.x = NSMaxY(screenFrame) - NSWidth(calloutScreenRect)
				}
			case .maxX:
				// If we go off the right edge, we may need to flip to presenting leftward from the leftEdge of anchorScreenRect
				if (NSMaxX(calloutScreenRect) > NSMaxX(screenFrame)) {
					let maxXEdgeSpace = NSMaxX(screenFrame) - NSMaxX(anchorScreenRect)
					let minXEdgeSpace = NSMinX(anchorScreenRect) - NSMinX(screenFrame)
					if (minXEdgeSpace > maxXEdgeSpace) {
						calloutScreenRect.origin.x = NSMinX(anchorScreenRect) - NSWidth(calloutScreenRect)
					}
				}
				// If we go off the bottom of the screen, just slide up until we fit
				if (NSMinY(calloutScreenRect) < NSMinY(screenFrame)) {
					calloutScreenRect.origin.y = NSMinY(screenFrame);
				}
			case .maxY:
				// If we go off the bottom of the screen, check if there's more room on screen above the anchorScreenRect.
				if (NSMinY(calloutScreenRect) < NSMinY(screenFrame)) {
					let maxYEdgeSpace = NSMaxY(screenFrame) - NSMaxY(anchorScreenRect)
					let minYEdgeSpace = NSMinY(anchorScreenRect) - NSMinY(screenFrame)

					// Flip to presenting above anchorScreenRect
					if (maxYEdgeSpace > minYEdgeSpace) {
						calloutScreenRect.origin.y = NSMaxY(anchorScreenRect)
					}
				}
				// If we go off the right edge, just slide to the left until we fit
				if (NSMaxX(calloutScreenRect) > NSMaxX(screenFrame)) {
					calloutScreenRect.origin.x = NSMaxX(screenFrame) - NSWidth(calloutScreenRect)
				}
				// If we go off the left edge in RTL, just slide to the right so we're fully onscreen
				if (NSMinX(calloutScreenRect) < NSMinX(screenFrame)) {
					calloutScreenRect.origin.x = 0;
				}
			@unknown default:
				preconditionFailure("Unknown directional hint")
			}
		}
		return calloutScreenRect
	}

	private func onShowCallout() {
		onShow?([:])
	}

	private func onDismissCallout() {
		if let onDismiss = onDismiss {
			guard let reactTag = reactTag else {
				preconditionFailure("React Tag missing")
			}
			let event: [AnyHashable: Any] = ["target": reactTag]
			onDismiss(event)
		}
	}

	/// The app's main menu bar is active while callout is shown, dismiss.
	@objc private func menuDidBeginTracking() {
		self.dismissCallout()
	}

	// MARK: Private variables

	/// The view we forward Callout's Children to. It's hosted within the CalloutWindow's
	/// view hierarchy, ensuring our React Views are not placed in the main window.
	private lazy var proxyView: NSView = {
		let visualEffectView = FlippedVisualEffectView()
		visualEffectView.translatesAutoresizingMaskIntoConstraints = false
		visualEffectView.material = .menu
		visualEffectView.state = .active
		visualEffectView.wantsLayer = true

		/**
		 * We can't directly call touchHandler.attach(to:) because `visualEffectView` is not an RCTUIView.
		 * We get around this limitation by just replicating what `attach` did internally: add a gestureRecognizer.
		 */
		guard let touchHandler = RCTTouchHandler(bridge: bridge) else {
			preconditionFailure("Callout could not create RCTTouchHandler")
		}
		visualEffectView.addGestureRecognizer(touchHandler)

		return visualEffectView
	}()

	private lazy var calloutWindow: CalloutWindow = {
		let window = CalloutWindow()
		window.lifeCycleDelegate = self

		guard let contentView = window.contentView else {
			preconditionFailure("Callout window has no content view")
		}

		contentView.addSubview(proxyView)
		if let parentWindow = self.window {
			parentWindow.addChildWindow(window, ordered: .above)
		}
		return window
	}()

	private var mouseEventMonitor = GuardedEventMonitor()

	private var isCalloutWindowShown = false
}
