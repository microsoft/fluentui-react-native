import AppKit
import Foundation
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNCalloutView)
open class CalloutView: RCTView, CalloutWindowLifeCycleDelegate {

	@objc public var target: NSNumber? {
		didSet {
			let targetView = bridge?.uiManager.view(forReactTag: target)
			if (targetView == nil && target != nil) {
				if menuFocusManagement {
					NSLog("Callout managed anchor is not mounted.")
					setAnchorView(nil)
					return
				}
				preconditionFailure("Invalid target")
			}
			setAnchorView(targetView)
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
	@objc public var menuFocusManagement: Bool = false
	@objc public var onReady: RCTDirectEventBlock?
	@objc public var onDismissContext: RCTDirectEventBlock?
	@objc public var onManagedOperationResult: RCTDirectEventBlock?
	@objc public var onMenuPointerMove: RCTDirectEventBlock?
	@objc public var isManagedTargetEligible: ((NSView) -> Bool)?
	@objc public var managedEventsAttached: Bool = true

	var calloutManagesFocus: Bool { return menuFocusManagement }
	var calloutManagedGeneration: String? { return managedGeneration }
	var calloutManagedStartTime: TimeInterval { return managedStartTime }
	
	@objc public func focusWindow() {
		calloutWindow.makeKey()
	}
	
	@objc public func blurWindow() {
		calloutWindow.parent?.makeKey()
	}

	public weak var bridge: RCTBridge?

	@objc public override init(frame frameRect: NSRect) {
		super.init(frame: frameRect)

		backgroundColor = .clear
		borderColor = .clear

		// Listens for mouse clicks in the main menu bar while callout is shown
		NotificationCenter.default.addObserver(
			self,
			selector: #selector(menuDidBeginTracking),
			name: NSMenu.didBeginTrackingNotification,
			object: nil)
	}

	public required init?(coder: NSCoder) {
		preconditionFailure()
	}

	convenience init(bridge: RCTBridge) {
		self.init(frame: .zero)
		self.bridge = bridge
	}

	public override func viewDidMoveToWindow() {
		super.viewDidMoveToWindow()
		if (window != nil) {
			showCallout()
		} else {
			if menuFocusManagement {
				closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
				managedClosed = false
			} else {
				dismissCallout()
			}
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

	// MARK: Fabric interface

	@objc public var contentProxyView: NSView {
		return proxyView
	}

	@objc public func setAnchorView(_ view: NSView?) {
		if menuFocusManagement, managedGeneration != nil, anchorView !== view {
			closeManaged(reason: "host-detached", returnFocus: false)
		}
		anchorView = view
		updateCalloutFrameToAnchor()
	}

	@objc public func mountContentSubview(_ subview: NSView, at index: Int) {
		if index >= proxyView.subviews.count {
			proxyView.addSubview(subview)
		} else {
			proxyView.addSubview(subview, positioned: .below, relativeTo: proxyView.subviews[index])
		}
		observeManagedContent()
	}

	@objc public func unmountContentSubview(_ subview: NSView) {
		if subview.superview == proxyView {
			if menuFocusManagement, managedGeneration != nil {
				closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
			}
			subview.removeFromSuperview()
			removeContentObserver()
		}
	}

	@objc public func updateContentSize(_ size: NSSize) {
		proxyView.frame = NSRect(origin: .zero, size: size)
		updateCalloutFrameToAnchor()
	}

	// MARK: RCTComponent Overrides

	public override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
		proxyView.insertReactSubview(subview, at: atIndex)
	}

	public override func didUpdateReactSubviews() {
		proxyView.didUpdateReactSubviews()
		if menuFocusManagement, managedGeneration != nil, observedContent !== proxyView.subviews.first {
			closeManaged(reason: "host-detached", returnFocus: false)
		}
		observeManagedContent()
		finalizeManagedPresentation()
	}

	public override func reactSetFrame(_ frame: CGRect) {
		proxyView.reactSetFrame(frame)
		updateCalloutFrameToAnchor()
		finalizeManagedPresentation()
	}

	// MARK: WindowLifeCycleDelegate

	func calloutWillDismiss(window: CalloutWindow) {
		if menuFocusManagement {
			closeManaged(reason: "native-light-dismiss", returnFocus: false)
		} else {
			onDismissCallout()
		}
	}

	func calloutDidPressEscape(window: CalloutWindow) {
		if ownsPopupFocus(allowDetachedChild: true) { closeManaged(reason: "escape", returnFocus: true) }
	}

	func calloutDidReceiveInput(window: CalloutWindow, event: NSEvent) {
		guard let root = managedFamilyRoot() else {
			closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
			return
		}
		for member in root.managedSubtree() { member.managedInputObserved = true }
		if event.type != .keyDown {
			root.managedPointerPosition = calloutWindow.convertPoint(toScreen: event.locationInWindow)
		}
	}

	func calloutDidPressTab(window: CalloutWindow, event: NSEvent) {
		guard ownsPopupFocus(allowDetachedChild: true), let root = managedFamilyRoot() else { return }
		root.closeManagedSubtree(origin: self, reason: "tab", returnFocus: false, tabEvent: event)
	}

	func calloutDidMovePointer(window: CalloutWindow, event: NSEvent) {
		guard let generation = managedGeneration, isCalloutWindowShown, calloutWindow.isVisible,
			event.window === calloutWindow, NSApp.isActive, let root = managedFamilyRoot(),
			NSApp.mainWindow === root.managedOpeningMainWindow,
			proxyView.bounds.contains(proxyView.convert(event.locationInWindow, from: nil)),
			event.deltaX != 0 || event.deltaY != 0 else { return }
		let position = calloutWindow.convertPoint(toScreen: event.locationInWindow)
		defer { root.managedPointerPosition = position }
		guard root.managedPointerPosition != position else { return }
		let targetTag = managedHitTargetTag(for: event)
		guard managedGeneration == generation, isCalloutWindowShown, calloutWindow.isVisible,
			NSApp.isActive, NSApp.mainWindow === root.managedOpeningMainWindow,
			managedFamilyRoot() === root else { return }
		for member in root.managedSubtree() { member.managedInputObserved = true }
		onMenuPointerMove?(["generation": generation, "pointerId": "mouse",
			"screenX": position.x, "screenY": position.y, "targetTag": targetTag])
	}

	private func managedHitTargetTag(for event: NSEvent) -> Int32 {
		// AppKit hitTest takes a point in the receiver's superview coordinates.
		guard let superview = proxyView.superview,
			let hit = proxyView.hitTest(superview.convert(event.locationInWindow, from: nil)),
			hit.window === calloutWindow, hit.isDescendant(of: proxyView) else { return 0 }
		var view: NSView? = hit
		while let current = view, current !== proxyView {
			guard current.window === calloutWindow, current.isDescendant(of: proxyView) else { return 0 }
			if current.acceptsFirstResponder {
				guard managedTargetIsEligible(current), let tag = current.reactTag,
					let value = Int32(exactly: tag.int64Value), value > 0 else { return 0 }
				return value
			}
			view = current.superview
		}
		return 0
	}

	@objc public func finalizeManagedPresentation() {
		if menuFocusManagement {
			if managedGeneration != nil, managedFamilyRoot() == nil {
				closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
			}
			showCallout()
		}
	}

	@objc public func resetManagedPresentation() {
		if menuFocusManagement {
			closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
		}
		managedClosed = false
		managedGeneration = nil
		removeContentObserver()
	}

	@objc public func focusInitialChild(_ generation: String, requestId: String, targetTag: NSNumber) {
		var status = managedRequestStatus(generation)
		if status == nil {
			if let target = findManagedTarget(in: proxyView, tag: targetTag) {
				if managedInputObserved {
					status = "focus-moved"
				} else if !managedTargetIsEligible(target) {
					status = "not-focusable"
				} else if !canOwnPopupFocus() {
					status = "inactive-window"
				} else {
					calloutWindow.makeKey()
					let accepted = calloutWindow.makeFirstResponder(target)
					status = accepted && ownsPopupFocus() && target.window === calloutWindow &&
						managedTargetIsEligible(target) && calloutWindow.firstResponder === target
						? "confirmed" : "failed"
					if status == "confirmed" { managedFocusedChild = target }
				}
			} else {
				status = "not-mounted"
			}
		}
		emitManagedResult(generation, requestId: requestId, operation: "initial-focus",
			status: status ?? "failed", returnFocus: "not-requested")
	}

	@objc public func focusOwnedChild(_ generation: String, requestId: String, targetTag: NSNumber, intent: String) {
		var status = managedRequestStatus(generation)
		if status == nil {
			if !["keyboard", "pointer", "repair"].contains(intent) {
				status = "failed"
			} else if let target = findManagedTarget(in: proxyView, tag: targetTag) {
				if !managedTargetIsEligible(target) {
					status = "not-focusable"
				} else if !ownsPopupFocus(allowDetachedChild: intent == "repair") {
					status = NSApp.isActive && calloutWindow.isKeyWindow ? "focus-moved" : "inactive-window"
				} else {
					let accepted = calloutWindow.makeFirstResponder(target)
					status = accepted && ownsPopupFocus() && target.window === calloutWindow && managedTargetIsEligible(target) &&
						calloutWindow.firstResponder === target ? "confirmed" : "failed"
					if status == "confirmed" { managedFocusedChild = target }
				}
			} else {
				status = "not-mounted"
			}
		}
		emitManagedResult(generation, requestId: requestId, operation: "owned-child-focus",
			status: status ?? "failed", returnFocus: "not-requested")
	}

	@objc public func closeOwned(_ generation: String, requestId: String, reason: String, returnFocus: Bool) {
		if let status = managedRequestStatus(generation) {
			emitManagedResult(generation, requestId: requestId, operation: "close", status: status, returnFocus: "not-requested")
			return
		}
		guard reason == "action" || reason == "programmatic" || reason == "submenu-back" else {
			emitManagedResult(generation, requestId: requestId, operation: "close", status: "failed", returnFocus: "not-requested")
			return
		}
		if reason == "submenu-back", liveManagedParent() == nil {
			emitManagedResult(generation, requestId: requestId, operation: "close", status: "failed", returnFocus: "not-requested")
			return
		}
		closeManaged(reason: reason, returnFocus: returnFocus && reason != "programmatic", requestId: requestId)
	}

	private func managedRequestStatus(_ generation: String) -> String? {
		if !menuFocusManagement { return "unsupported" }
		if managedGeneration == nil || !isCalloutWindowShown { return "not-mounted" }
		if managedGeneration != generation { return "cancelled" }
		return managedFamilyRoot() == nil ? "not-mounted" : nil
	}

	private func managedTargetIsEligible(_ view: NSView) -> Bool {
		if view.window == nil || view.isHiddenOrHasHiddenAncestor || view.bounds.isEmpty || !view.acceptsFirstResponder { return false }
		var ancestor: NSView? = view
		while let current = ancestor {
			if current.alphaValue <= 0 || (current.layer?.opacity ?? 1) <= 0 { return false }
			ancestor = current.superview
		}
		if let control = view as? NSControl, !control.isEnabled { return false }
		return isManagedTargetEligible?(view) ?? true
	}

	private func findManagedTarget(in view: NSView, tag: NSNumber) -> NSView? {
		if view.reactTag == tag { return view }
		for child in view.subviews {
			if let match = findManagedTarget(in: child, tag: tag) { return match }
		}
		return nil
	}

	private func canOwnPopupFocus() -> Bool {
		guard let root = managedFamilyRoot(), NSApp.isActive,
			NSApp.mainWindow === root.managedOpeningMainWindow, let parent = managedParent,
			parent.isVisible, !parent.isMiniaturized else { return false }
		return (calloutWindow.isKeyWindow && popupContainsFocus()) || (parent.isKeyWindow && parent.firstResponder === openingResponder)
	}

	private func ownsPopupFocus(allowDetachedChild: Bool = false) -> Bool {
		guard let root = managedFamilyRoot() else { return false }
		guard NSApp.isActive, NSApp.mainWindow === root.managedOpeningMainWindow,
			calloutWindow.isVisible, calloutWindow.isKeyWindow else { return false }
		if popupContainsFocus() { return true }
		return allowDetachedChild && managedFocusedChild != nil && managedFocusedChild?.window == nil &&
			calloutWindow.firstResponder === managedFocusedChild
	}

	private func popupContainsFocus() -> Bool {
		guard let responder = calloutWindow.firstResponder else { return true }
		if responder === calloutWindow { return true }
		var view = responder as? NSView
		while let current = view {
			if current === proxyView { return true }
			view = current.superview
		}
		return false
	}

	private func emitManagedResult(_ generation: String, requestId: String, operation: String, status: String, returnFocus: String) {
		onManagedOperationResult?(["generation": generation, "requestId": requestId,
			"operation": operation, "status": status, "returnFocus": returnFocus])
	}

	private func anchorIsCurrent() -> Bool {
		guard let anchor = managedAnchor, let parent = managedParent,
			anchor === anchorView, anchor.reactTag == managedAnchorTag, anchor.window === parent,
			parent.isVisible, !parent.isMiniaturized else { return false }
		return true
	}

	private func liveManagedParent() -> CalloutView? {
		guard let parent = managedParentCallout, let generation = managedParentGeneration,
			parent.menuFocusManagement, parent.managedGeneration == generation, parent.isCalloutWindowShown,
			managedParent === parent.calloutWindow, let anchor = managedAnchor,
			anchorIsCurrent(), anchor.isDescendant(of: parent.proxyView) else { return nil }
		return parent
	}

	private func managedFamilyRoot() -> CalloutView? {
		var current = self
		var visited = Set<ObjectIdentifier>()
		while visited.insert(ObjectIdentifier(current)).inserted {
			guard current.menuFocusManagement, current.managedGeneration != nil,
				current.isCalloutWindowShown, current.anchorIsCurrent() else { return nil }
			if current.managedParentGeneration == nil { return current }
			guard let parent = current.liveManagedParent() else { return nil }
			current = parent
		}
		return nil
	}

	private func managedSubtree() -> [CalloutView] {
		guard let generation = managedGeneration, isCalloutWindowShown else { return [] }
		var members: [CalloutView] = []
		for child in managedChildren {
			if let view = child.view, view.managedGeneration == child.generation,
				view.managedParentCallout === self, view.managedParentGeneration == generation {
				members.append(contentsOf: view.managedSubtree())
			}
		}
		members.append(self)
		return members
	}

	private func containsFamilyWindow(_ window: NSWindow) -> Bool {
		guard let root = managedFamilyRoot() else { return false }
		return root.managedSubtree().contains { $0.calloutWindow === window && $0.managedFamilyRoot() === root }
	}

	private func detachManagedFamily() {
		if let parent = managedParentCallout {
			parent.managedChildren.removeAll { $0.view == nil || $0.view === self }
		}
		managedParentCallout = nil
		managedParentGeneration = nil
		managedChildren.removeAll()
	}

	private func closeManaged(reason: String, returnFocus: Bool, requestId: String? = nil, notifyLegacy: Bool = true) {
		guard managedGeneration != nil, isCalloutWindowShown else { return }
		let scope = reason == "action" || reason == "native-light-dismiss" ? (managedFamilyRoot() ?? self) : self
		scope.closeManagedSubtree(origin: self, reason: reason, returnFocus: returnFocus,
			requestId: requestId, notifyLegacy: notifyLegacy && reason != "host-detached")
	}

	private func closeManagedSubtree(origin: CalloutView, reason: String, returnFocus: Bool,
		requestId: String? = nil, notifyLegacy: Bool = true, tabEvent: NSEvent? = nil) {
		let members = managedSubtree()
		guard let originGeneration = origin.managedGeneration, !members.isEmpty,
			members.contains(where: { $0 === origin }) else { return }
		let snapshots = members.compactMap { member -> (CalloutView, String)? in
			guard let generation = member.managedGeneration else { return nil }
			return (member, generation)
		}
		let ownedPopup = members.contains { $0.ownsPopupFocus(allowDetachedChild: reason == "tab" || reason == "escape") }
		let parent = managedParent
		let anchor = managedAnchor
		let anchorTag = managedAnchorTag
		let opening = openingResponder
		let parentCallout = managedParentCallout
		let parentGeneration = managedParentGeneration
		let scopeGeneration = managedGeneration
		let openingMainWindow = managedOpeningMainWindow
		let destinationCurrent = { () -> Bool in
			guard let parent = parent, let anchor = anchor, anchor === self.anchorView,
				anchor.window === parent, anchor.reactTag == anchorTag,
				parent.isVisible, !parent.isMiniaturized,
				self.managedGeneration == nil || self.managedGeneration == scopeGeneration else { return false }
			if let generation = parentGeneration {
				guard let owner = parentCallout, owner.managedGeneration == generation,
					owner.managedFamilyRoot() != nil, owner.calloutWindow === parent,
					anchor.isDescendant(of: owner.proxyView) else { return false }
			}
			return true
		}
		var returnStatus = "not-requested"
		if returnFocus {
			if !ownedPopup { returnStatus = "inactive-window" }
			else if !destinationCurrent() { returnStatus = "not-mounted" }
			else if let anchor = anchor, !managedTargetIsEligible(anchor) { returnStatus = "not-focusable" }
			else if parent?.firstResponder !== opening { returnStatus = "focus-moved" }
			else { returnStatus = "confirmed" }
		}
		let canContinueTab = tabEvent != nil && ownedPopup && destinationCurrent() &&
			parent?.firstResponder === opening &&
			(opening == nil || opening === parent || (opening as? NSView)?.window === parent)
		for member in members {
			member.managedGeneration = nil
			member.managedClosed = true
			member.isCalloutWindowShown = false
			member.managedFocusedChild = nil
			member.removeManagedObservers()
		}
		for member in members {
			for child in member.calloutWindow.childWindows ?? [] {
				if let window = child as? CalloutWindow,
					!members.contains(where: { $0.calloutWindow === window }) {
					window.dismissCallout()
				}
			}
			member.calloutWindow.orderOut(member)
			member.calloutWindow.parent?.removeChildWindow(member.calloutWindow)
			member.detachManagedFamily()
		}
		let closed = members.allSatisfy { !$0.calloutWindow.isVisible }
		let canHandOff = { () -> Bool in
			guard NSApp.isActive, NSApp.mainWindow === openingMainWindow,
				destinationCurrent(), let parent = parent else { return false }
			let key = NSApp.keyWindow
			return key == nil || key === parent || members.contains { $0.calloutWindow === key }
		}
		if !closed && returnFocus { returnStatus = "failed" }
		if closed && returnFocus && returnStatus == "confirmed", let parent = parent, let anchor = anchor {
			if !canHandOff() {
				returnStatus = "inactive-window"
			} else if !managedTargetIsEligible(anchor) {
				returnStatus = "not-mounted"
			} else if parent.firstResponder !== opening {
				returnStatus = "focus-moved"
			} else {
				parent.makeKey()
				if !canHandOff() || parent.firstResponder !== opening || !managedTargetIsEligible(anchor) {
					returnStatus = "focus-moved"
				} else {
					let accepted = parent.makeFirstResponder(anchor)
					returnStatus = accepted && destinationCurrent() && managedTargetIsEligible(anchor) && parent.firstResponder === anchor &&
						parent.isKeyWindow && NSApp.isActive ? "confirmed" : "failed"
				}
			}
		}
		if closed, let event = tabEvent {
			if canContinueTab && canHandOff(), let parent = parent, parent.firstResponder === opening {
				parent.makeKey()
				if canHandOff() && parent.isKeyWindow && parent.firstResponder === opening {
					if event.modifierFlags.contains(.shift) { parent.selectPreviousKeyView(event) }
					else { parent.selectNextKeyView(event) }
				} else {
					NSLog("Callout Tab continuation cancelled after owner key-window handoff.")
				}
			} else {
				NSLog("Callout Tab continuation cancelled: originating owner or destination changed.")
			}
		}
		if let requestId = requestId {
			origin.emitManagedResult(originGeneration, requestId: requestId, operation: "close",
				status: closed ? "confirmed" : "failed", returnFocus: returnStatus)
		}
		for (member, generation) in snapshots where !member.calloutWindow.isVisible {
			member.onDismissContext?(["generation": generation, "reason": reason,
				"returnFocus": member === self ? returnStatus : "not-requested"])
			if notifyLegacy { member.onDismissCallout() }
		}
	}

	private func removeManagedObservers() {
		for observer in managedObservers { NotificationCenter.default.removeObserver(observer) }
		managedObservers.removeAll()
		mouseEventMonitor.removeMonitor()
		removeContentObserver()
		if let area = managedPointerTrackingArea { proxyView.removeTrackingArea(area) }
		managedPointerTrackingArea = nil
		if let previous = managedAcceptsMouseMoved { calloutWindow.acceptsMouseMovedEvents = previous }
		managedAcceptsMouseMoved = nil
	}

	private func removeContentObserver() {
		if let observer = contentFrameObserver { NotificationCenter.default.removeObserver(observer) }
		observedContent?.postsFrameChangedNotifications = contentPostedFrames
		contentFrameObserver = nil
		observedContent = nil
	}

	private func observeManagedContent() {
		guard menuFocusManagement, !managedClosed, let content = proxyView.subviews.first else { return }
		if observedContent === content { return }
		removeContentObserver()
		observedContent = content
		contentPostedFrames = content.postsFrameChangedNotifications
		content.postsFrameChangedNotifications = true
		contentFrameObserver = NotificationCenter.default.addObserver(forName: NSView.frameDidChangeNotification,
			object: content, queue: nil) { [weak self, weak content] _ in
			guard let self = self, let content = content,
				self.observedContent === content, content.superview === self.proxyView else { return }
			self.finalizeManagedPresentation()
		}
	}

	// MARK: Private methods

	private func showCallout() {
		guard !isCalloutWindowShown, !menuFocusManagement || !managedClosed else {
			return
		}
		if menuFocusManagement {
			observeManagedContent()
			guard managedEventsAttached, onReady != nil,
				window != nil, let anchor = anchorView, let anchorTag = anchor.reactTag,
				let parent = anchor.window,
				!proxyView.subviews.isEmpty, !proxyView.frame.isEmpty,
				proxyView.subviews.allSatisfy({ !$0.bounds.isEmpty }) else { return }
			if let popup = parent as? CalloutWindow {
				guard let owner = popup.lifeCycleDelegate as? CalloutView, owner !== self,
					let root = owner.managedFamilyRoot(), let generation = owner.managedGeneration,
					!root.managedSubtree().contains(where: { $0 === self }),
					anchor.isDescendant(of: owner.proxyView) else {
					NSLog("Callout submenu anchor has no live managed popup owner.")
					return
				}
				managedParentCallout = owner
				managedParentGeneration = generation
				managedOpeningMainWindow = root.managedOpeningMainWindow
			} else {
				managedOpeningMainWindow = NSApp.mainWindow
			}
			managedParent = parent
			managedAnchor = anchor
			managedAnchorTag = anchorTag
			openingResponder = parent.firstResponder
			managedGeneration = UUID().uuidString
			managedStartTime = ProcessInfo.processInfo.systemUptime
			managedInputObserved = false
			managedFocusedChild = nil
			managedPointerPosition = NSEvent.mouseLocation
			if let owner = managedParentCallout, let generation = managedGeneration {
				owner.managedChildren.removeAll { $0.view == nil || $0.view === self }
				owner.managedChildren.append(ManagedChild(self, generation: generation))
			}
			if calloutWindow.parent !== parent {
				calloutWindow.parent?.removeChildWindow(calloutWindow)
				parent.addChildWindow(calloutWindow, ordered: .above)
			}
			managedAcceptsMouseMoved = calloutWindow.acceptsMouseMovedEvents
			calloutWindow.acceptsMouseMovedEvents = true
			let area = NSTrackingArea(rect: .zero,
				options: [.mouseMoved, .activeInActiveApp, .inVisibleRect, .enabledDuringMouseDrag],
				owner: calloutWindow, userInfo: nil)
			proxyView.addTrackingArea(area)
			managedPointerTrackingArea = area
		}

		updateCalloutFrameToAnchor()
		if menuFocusManagement { isCalloutWindowShown = true }
		calloutWindow.orderFront(self)
		if (menuFocusManagement ? (NSApp.isActive && managedParent?.isKeyWindow == true) : setInitialFocus) {
		    calloutWindow.makeKey()
		}
		if menuFocusManagement && !isCalloutWindowShown { return }

		// Dismiss the Callout if the window is no longer active.
		if menuFocusManagement {
			for name in [NSApplication.didResignActiveNotification, NSMenu.didBeginTrackingNotification] {
				managedObservers.append(NotificationCenter.default.addObserver(forName: name, object: nil, queue: nil) { [weak self] _ in
					self?.closeManaged(reason: "native-light-dismiss", returnFocus: false)
				})
			}
			managedObservers.append(NotificationCenter.default.addObserver(forName: NSWindow.didBecomeKeyNotification,
				object: nil, queue: nil) { [weak self] notification in
				guard let self = self, self.managedGeneration != nil,
					let activated = notification.object as? NSWindow else { return }
				if self.containsFamilyWindow(activated) { return }
				self.closeManaged(reason: "native-light-dismiss", returnFocus: false)
			})
		} else {
			NotificationCenter.default.addObserver(self, selector: #selector(dismissCallout), name: NSApplication.didResignActiveNotification, object: nil)
		}

		let pointerEvents: NSEvent.EventTypeMask = menuFocusManagement ? [.leftMouseDown, .rightMouseDown, .otherMouseDown] : .leftMouseDown
		mouseEventMonitor.addLocalMonitorForEvents(matching: pointerEvents, handler: { [weak self] (event) -> NSEvent? in
			if let self = self, self.menuFocusManagement {
				guard self.managedGeneration != nil else { return event }
				if let window = event.window, self.containsFamilyWindow(window) { return event }
				self.closeManaged(reason: "native-light-dismiss", returnFocus: false)
				return event
			}
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
							if isClickInsideWindowHierarchy(window: childWindow, event: event) { return true }
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
		if let generation = managedGeneration { onReady?(["generation": generation]) }
	}

	@objc private func dismissCallout() {
		if menuFocusManagement {
			closeManaged(reason: "native-light-dismiss", returnFocus: false)
			return
		}
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
		if menuFocusManagement, anchorView?.window == nil {
			closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
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

		guard let window = anchorView.window else {
			preconditionFailure("No window found")
		}

		let anchorBoundsInWindow = anchorView.convert(anchorView.bounds, to: nil)
		let anchorFrameInScreenCoordinates = window.convertToScreen(anchorBoundsInWindow)

		return anchorFrameInScreenCoordinates
	}

	/// Calculates the rect in screen coordinates the callout should be positioned in relative to the anchor rect, adjusting if we are close to a screen edge
	private func bestCalloutRect(relativeTo anchorScreenRect: NSRect) -> NSRect {

		guard let screenFrame = anchorView?.window?.screen?.visibleFrame ?? window?.screen?.visibleFrame ?? NSScreen.main?.visibleFrame else {
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
			let event: [AnyHashable: Any] = ["target": reactTag ?? NSNumber(value: 0)]
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
		if let bridge = bridge {
			guard let touchHandler = RCTTouchHandler(bridge: bridge) else {
				preconditionFailure("Callout could not create RCTTouchHandler")
			}
			visualEffectView.addGestureRecognizer(touchHandler)
		}

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
	private var managedGeneration: String?
	private var managedStartTime: TimeInterval = 0
	private var managedClosed = false
	private var managedInputObserved = false
	private weak var managedFocusedChild: NSView?
	private final class ManagedChild {
		weak var view: CalloutView?
		let generation: String
		init(_ view: CalloutView, generation: String) {
			self.view = view
			self.generation = generation
		}
	}
	private weak var managedParentCallout: CalloutView?
	private var managedParentGeneration: String?
	private var managedChildren: [ManagedChild] = []
	private var managedPointerPosition: NSPoint?
	private var managedPointerTrackingArea: NSTrackingArea?
	private var managedAcceptsMouseMoved: Bool?
	private weak var managedParent: NSWindow?
	private weak var managedOpeningMainWindow: NSWindow?
	private weak var managedAnchor: NSView?
	private var managedAnchorTag: NSNumber?
	private weak var openingResponder: NSResponder?
	private var managedObservers: [NSObjectProtocol] = []
	private var contentFrameObserver: NSObjectProtocol?
	private weak var observedContent: NSView?
	private var contentPostedFrames = false

	deinit {
		for child in managedChildren {
			child.view?.closeManaged(reason: "host-detached", returnFocus: false, notifyLegacy: false)
		}
		if menuFocusManagement && isCalloutWindowShown {
			calloutWindow.orderOut(nil)
			calloutWindow.parent?.removeChildWindow(calloutWindow)
		}
		detachManagedFamily()
		removeManagedObservers()
		NotificationCenter.default.removeObserver(self)
	}
}
