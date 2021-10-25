import Foundation
import AppKit

@objc(RCTCalloutView)
class CalloutView: RCTView, CalloutWindowLifeCycleDelegate {

	@objc public var target: NSNumber? {
		didSet {
			updateCalloutFrameToTargetFrame() // SAAD Addition
		}
	}

	@objc public var anchorRect: CGRect {
		didSet {
			updateCalloutFrameToTargetFrame() // SAAD Addition
		}
	}

	@objc public var onDismiss: RCTBubblingEventBlock?

	public weak var bridge: RCTBridge?

	// MARK: Initialization

	private init() {
		// The proxy view is a React view that will be hosted in a seperate window.
		// The child react views added to this view will actually be added to the proxy view.
		calloutProxyView = RCTView()
		anchorRect = .zero
		super.init(frame: .zero)
	}

	required init?(coder: NSCoder) {
		preconditionFailure()
	}

	convenience init(bridge: RCTBridge) {
		self.init()
		self.bridge = bridge


		calloutProxyTouchHandler = RCTTouchHandler(bridge: bridge)

		// The callout window root view will contain the proxy react view.
		// It will be offset within the window to align with the callout target rect
		// The callout window root view controller manages device rotation callbacks.
		calloutWindowRootViewController = CalloutWindowRootViewController()

		if let windowRootViewController = calloutWindowRootViewController {
			// The callout window hosts the callout root view which hosts the proxy view.
			// The window is responsible for hit testing and dismissing the callout if taps happen outside of the callout root view.
			calloutWindow = CalloutWindow(contentViewController: windowRootViewController)
			if let window = calloutWindow {
				window.windowLifeCycleDelegate = self
				window.styleMask = .borderless
				window.level = .statusBar //.floating?? TODO
				window.setIsVisible(true)
				window.backgroundColor = .windowBackgroundColor
			}
			if let touchHandler = calloutProxyTouchHandler {
				calloutProxyView.addGestureRecognizer(touchHandler)
				windowRootViewController.view = calloutProxyView
			}
		}
	}

	// MARK: RCTComponent Overrides

	override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
		// Do not want to call super (despite NS_REQUIRES_SUPER on base class) since this will cause the Callout's children to appear within the main component.
		// Instead we want to add the react subviews to the proxy callout view which is in its own callout window.
		calloutProxyView.insertReactSubview(subview, at: atIndex)
		calloutProxyView.insertSubview(subview, at: atIndex)
	}

	override func removeFromSuperview() {
		for subview in calloutProxyView.subviews {
			subview.removeFromSuperview()
		}
		calloutProxyTouchHandler = nil
		calloutWindowRootViewController = nil
		super.removeFromSuperview()
	}

	override func reactSetFrame(_ frame: CGRect) {
		super.reactSetFrame(frame)
		updateCalloutFrameToTargetFrame()
		self.frame = .zero
	}

	// MARK: WindowLifeCycleDelegate

	func didDetectHitOutsideCallout(calloutWindow: CalloutWindow) {
		 dismissCallout()
	}

	func applicationDidResignActiveForCalloutWindow(calloutWindow: CalloutWindow) {
		 dismissCallout()
	}

	// MARK: Private methods

	private func dismissCallout() {
		if let onDismiss = onDismiss {
			guard let reactTag = reactTag else {
				preconditionFailure("React Tag missing")
			}
			let event: [AnyHashable: Any] = ["target": reactTag]
			onDismiss(event)
		}
		calloutWindow?.close() // SAAD Addition

	}

	// Updates the Callout frame in the CalloutWindow to the correct screen coordinates
	private func updateCalloutFrameToTargetFrame() {
		guard let bridge = bridge else {
			return
		}

		var targetFrameInWindow: CGRect = .zero
		
		if (!anchorRect.equalTo(.zero))  {
			targetFrameInWindow = convert(anchorRect, to: nil)
		} else {
			guard let targetView = bridge.uiManager.view(forReactTag: target) else {
				// Nowhere to put the Callout,
				preconditionFailure("Neither anchorRect nor target were provided to position the Callout")
			}
			targetFrameInWindow = targetView.convert(targetView.frame, to: nil)
		}
		
		if let window = window {
			let targetFrameInWindowCoordinates = window.convertToScreen(targetFrameInWindow)
			
			var calloutRect = bestRectRelativeToTargetFrame(targetRect: targetFrameInWindowCoordinates)
			calloutWindow?.setFrame(calloutRect, display: true)
			calloutRect.origin.x = 0
			calloutRect.origin.y = 0
			calloutProxyView.frame = calloutRect

			calloutWindowRootViewController?.view.frame = calloutRect
		}

	}

	private func bestRectRelativeToTargetFrame(targetRect:CGRect) -> CGRect {
		let calloutFrame = frame
		maxCalloutHeight = max(maxCalloutHeight, NSInteger(calloutFrame.size.height))
		maxCalloutWidth = max(maxCalloutWidth, NSInteger(calloutFrame.size.width))
		let maxHeight = CGFloat(maxCalloutHeight)
		let maxWidth = CGFloat(maxCalloutWidth)

		// Use the screen the anchor view is on, not necessarily the main screen
		// TODO: VSO#2339406, don't use mainScreen. Mirror CUIMenuWindow
		guard let screenFrame = NSScreen.main?.visibleFrame else {
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

	// MARK: Private variables

	private var calloutWindow: CalloutWindow?
	private var calloutWindowRootViewController: NSViewController?
	private var calloutProxyView: RCTView
	private var calloutProxyTouchHandler: RCTTouchHandler?
	// Internally track that the callout never shrinks in size when it's laying out
	private var maxCalloutHeight: NSInteger = 0
	private var maxCalloutWidth: NSInteger = 0
}
