//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

@objc(FRNContextualMenu)
class ContextualMenu: RCTView, NSMenuDelegate {

	@objc public weak var bridge: RCTBridge?

	@objc public var target: NSNumber?

	@objc public var onItemClick: RCTBubblingEventBlock?

	@objc public var onShow: RCTBubblingEventBlock?

	@objc public var onDismiss: RCTBubblingEventBlock?

	private init() {
		super.init(frame: .zero)
		menu = NSMenu()
		menu?.delegate = self
	}

	required init?(coder: NSCoder) {
		preconditionFailure()
	}

	convenience init(bridge: RCTBridge) {
		self.init()
		self.bridge = bridge
	}

	override func viewWillDraw() {
		showContextualMenu()
	}

	// MARK: - RCTComponent

  override func didUpdateReactSubviews() {
    // Don't call super to prevent the views from being added as subviews to self
  }

	// MARK: - NSMenuDelegate

	func menuWillOpen(_ menu: NSMenu) {
		sendOnShowEvent()
	}

	func menuDidClose(_ menu: NSMenu) {
		sendOnDismissEvent()
	}

	func numberOfItems(in menu: NSMenu) -> Int {
		return reactSubviews().count
	}

	func menu(_ menu: NSMenu, update item: NSMenuItem, at index: Int, shouldCancel: Bool) -> Bool {
		let reactView: NSView = reactSubviews()[index]
		
		let viewTouchHandler = RCTTouchHandler(bridge: bridge)
		viewTouchHandler?.attach(to: reactView as? RCTUIView)
		
		item.view = reactView
		item.target = self
		item.action = #selector(sendOnItemClickEvent)
		return !shouldCancel
	}

	// MARK: - Private Methods

	@objc(sendOnItemClickEvent:)
	private func sendOnItemClickEvent(sender: NSMenuItem) {
		if onItemClick != nil {
			guard let identifier = sender.identifier else {
				preconditionFailure("itemKey not set on Menu Item")
			}
			onItemClick!(["key": identifier])
		}
	}

	@objc(sendOnShowEvent)
	private func sendOnShowEvent() {
		onShow?([:])
	}

	@objc(sendOnDismissEvent)
	private func sendOnDismissEvent() {
		onDismiss?([:])
	}

	private func showContextualMenu() {
		let targetView = bridge?.uiManager.view(forReactTag: target) ?? self
		DispatchQueue.main.async {
			self.menu?.popUp(positioning: nil, at: NSPoint(x: 0, y: targetView.frame.height), in: targetView)
		}
	}
}
