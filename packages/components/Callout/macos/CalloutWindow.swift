import Foundation
import AppKit
import Carbon.HIToolbox

protocol CalloutWindowLifeCycleDelegate {
	func calloutWillDismiss(window: CalloutWindow)
}

class CalloutWindow: NSWindow {

	public var lifeCycleDelegate: CalloutWindowLifeCycleDelegate?

	override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
		super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)
		isReleasedWhenClosed = true

		styleMask = .borderless
		level = .popUpMenu
		backgroundColor = .clear
		isMovable = false

		// Dismiss the Callout if the window is no longer active.
		NotificationCenter.default.addObserver(self, selector: #selector(dismissCallout), name: NSApplication.didResignActiveNotification, object: nil)

		// Dismiss the Callout if the user touched/clicked outside the bounds of the callout.
		mouseEventMonitor = NSEvent.addLocalMonitorForEvents(matching: .leftMouseUp, handler: { (event) -> NSEvent? in
			if (event.window != self) {
				self.dismissCallout()
			}
			return event
		})
	}

	override var canBecomeKey: Bool {
		return true
	}

	override var canBecomeMain: Bool {
		return false
	}

	// Dismiss the Callout if the user presses the Escape Key
	override func keyDown(with event: NSEvent)  {
		switch Int(event.keyCode) {
		case kVK_Escape:
			dismissCallout()
		default:
			return super.keyDown(with: event)
		}
	}


	@objc private func dismissCallout() {
		lifeCycleDelegate?.calloutWillDismiss(window: self)
		close()
	}

	private var mouseEventMonitor: Any?
}
