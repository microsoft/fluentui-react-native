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
      updateMenu()
    }
  }
  
  open override var title: String {
    didSet {
      updateMenu()
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
    
    target = self
    action = #selector(sendCallback)
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
		guard let dropDownCell = cell as? NSPopUpButtonCell else {
			preconditionFailure()
		}
    
    guard let menu = menu else {
      return
    }
    
    for menuItem in menu.items {
      menuItem.target = self
      menuItem.action = #selector(sendCallback)
    }
		// MenuButton needs a MenuItem set on it's cell to display the title and image properly
		let dropdownCellItem = NSMenuItem()
    dropdownCellItem.image = image
    dropdownCellItem.title = title
		dropDownCell.usesItemFromMenu = false
		dropDownCell.menuItem = dropdownCellItem

    //Insert an initial empty item into index 0, since index 0 is never displayed
    if ((menu.item(withTag: -1)) == nil) {
      let initialEmptyItem = NSMenuItem()
      initialEmptyItem.tag = -1
      initialEmptyItem.title = ""
      menu.insertItem(initialEmptyItem, at: 0)
    }

	}
  
  @objc private func sendCallback() {
    NSLog("click!")
    if onPress != nil {
      /// no data to send to JS
      onPress!(nil)
    }
  }
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

