	//
	//  Copyright (c) Microsoft Corporation. All rights reserved.
	//  Licensed under the MIT License.
	//

	import AppKit

	@objc(FRNContextualMenu)
	class ContextualMenu: RCTView {
		
		@objc public weak var bridge: RCTBridge?
		
		@objc public var targetViewTag: NSNumber? {
			didSet {
				targetView = bridge?.uiManager.view(forReactTag: targetViewTag)
			}
		}

		@objc public var OnItemClick: RCTBubblingEventBlock?

		@objc public var OnSubmenuItemClick: RCTBubblingEventBlock?

		open override var menu: NSMenu? {
			didSet {
				updateMenu()
			}
		}

		private init() {
			super.init(frame: .zero)
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
		
//		override func addSubview(_ view: NSView) {
//			super.addSubview(view)
//		}

		// MARK: - Private Methods

		private func updateMenu() {
			guard let menu = menu else {
				return
			}

			for (index, menuItem) in menu.items.enumerated() {
				menuItem.target = self
				menuItem.action = #selector(sendOnItemClickEvent)
				if let submenu = menuItem.submenu {
					//Add actions to one level of submenu items to support the `onSubmenuItemClick` callback
					for subMenuItem in submenu.items {
						subMenuItem.tag = index //store the index of the "super" menuItem for lookup in the action
						subMenuItem.target = self
						subMenuItem.action = #selector(sendOnSubItemClickEvent)
					}
				}
			}
		}

		@objc(sendOnItemClickEvent:)
		private func sendOnItemClickEvent(sender: NSMenuItem) {
			if OnItemClick != nil {
				guard let identifier = sender.identifier else {
					preconditionFailure("itemKey not set on Menu Item")
				}
				OnItemClick!(["key": identifier])
			}
		}

		@objc(sendOnSubItemClickEvent:)
		private func sendOnSubItemClickEvent(sender: NSMenuItem) {
			if OnSubmenuItemClick != nil {
				guard let identifier = sender.identifier else {
					preconditionFailure("itemKey not set on Menu Item")
				}
				OnSubmenuItemClick!(["index": sender.tag,"key": identifier])
			}
		}
		
		private func createTestMenu() {
			let testmenu = NSMenu(title: "Hello World")
			// Construct menu
			let menuItem1 = NSMenuItem(title: "Item 1", action: nil, keyEquivalent: "")
			let menuItem2 = NSMenuItem(title: "Item 2", action: nil, keyEquivalent: "")
			let menuItem3 = NSMenuItem(title: "Item 3", action: nil, keyEquivalent: "")
			testmenu.addItem(menuItem1)
			testmenu.addItem(menuItem2)
			testmenu.addItem(menuItem3)
			
			for view in subviews {
				let menuItem = NSMenuItem()
//				menuItem.view = NSButton(checkboxWithTitle: "Hello", target: nil, action: nil)
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
