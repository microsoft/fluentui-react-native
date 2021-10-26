import Foundation
import AppKit

@objc(RCTCalloutView)
class CalloutView: RCTView, CalloutWindowLifeCycleDelegate {

	@objc public var target: NSNumber? {
		didSet {
			guard let targetView = bridge?.uiManager.view(forReactTag: target) else {
				preconditionFailure("Invalid target react tag")
			}
			anchorView = targetView
			updateCalloutFrameToAnchor()
		}
	}

	@objc public var anchorRect: NSRect = .null {
		didSet {
			updateCalloutFrameToAnchor()
		}
	}

	@objc public var onShow: RCTBubblingEventBlock?

	@objc public var onDismiss: RCTBubblingEventBlock?

	public weak var bridge: RCTBridge?

	// MARK: Initialization

	private init() {
		super.init(frame: .zero)
	}

	required init?(coder: NSCoder) {
		preconditionFailure()
	}

	convenience init(bridge: RCTBridge) {
		self.init()
		self.bridge = bridge
	}

	override func viewDidMoveToWindow() {
		guard window != nil else {
			return
		}
		showCallout()
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

	func didDetectHitOutsideCallout(calloutWindow: CalloutWindow) {
		 dismissCallout()
	}

	func applicationDidResignActiveForCalloutWindow(calloutWindow: CalloutWindow) {
		 dismissCallout()
	}

	// MARK: Private methods

	private func showCallout() {
		// Create Window and put proxy view inside it
		// Convert Anchor view frame to screen rect
		// Reposition the rect as needed to accomodate for edges
		// show window
		// call onShow()

		updateCalloutFrameToAnchor()
		calloutWindow.display()
		didShowCallout()

	}

	private func dismissCallout() {
		calloutWindow.close()
		didDismissCallout()
	}

	/// Sets the frame of the Callout Window (in screen coordinates to be off of the Anchor on the preferred edge
	private func updateCalloutFrameToAnchor() {
		guard window != nil else {
			return
		}

		// Prefer anchorRect over anchorView if available
		let anchorScreenRect = anchorRect.equalTo(.null) ? calculateAnchorViewScreenRect() : calculateAnchorRectScreenRect()
		let calloutScreenRect = bestRectRelativeToTargetFrame(targetRect: anchorScreenRect)
//		let calloutScreenRect = adjustCalloutRectToScreen(anchorScreenRect: anchorScreenRect)

		calloutWindow.setFrame(calloutScreenRect, display: false)
	}

	/// Calculates the NSRect of the Anchor Rect in screen coordinates
	private func calculateAnchorRectScreenRect() -> NSRect {
		guard let window = window  else {
			preconditionFailure("No window found")
		}

		var rootView: NSView = self
		while (!rootView.isReactRootView()) {
			rootView = rootView.reactSuperview()
		}
		let rootViewBoundsInWindow = rootView.convert(rootView.bounds, to: nil)
		let rootViewRectInScreenCoordinates = window.convertToScreen(rootViewBoundsInWindow)
		let anchorRectInScreenCoordinates = NSMakeRect(
			rootViewRectInScreenCoordinates.origin.x + self.anchorRect.origin.x,
			rootViewRectInScreenCoordinates.origin.y + self.anchorRect.origin.y,
			self.anchorRect.size.width,
			self.anchorRect.size.height
		)
		return anchorRectInScreenCoordinates
	}

	/// Calculates the NSRect of the anchorView in the coordinate space of the current screen
	private func calculateAnchorViewScreenRect() -> NSRect {
		guard let anchorView = anchorView else {
			preconditionFailure("No anchor view provided to position the Callout")
		}

		guard let window = window  else {
			preconditionFailure("No window found")
		}

		let anchorBoundsInWindow = anchorView.convert(anchorView.bounds, to: nil)
		let anchorFrameInScreenCoordinates = window.convertToScreen(anchorBoundsInWindow)

		return anchorFrameInScreenCoordinates
	}

// TODO: replace bestRectRelativeToTargetFrame with this method.
//	private func adjustCalloutRectToScreen(anchorScreenRect: NSRect) -> NSRect {
//
//		// Reposition the menu if it doesn't fit on screen (we don't resize yet)
//		guard let screenFrame = window?.screen?.visibleFrame ?? NSScreen.main?.visibleFrame else {
//			preconditionFailure("No Screen Available")
//		}
//
//		var calloutFrame = proxyView.convert(proxyView.frame, to: nil)
//
//		if (!NSContainsRect(screenFrame, calloutFrame)) {
//			// If we go off the right edge, we may need to flip to presenting leftward from the leftEdge of presentationRect
//			if (NSMaxX(calloutFrame) > NSMaxX(screenFrame)) {
//				let maxXEdgeSpace = NSMaxX(screenFrame) - NSMaxX(anchorScreenRect);
//				let minXEdgeSpace = NSMinX(anchorScreenRect) - NSMinX(screenFrame);
//				if (minXEdgeSpace > maxXEdgeSpace) {
//					calloutFrame.origin.x = NSMinX(anchorScreenRect) - NSWidth(calloutFrame);
//				}
//			}
//
//			// If we go off the bottom of the screen, just slide up until we fit
//			if (NSMinY(calloutFrame) < NSMinY(screenFrame)) {
//				calloutFrame.origin.y = NSMinY(screenFrame);
//			}
//		}
//
//		return calloutFrame
//	}

	// Positions the Callout relative to the target frame, adjusting if we are on a screen edge
	// I.E: If the Callout spills over the bottom edge of the screen, reposition it upwards so the bottom edge matches the screen bottom edge, and
	// If the Callout spills over the right (trailing) edge of the screen, flip it so it somes off the leading edge of the anchor
	private func bestRectRelativeToTargetFrame(targetRect:CGRect) -> CGRect {
		var maxCalloutHeight = 0
		var maxCalloutWidth = 0

		let calloutFrame = proxyView.frame
		maxCalloutHeight = max(maxCalloutHeight, NSInteger(calloutFrame.size.height))
		maxCalloutWidth = max(maxCalloutWidth, NSInteger(calloutFrame.size.width))
		let maxHeight = CGFloat(maxCalloutHeight)
		let maxWidth = CGFloat(maxCalloutWidth)

		guard let screenFrame = window?.screen?.visibleFrame ?? NSScreen.main?.visibleFrame else {
			preconditionFailure("No Screen Available")
		}

		var rect = CGRect(origin: CGPoint(x: targetRect.origin.x, y: targetRect.origin.y), size: CGSize(width: maxWidth, height: maxHeight))

		// 1. If space below, callout is below
		if (rect.origin.y + maxHeight + targetRect.size.height < screenFrame.size.height) {
			rect.origin.y -= maxHeight
			// TODO RCTAssert not available for some reason
			precondition(rect.origin.y >= 0, "Callout currently extends off the lower end of the screen.")
		}
		// 2. Else if space above, callout is above
		else if (rect.origin.y > maxHeight) {
			rect.origin.y -= maxHeight;
		}
		// 3. Else callout is resized to fit wherever there is more space
		else {
			let menuBarHeight = NSApplication.shared.mainMenu?.menuBarHeight ?? 0
			let heightAboveTarget = screenFrame.size.height - targetRect.origin.y - targetRect.size.height - menuBarHeight
			let heightBelowTarget = targetRect.origin.y
			if (heightAboveTarget > heightBelowTarget) {
				// Take up as much space as available above
				rect.origin.y += targetRect.size.height;
				rect.size.height = rect.origin.y - menuBarHeight;
			} else {
				// Take up as much space as available below
				rect.size.height = rect.origin.y;
				rect.origin.y = NSStatusBar.system.thickness
			}
		}

		// HORIZONTAL ALIGNMENT
		if (rect.origin.x < 0) {
			rect.origin.x = 0;
		}
		if (rect.origin.x + rect.size.width >= screenFrame.size.width) {
			rect.origin.x -= (rect.origin.x + rect.size.width - screenFrame.size.width);
		}

		return rect
	}

	private func didShowCallout() {
		onShow?([:])
	}

	private func didDismissCallout() {
		if let onDismiss = onDismiss {
			guard let reactTag = reactTag else {
				preconditionFailure("React Tag missing")
			}
			let event: [AnyHashable: Any] = ["target": reactTag]
			onDismiss(event)
		}
	}

	// MARK: Private variables

	private var anchorView: NSView?

	private var proxyView: RCTView = RCTView()

	private lazy var calloutWindow: CalloutWindow = {
		let calloutWindowController = CalloutWindowRootViewController()
		let window = CalloutWindow(contentViewController: calloutWindowController)
		window.windowLifeCycleDelegate = self
		window.styleMask = .borderless
		window.level = .popUpMenu
		window.setIsVisible(true)
		window.backgroundColor = .windowBackgroundColor

		guard let touchHandler = RCTTouchHandler(bridge: bridge) else {
			preconditionFailure("Callout could not create RCTTouchHandler")
		}
		touchHandler.attach(to: proxyView)
		window.contentView = proxyView

		return window
	}()
}
