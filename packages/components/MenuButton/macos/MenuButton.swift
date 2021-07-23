//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

// MARK: - Button

/// A fluent styled button, with hover effects and a corner radius.
@objc(MSFMenuButton)
open class MenuButton: NSPopUpButton {
  
  @objc public var onPress: RCTBubblingEventBlock?
  
	open override var menu: NSMenu? {
		didSet {
			updateMenu()
		}
	}
  
  open override var image: NSImage? {
    didSet {
      updateDropDownCell()
    }
  }
  
  open override var title: String {
    didSet {
      updateDropDownCell()
    }
  }

	public override init(frame buttonFrame: NSRect, pullsDown flag: Bool) {

		super.init(frame: buttonFrame, pullsDown: flag)

    imagePosition = .imageLeading
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
	}

	@available(*, unavailable)
	required public init?(coder decoder: NSCoder) {
		preconditionFailure()
	}

	@objc public convenience init() {
		self.init(frame: .zero, pullsDown: true)
	}

	// MARK: - Public Properties


	// MARK: - Private Methods

	private func updateMenu() {
    guard let menu = menu else {
      return
    }

    // Insert an initial empty item into index 0, since index 0 is never displayed
    let initialEmptyItem = NSMenuItem()
    menu.insertItem(initialEmptyItem, at: 0)
    
    for (index, menuItem) in menu.items.enumerated() {
      menuItem.tag = index
      menuItem.target = self
      menuItem.action = #selector(sendCallback)
    }
	}
  
  private func updateDropDownCell() {
    guard let dropDownCell = cell as? NSPopUpButtonCell else {
      preconditionFailure()
    }
    
    // MenuButton needs a MenuItem set on it's cell to display the title and image properly
    let dropdownCellItem = NSMenuItem()
    dropdownCellItem.image = image
    dropdownCellItem.title = title
    dropDownCell.usesItemFromMenu = false
    dropDownCell.menuItem = dropdownCellItem
  }
  
  @objc(sendCallback:)
  private func sendCallback(sender: NSMenuItem) {
    NSLog("click!")
    if onPress != nil {
      onPress!(["key": sender.tag])
    }
  }
}

@objc(MSFMenuButtonItem)
extension class MenuButtonItem: NSMenuItem {
 
  
}
