import Foundation
import AppKit

protocol CalloutWindowLifeCycleDelegate {
	/*
	 * Notify the CalloutWindowLifeCycle object that the user touched/clicked outside the bounds of the callout.
	 */
	func didDetectHitOutsideCallout(calloutWindow: CalloutWindow)

	/*
	 * Notify the CalloutWindowLifeCycle object that the window the callout is in is no longer active.
	 */
	func applicationDidResignActiveForCalloutWindow(calloutWindow: CalloutWindow)
}

class CalloutWindow: NSWindow {

	public var windowLifeCycleDelegate: CalloutWindowLifeCycleDelegate?

	override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
		super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)
		isReleasedWhenClosed = true

		styleMask = .borderless
		level = .popUpMenu
		backgroundColor = .clear
		isMovable = false

		NotificationCenter.default.addObserver(self, selector: #selector(appDidChangeActive(notification:)), name: NSApplication.didResignActiveNotification, object: nil)

		mouseEventMonitor = NSEvent.addLocalMonitorForEvents(matching: .leftMouseUp, handler: { (event) -> NSEvent? in
			if (event.window != self) {
				self.windowLifeCycleDelegate?.didDetectHitOutsideCallout(calloutWindow: self)
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

	@objc func appDidChangeActive(notification: NSNotification) {
		windowLifeCycleDelegate?.applicationDidResignActiveForCalloutWindow(calloutWindow: self)
	}

	private var mouseEventMonitor: Any?
}