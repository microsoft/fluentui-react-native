import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNCalloutView)
public class CalloutView: RCTView, CalloutWindowLifeCycleDelegate {

	@objc public var target: NSNumber? {
		didSet {
			let targetView = bridge?.uiManager.view(forReactTag: target)
			if (targetView == nil && target != nil) {
				preconditionFailure("Invalid target")
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

	@objc public var directionalHint: NSRectEdge = .maxY {
		didSet {
			updateCalloutFrameToAnchor()
		}
	}

	@objc public var setInitialFocus: Bool = false

	@objc public var onShow: RCTDirectEventBlock?

	@objc public var onDismiss: RCTDirectEventBlock?
	
	@objc public func focusWindow() {
		calloutWindow.makeKey()
	}
	
	@objc public func blurWindow() {
		calloutWindow.resignKey()
	}

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

	public override func viewDidMoveToWindow() {
		super.viewDidMoveToWindow()
		if (window != nil) {
			showCallout()
		} else {
			dismissCallout()
		}
	}

	public override func updateLayer() {
		if let layer = calloutWindow.contentView?.layer {
			layer.borderColor =  borderColor.cgColor
			layer.borderWidth = borderWidth
			layer.backgroundColor = backgroundColor.cgColor
			layer.cornerRadius = borderRadius
		}
	}

	// MARK: RCTComponent Overrides

	public override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
		proxyView.insertReactSubview(subview, at: atIndex)
	}

	public override func didUpdateReactSubviews() {
		proxyView.didUpdateReactSubviews()
	}

	public override func reactSetFrame(_ frame: CGRect) {
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

	/// Sets the frame of the Callout Window (in screen coordinates to be off of the Anchor on the preferred edge
	private func updateCalloutFrameToAnchor() {
		guard window != nil else {
			return
		}

		// Prefer anchorView over anchorRect if available
		let anchorScreenRect = anchorView != nil ? calculateAnchorViewScreenRect() : calculateAnchorRectScreenRect()
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
		guard let window = window  else {
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

	// The app's main menu bar is active while callout is shown, dismiss.
	@objc private func menuDidBeginTracking() {
		self.dismissCallout()
	}

	// MARK: Private variables

	/// The view the Callout is presented from.
	private var anchorView: NSView?

	/// The  view we forward Callout's Children to. It's hosted within the CalloutWindow's
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
