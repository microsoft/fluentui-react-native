import Foundation
import AppKit

@MainActor
protocol CalloutWindowLifeCycleDelegate: AnyObject {
	/// Notify the delegate that the Callout is about to dismiss
	func calloutWillDismiss(window: CalloutWindow, reason: String?)
	func calloutDidDismiss(window: CalloutWindow)
	/// Returns whether the delegate consumed Tab or Shift+Tab before the popup's views could handle it.
	func calloutHandlesTab(window: CalloutWindow, backward: Bool) -> Bool
}

class CalloutWindow: NSWindow {
	weak var lifeCycleDelegate: CalloutWindowLifeCycleDelegate?

	override init(contentRect: NSRect, styleMask style: NSWindow.StyleMask, backing backingStoreType: NSWindow.BackingStoreType, defer flag: Bool) {
		super.init(contentRect: contentRect, styleMask: style, backing: backingStoreType, defer: flag)

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

	override func sendEvent(_ event: NSEvent) {
		// kVK_Tab; modified Tab keeps its ordinary meaning.
		if event.type == .keyDown, event.keyCode == 48,
			event.modifierFlags.intersection([.command, .control, .option]).isEmpty,
			lifeCycleDelegate?.calloutHandlesTab(window: self, backward: event.modifierFlags.contains(.shift)) == true {
			return
		}
		super.sendEvent(event)
	}

	// Required to close the window on escape key press
	override func cancelOperation(_ sender: Any?) {
		dismissCallout(reason: "escape")
	}

	@objc public func dismissCallout() {
		dismissCallout(reason: nil)
	}

	func dismissCallout(reason: String?) {
		lifeCycleDelegate?.calloutWillDismiss(window: self, reason: reason)
		orderOut(self)
		lifeCycleDelegate?.calloutDidDismiss(window: self)
	}
}
