import Foundation
import AppKit

protocol CalloutWindowLifeCycleDelegate: AnyObject {
	/// Notify the delegate that the Callout is about to dismiss
	func calloutWillDismiss(window: CalloutWindow)
}

class CalloutWindow: NSWindow {

	weak var lifeCycleDelegate: CalloutWindowLifeCycleDelegate?

	override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
		super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)
		isReleasedWhenClosed = false

		styleMask = .borderless
		level = .popUpMenu
		backgroundColor = .clear
		isMovable = false

		// Dismiss the Callout if the window is no longer active.
		NotificationCenter.default.addObserver(self, selector: #selector(dismissCallout), name: NSApplication.didResignActiveNotification, object: nil)

		// Dismiss the Callout if the user touched/clicked outside the Callout Window or any of our child windows.
		mouseEventMonitor = NSEvent.addLocalMonitorForEvents(matching: .leftMouseUp, handler: { [weak self] (event) -> NSEvent? in
			guard let clickedWindow = event.window else {
				return event
			}

			var shouldDismissCallout = false

			if (clickedWindow.isEqual(to: self) ) {
				shouldDismissCallout = false
			} else if (clickedWindow.isMainWindow) {
				shouldDismissCallout = true
			} else if (clickedWindow.isEqual(to: self?.parent) && self?.parent is CalloutWindow) {
				// We are a child window of a Callout (e.g: a ContextualMenu Submenu), and the click happened in our parent
				shouldDismissCallout = false
			} else {
				// Check if the click happened in any of our child windows (e.g: our submenus)
				if let childWindows = self?.childWindows {
					if (childWindows.contains(clickedWindow)) {
						shouldDismissCallout = false
					} else {
						shouldDismissCallout = true
					}
				}
			}

			if (shouldDismissCallout) {
				self?.dismissCallout()
			}

			return event
		})
	}

	// Required to get a key view loop in the window
	override var canBecomeKey: Bool {
		return true
	}

	override var canBecomeMain: Bool {
		return false
	}

	// Required to close the window on escape key press
	override func cancelOperation(_ sender: Any?) {
		dismissCallout()
	}

	@objc private func dismissCallout() {
		lifeCycleDelegate?.calloutWillDismiss(window: self)

		if let monitor = mouseEventMonitor {
			NSEvent.removeMonitor(monitor)
		}

		orderOut(self)
	}

	private var mouseEventMonitor: Any?
}
