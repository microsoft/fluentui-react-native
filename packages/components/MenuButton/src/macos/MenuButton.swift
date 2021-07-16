//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

// MARK: - Button

/// A fluent styled button, with hover effects and a corner radius.
@objc(MSFMenuButton)
open class MenuButton: NSPopUpButton {

	public var menuItems: [NSMenuItem] {
		didSet {
			updateMenu()

		}
	}

	open override var menu: NSMenu? {
		didSet {
			updateMenu()
		}
	}

	public override init(frame buttonFrame: NSRect, pullsDown flag: Bool) {

		menuItems = []

		super.init(frame: buttonFrame, pullsDown: flag)

		imagePosition = .imageOnly
		pullsDown = true
		bezelStyle = .recessed
		if #available(OSX 11.0, *) {
			controlSize = .large
		}

		guard let dropDownCell = cell as? NSPopUpButtonCell else {
			preconditionFailure()
		}
		dropDownCell.arrowPosition = .arrowAtBottom
		dropDownCell.usesItemFromMenu = false

		select(nil) // Don't select any menu item by default

//		menu = createMenu()
	}

	@available(*, unavailable)
	required public init?(coder decoder: NSCoder) {
		preconditionFailure()
	}

	@objc public convenience init() {
		self.init(frame: .zero, pullsDown: true)
	}

	// MARK: - Public Properties

	open override var image: NSImage? {
		get {
			return menuButtonImage
		}
		set {
			menuButtonImage = newValue
		}
	}

	// MARK: - Private Methods

	private func createMenu() -> NSMenu {
		let menu = NSMenu(title: "Test Menu")

		let placeholderMenuItem = NSMenuItem()
		placeholderMenuItem.title = "Placeholder"
		menu.addItem(placeholderMenuItem)

		let firstMenuItem = NSMenuItem()
		firstMenuItem.title = "First"
		menu.addItem(firstMenuItem)

		let secondMenuItem = NSMenuItem()
		secondMenuItem.title = "Second"
		menu.addItem(secondMenuItem)
		secondMenuItem.state = .on

		let thirdMenuItem = NSMenuItem()
		thirdMenuItem.title = "Third"
		thirdMenuItem.image = NSImage(named: NSImage.refreshTemplateName)
		let image = NSImage(named: NSImage.refreshTemplateName)?.image(with: .controlAccentColor)
		thirdMenuItem.image = image
		menu.addItem(thirdMenuItem)

		let submenu = createSubMenu()
		menu.setSubmenu(submenu, for: thirdMenuItem)

		let fourthMenuItem = NSMenuItem()
		let view = NSView()
		view.wantsLayer = true
		view.layer?.backgroundColor = NSColor.systemRed.cgColor
		view.frame = NSMakeRect(0, 0, 350, 50)
		fourthMenuItem.view = view
		menu.addItem(fourthMenuItem)

		let submenu2 = createSubMenu()
		menu.setSubmenu(submenu2, for: fourthMenuItem)

		let fifthMenuItem = NSMenuItem()
		fifthMenuItem.title = "Fifth"
		fifthMenuItem.image = NSImage(named: NSImage.refreshTemplateName)
		let fifthMenuItemImage = NSImage(named: NSImage.refreshTemplateName)?.image(with: .controlAccentColor)
		fifthMenuItem.image = fifthMenuItemImage
		menu.addItem(fifthMenuItem)

		return menu
	}

	private func createSubMenu() -> NSMenu {
		let submenu = NSMenu(title: "Test Menu")

		submenu.addItem(withTitle: "Item", action: nil, keyEquivalent: "")
		submenu.addItem(withTitle: "Item", action: nil, keyEquivalent: "")
		submenu.addItem(withTitle: "Item", action: nil, keyEquivalent: "")

		return submenu
	}

	private func updateMenu() {
//		menu = NSMenu()

		guard let dropDownCell = cell as? NSPopUpButtonCell else {
			preconditionFailure()
		}
		// Add en ampty imageOnly menu item for the button
		let initialItem = NSMenuItem()
		initialItem.image = image
		initialItem.title = ""
		dropDownCell.usesItemFromMenu = false
		dropDownCell.menuItem = initialItem

//		menu?.addItem(initialItem)
		menu?.insertItem(initialItem, at: 0)


//		for menuItem in menuItems {
//			menu?.addItem(menuItem)
//		}
	}

	private var menuButtonImage: NSImage? {
		didSet {
			guard let image = menuButtonImage else {
				return
			}

			guard let dropDownCell = cell as? NSPopUpButtonCell else {
				preconditionFailure()
			}

			let item = NSMenuItem()
			item.image = image
			item.title = ""
			dropDownCell.usesItemFromMenu = false
			dropDownCell.menuItem = item
		}
	};


}



extension NSImage {
	func image(with tintColor: NSColor) -> NSImage {
		if self.isTemplate == false {
			return self
		}

		let image = self.copy() as! NSImage
		image.lockFocus()

		tintColor.set()

		let imageRect = NSRect(origin: .zero, size: image.size)
		imageRect.fill(using: .sourceIn)

		image.unlockFocus()
		image.isTemplate = false

		return image
	}
}

