	//
	//  Copyright (c) Microsoft Corporation. All rights reserved.
	//  Licensed under the MIT License.
	//

	import AppKit

	@objc(FRNContextualMenu)
	class ContextualMenu: RCTView {
		
//		override var frame: NSRect
//		{
//			get {
//				return .zero
//			}
//			set {
//				//no op
//			}
//		}
		
		@objc public var targetViewTag: NSNumber = 0 {
			didSet {
				print(targetViewTag)
				targetView = bridge?.uiManager.view(forReactTag: targetViewTag)
				
			}
		}
		
		@objc public weak var bridge: RCTBridge?

		override func viewDidMoveToWindow() {
			if (reactSuperview() != nil) {
				showContextualMenu()
			}
		}
		
		override func draw(_ dirtyRect: NSRect) {
			showContextualMenu()
		}
		
		private init() {
			super.init(frame: .zero)
//			translatesAutoresizingMaskIntoConstraints = false
		}

		required init?(coder: NSCoder) {
			preconditionFailure()
		}
		
		convenience init(bridge: RCTBridge) {
			self.init()
			self.bridge = bridge
		}

		@objc public var OnItemClick: RCTBubblingEventBlock?

		@objc public var OnSubmenuItemClick: RCTBubblingEventBlock?

		open override var menu: NSMenu? {
			didSet {
				updateMenu()
			}
		}

		// MARK: RCTComponent Overrides
		
		override func insertReactSubview(_ subview: NSView!, at atIndex: Int) {
			// Do not want to call super (despite NS_REQUIRES_SUPER on base class) since this will cause the ContextualMenu's children to appear within the main component.
			// Instead we want to add the react subviews to the proxy callout view which is in its own ContextualMenu.
			proxyView.insertReactSubview(subview, at: atIndex)
			proxyView.insertSubview(subview, at: atIndex)

		}
		
		override func reactSetFrame(_ frame: CGRect) {
			super.reactSetFrame(.zero)
			self.frame = .zero
		}
		
		// MARK: - Private variables

		private var targetView: NSView?

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

			// Insert an initial empty item into index 0, since index 0 is never displayed.
			// We must do this after we assign the tags to the submenuItems to preserve index order.
			let initialEmptyItem = NSMenuItem()
			menu.insertItem(initialEmptyItem, at: 0)
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
			// Construct menu
			let menuItem1 = NSMenuItem(title: "Item 1", action: nil, keyEquivalent: "")
			let menuItem2 = NSMenuItem(title: "Item 2", action: nil, keyEquivalent: "")
			let menuItem3 = NSMenuItem(title: "Item 3", action: nil, keyEquivalent: "")
			let testmenu = NSMenu(title: "Hello World")
			testmenu.addItem(menuItem1)
			testmenu.addItem(menuItem2)
			testmenu.addItem(menuItem3)
			menu = testmenu
		}
		
		private func showContextualMenu() {
			createTestMenu()

			DispatchQueue.main.async {
				let view = self.targetView ?? self
				self.menu?.popUp(positioning: nil, at: NSPoint(x: 0, y: view.frame.height), in: view)
				//			if let menu = menu {
				//				NSMenu.popUpContextMenu(menu, with: NSEvent(), for: self)
				//			}
			}
		}
		
		//MARK: - Private Variables
		
		private var proxyView: RCTView = RCTView()
	}
