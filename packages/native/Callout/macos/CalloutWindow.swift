import Foundation
import AppKit

protocol CalloutWindowLifeCycleDelegate: AnyObject {
	/// Notify the delegate that the Callout is about to dismiss
	func calloutWillDismiss(window: CalloutWindow)
	var calloutManagesFocus: Bool { get }
	var calloutManagedGeneration: String? { get }
	var calloutManagedStartTime: TimeInterval { get }
	func calloutDidPressEscape(window: CalloutWindow)
	func calloutDidReceiveInput(window: CalloutWindow, event: NSEvent)
	func calloutDidPressTab(window: CalloutWindow, event: NSEvent)
	func calloutDidMovePointer(window: CalloutWindow, event: NSEvent)
}

class CalloutWindow: NSWindow {
	weak var lifeCycleDelegate: CalloutWindowLifeCycleDelegate?
	private var managedTabEvent: NSEvent?

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

	// Required to close the window on escape key press
	override func cancelOperation(_ sender: Any?) {
		if lifeCycleDelegate?.calloutManagesFocus == true {
			return
		}
		dismissCallout()
	}

	override func sendEvent(_ event: NSEvent) {
		let generation = lifeCycleDelegate?.calloutManagedGeneration
		let managed = lifeCycleDelegate?.calloutManagesFocus == true && generation != nil
		let inputTypes: [NSEvent.EventType] = [.keyDown, .keyUp, .leftMouseDown, .rightMouseDown, .otherMouseDown,
			.mouseMoved, .leftMouseDragged, .rightMouseDragged, .otherMouseDragged]
		if managed, inputTypes.contains(event.type), let start = lifeCycleDelegate?.calloutManagedStartTime,
			event.timestamp < start {
			return
		}
		let modifiers = event.modifierFlags.intersection([.command, .control, .option, .shift])
		let isTab = managed && event.type == .keyDown && event.keyCode == 48 &&
			modifiers.subtracting(.shift).isEmpty
		if managed &&
			[.keyDown, .leftMouseDown, .rightMouseDown, .otherMouseDown].contains(event.type) {
			lifeCycleDelegate?.calloutDidReceiveInput(window: self, event: event)
		}
		if isTab { managedTabEvent = event }
		defer { if isTab { managedTabEvent = nil } }
		super.sendEvent(event)
		let current = managed && lifeCycleDelegate?.calloutManagedGeneration == generation
		if isTab && current {
			lifeCycleDelegate?.calloutDidPressTab(window: self, event: event)
		}
		if current,
			event.type == .keyDown, event.keyCode == 53, !event.isARepeat, modifiers.isEmpty {
			lifeCycleDelegate?.calloutDidPressEscape(window: self)
		}
		if current && [.mouseMoved, .leftMouseDragged, .rightMouseDragged, .otherMouseDragged].contains(event.type) {
			lifeCycleDelegate?.calloutDidMovePointer(window: self, event: event)
		}
	}

	// Deliver the genuine key to observers, but never traverse the popup's key loop.
	override func selectNextKeyView(_ sender: Any?) {
		if managedTabEvent == nil { super.selectNextKeyView(sender) }
	}

	override func selectPreviousKeyView(_ sender: Any?) {
		if managedTabEvent == nil { super.selectPreviousKeyView(sender) }
	}

	override func selectKeyView(following view: NSView) {
		if managedTabEvent == nil { super.selectKeyView(following: view) }
	}

	override func selectKeyView(preceding view: NSView) {
		if managedTabEvent == nil { super.selectKeyView(preceding: view) }
	}

	@objc public func dismissCallout() {
		lifeCycleDelegate?.calloutWillDismiss(window: self)
		orderOut(self)
	}
}
