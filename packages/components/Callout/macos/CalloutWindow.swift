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

		// Dismiss the Callout if the user clicked outside the Callout Window or any of our child windows.
		mouseEventMonitor = NSEvent.addLocalMonitorForEvents(matching: .leftMouseUp, handler: { [weak self] (event) -> NSEvent? in
			guard let clickedWindow = event.window else {
				return event
			}

			var shouldDismissCallout = true
			
			// Did the click happened in our own window?
			if (clickedWindow.isEqual(to: self) ) {
				shouldDismissCallout = false

			// Are we a child window of a Callout (e.g: a ContextualMenu submenu), where the click happened in our parent?
			} else if (clickedWindow.isEqual(to: self?.parent as? CalloutWindow)) {
				shouldDismissCallout = false

			// Did the click happened in any of our child windows (e.g: our submenus)?
			} else if (self?.childWindows?.contains(clickedWindow) ?? false) {
				shouldDismissCallout = false
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
