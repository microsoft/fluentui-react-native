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
	
	override func viewDidMoveToWindow() {
		if (reactSuperview() != nil) {
			showContextualMenu()
		}
	}
	
	// MARK: - NSMenuDelegate
	
	func menuDidClose(_ menu: NSMenu) {
		sendOnDismissMenuEvent()
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

	@objc(sendOnDismissMenuEvent)
	private func sendOnDismissMenuEvent() {
		onDismiss?([:])
	}
	
	private func createTestMenu() {
		let testmenu = NSMenu(title: "Hello World")
		testmenu.delegate = self
		// Construct menu
		let menuItem1 = NSMenuItem(title: "Item 1", action: nil, keyEquivalent: "")
		let menuItem2 = NSMenuItem(title: "Item 2", action: nil, keyEquivalent: "")
		let menuItem3 = NSMenuItem(title: "Item 3", action: nil, keyEquivalent: "")
		testmenu.addItem(menuItem1)
		testmenu.addItem(menuItem2)
		testmenu.addItem(menuItem3)
		
		for view in subviews {
			let menuItem = NSMenuItem()
//			menuItem.view = NSButton(checkboxWithTitle: "Hello", target: nil, action: nil)
			menuItem.view = view
			menuItem.view?.frame = NSMakeRect(0, 0, 100, 20)
			testmenu.addItem(menuItem)
		}
		menu = testmenu
	}
	
	private func showContextualMenu() {
		createTestMenu()

		DispatchQueue.main.async {
			let view = self.targetView ?? self
			self.menu?.popUp(positioning: nil, at: NSPoint(x: 0, y: view.frame.height), in: view)
		}
	}
	
	// MARK: - Private variables

	private var targetView: NSView?
}


