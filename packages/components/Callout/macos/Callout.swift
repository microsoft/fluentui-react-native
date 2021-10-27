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
	
	@objc public var directionalHint: NSRectEdge = .minY

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
//		let calloutScreenRect = bestRectRelativeToTargetFrame(targetRect: anchorScreenRect)
		let calloutScreenRect = bestCalloutRect(relativeTo: anchorScreenRect)

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
	private func bestCalloutRect(relativeTo anchorScreenRect: NSRect) -> NSRect {

		guard let screenFrame = window?.screen?.visibleFrame ?? NSScreen.main?.visibleFrame else {
			preconditionFailure("No Screen Available")
		}

		let calloutFrame = proxyView.frame
		
		let calloutOrigin: NSPoint = {
			var origin = NSPoint()

			switch(directionalHint) {
			case .minX:
				origin.x = NSMinX(anchorScreenRect) - calloutFrame.size.width
				origin.y = NSMaxY(anchorScreenRect) - calloutFrame.size.height
				break
			case .minY:
				// TODO is this right?
				origin.x = NSMinX(anchorScreenRect)
				origin.y = NSMaxY(anchorScreenRect)
			case .maxX:
				origin.x = NSMaxX(anchorScreenRect)
				origin.y = NSMaxY(anchorScreenRect) - calloutFrame.size.height
				break
			case .maxY:
				// When in RTL mode, align the right edges of the menu and flyout anchor
				if (NSApp.userInterfaceLayoutDirection == .rightToLeft) {
					origin.x = NSMaxX(anchorScreenRect) - calloutFrame.size.width
				} else {
					origin.x = NSMinX(anchorScreenRect);
				}
				origin.y = NSMinY(anchorScreenRect) - calloutFrame.size.height
				break
			@unknown default:
				preconditionFailure("Unknown directional hint")
			}
			return origin
		}()
		
		var calloutScreenRect = NSRect(origin: calloutOrigin, size: calloutFrame.size)
		
		// Reposition the menu if it doesn't fit on screen
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
				break
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
				break
			case .maxY:
				// If we go off the bottom of the screen, check if there's more room on screen above the anchorScreenRect.
				if (NSMinY(calloutScreenRect) < NSMinY(screenFrame)) {
					let maxYEdgeSpace = NSMaxY(screenFrame) - NSMaxY(anchorScreenRect)
					let minYEdgeSpace = NSMinY(anchorScreenRect) - NSMinY(screenFrame)
					
					// Flip to presenting above anchorScreenRect
					if (minYEdgeSpace > maxYEdgeSpace) {
						calloutScreenRect.origin.y = NSMaxY(anchorScreenRect)
					}
				}
				// If we go off the right edge, just slide to the left until we fit
				if (NSMaxX(calloutScreenRect) > NSMaxX(screenFrame)) {
					calloutScreenRect.origin.x = NSMaxY(screenFrame) - NSWidth(calloutScreenRect)
				}
			@unknown default:
				preconditionFailure("Unknown directional hint")
			}
		}
		return calloutScreenRect
	}

	// Positions the Callout relative to the target frame, adjusting if we are on a screen edge
	// I.E: If the Callout spills over the bottom edge of the screen, reposition it upwards so the bottom edge matches the screen bottom edge, and
	// If the Callout spills over the right (trailing) edge of the screen, flip it so it somes off the leading edge of the anchor
	private func bestRectRelativeToTargetFrame(targetRect:CGRect) -> CGRect {
		let calloutFrame = proxyView.frame

		guard let screenFrame = window?.screen?.visibleFrame ?? NSScreen.main?.visibleFrame else {
			preconditionFailure("No Screen Available")
		}

		// Assume we are showing the callout below the target rect
		var rect = NSMakeRect(
			targetRect.origin.x,
			targetRect.origin.y,
			calloutFrame.size.width,
			calloutFrame.size.height
		)

		// 1. If space below, callout is below
		if (rect.origin.y + calloutFrame.size.height + targetRect.size.height < screenFrame.size.height) {
			rect.origin.y -= calloutFrame.size.height
			// TODO RCTAssert not available for some reason
			precondition(rect.origin.y >= 0, "Callout currently extends off the lower end of the screen.")
		}
		// 2. Else if space above, callout is above
		else if (rect.origin.y > calloutFrame.size.height) {
			rect.origin.y -= calloutFrame.size.height;
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
		window.isReleasedWhenClosed = true
		window.styleMask = [.fullSizeContentView]
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
