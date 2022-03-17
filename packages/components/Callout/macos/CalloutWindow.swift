import Foundation
import AppKit

protocol CalloutWindowLifeCycleDelegate: AnyObject {
	/// Notify the delegate that the Callout is about to dismiss
	func calloutWillDismiss(window: CalloutWindow)
}

class CalloutWindow: NSWindow {

	public var isSubwindow = false
	
	weak var lifeCycleDelegate: CalloutWindowLifeCycleDelegate?

	override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
		super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)
		isReleasedWhenClosed = false

		styleMask = .borderless
		level = .popUpMenu
		backgroundColor = .clear
		isMovable = false
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

	@objc public func dismissCallout() {
		lifeCycleDelegate?.calloutWillDismiss(window: self)
		close()
	}
	
	deinit {
		if (isSubwindow) {}
	}
}

