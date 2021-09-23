//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

@objc(FRNContextualMenu)
class ContextualMenu: RCTView {
	
	override class var defaultMenu: NSMenu? {
		let menuItem1 = NSMenuItem(title: "Item 1", action: nil, keyEquivalent: "")
		let menu = NSMenu(title: "Hello World")
		menu.addItem(menuItem1)
		return menu
	}

	@objc public weak var bridge: RCTBridge?
	
	@objc public var showMenu: Bool = false

	override func viewDidMoveToWindow() {
		if showMenu {
			if showMenu {
				let menuItem1 = NSMenuItem(title: "Item 1", action: nil, keyEquivalent: "")
				let menuItem2 = NSMenuItem(title: "Item 2", action: nil, keyEquivalent: "")
				let menuItem3 = NSMenuItem(title: "Item 3", action: nil, keyEquivalent: "")
				let menu = NSMenu(title: "Hello World")
				menu.addItem(menuItem1)
				menu.addItem(menuItem2)
				menu.addItem(menuItem3)
//				NSMenu.popUpContextMenu(menu, with: NSEvent(), for: self)
				menu.popUp(positioning: nil, at: NSPoint(x: 0, y: self.frame.height), in: self)
			}
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

  @objc public var OnItemClick: RCTBubblingEventBlock?

  @objc public var OnSubmenuItemClick: RCTBubblingEventBlock?

  open override var menu: NSMenu? {
    didSet {
      updateMenu()
    }
  }

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
}
