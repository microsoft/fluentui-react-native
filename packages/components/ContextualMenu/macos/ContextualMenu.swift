//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

@objc(FRNContextualMenu)
class ContextualMenu: RCTView, NSMenuDelegate {

	@objc public weak var bridge: RCTBridge?

	@objc public var targetViewTag: NSNumber? {
		didSet {
			targetView = bridge?.uiManager.view(forReactTag: targetViewTag)
		}
	}

	@objc public var onItemClick: RCTBubblingEventBlock?

	@objc public var onShow: RCTBubblingEventBlock?

	@objc public var onDismiss: RCTBubblingEventBlock?

	open override var menu: NSMenu? {
		didSet {
			updateMenu()
		}
	}

	private init() {
		super.init(frame: .zero)
		menu?.delegate = self
	}

	required init?(coder: NSCoder) {
		preconditionFailure()
	}

	convenience init(bridge: RCTBridge) {
		self.init()
		self.bridge = bridge
	}

//	override func viewDidMoveToWindow() {
//		if (reactSuperview() != nil) {
//			showContextualMenu()
//		}
//	}

	// MARK: - RCTComponent

	override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
		super.insertReactSubview(subview, at: atIndex)
		NSLog("Inserting Subview at " + String(atIndex))
		NSLog(NSStringFromCGRect(subview.frame))

	}

	override func didUpdateReactSubviews() {
		super.didUpdateReactSubviews()
		NSLog(String(reactSubviews().count))
		showContextualMenu()
	}

	// MARK: - NSMenuDelegate

	// TODO: These seem to be blocked by the menu lifecycle
//	func menuWillOpen(_ menu: NSMenu) {
//		sendOnShowEvent()
//	}

//	func menuDidClose(_ menu: NSMenu) {
//		sendOnDismissEvent()
//	}
	
	func numberOfItems(in menu: NSMenu) -> Int {
		return reactSubviews().count
	}
	
	func menu(_ menu: NSMenu, update item: NSMenuItem, at index: Int, shouldCancel: Bool) -> Bool {
		item.view = reactSubviews()[index]
		return shouldCancel
	}

	// MARK: - Private Methods

	private func updateMenu() {
		guard let menu = menu else {
			return
		}

		for menuItem in menu.items {
			menuItem.target = self
			menuItem.action = #selector(sendOnItemClickEvent)
		}
	}

	@objc(sendOnItemClickEvent:)
	private func sendOnItemClickEvent(sender: NSMenuItem) {
		if onItemClick != nil {
			guard let identifier = sender.identifier else {
				preconditionFailure("itemKey not set on Menu Item")
			}
			onItemClick!(["key": identifier])
		}
	}

	@objc(sendOnDismissEvent)
	private func sendOnDismissEvent() {
		onDismiss?([:])
	}

	@objc(sendOnShowEvent)
	private func sendOnShowEvent() {
		onShow?([:])
	}


	private func showContextualMenu() {
		updateMenu()

		for view in reactSubviews() {
			NSLog(NSStringFromCGRect(view.frame))
		}

		// Popping up an NSMenu is a blocking event, so let's be sure the onShow/onDismiss events are processed correctly
		sendOnShowEvent()
		DispatchQueue.main.async {
			let view = self.targetView ?? self
			self.menu?.popUp(positioning: nil, at: NSPoint(x: 0, y: view.frame.height), in: view)
			
			self.sendOnDismissEvent()
		}
	}

	// MARK: - Private variables

	private var targetView: NSView?
}


