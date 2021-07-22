//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

// MARK: - Button

/// A fluent styled button, with hover effects and a corner radius.
@objc(MSFMenuButton)
open class MenuButton: NSPopUpButton {
  
	open override var menu: NSMenu? {
		didSet {
			updateMenu()
		}
	}
  
  open override var image: NSImage? {
    get {
      return menuButtonImage
    }
    set {
      menuButtonImage = newValue
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
		// Add en ampty imageOnly menu item for the button
		let initialItem = NSMenuItem()
		initialItem.image = image
		initialItem.title = title
		dropDownCell.usesItemFromMenu = false
		dropDownCell.menuItem = initialItem

		menu?.insertItem(initialItem, at: 0)
	}
  
//  private func updateImagePosition() {
//    let hasImage = self.image != nil;
//    let hasTitle = !self.title.isEmpty
//
//    if hasImage {
//      if hasTitle {
//        imagePosition = .imageLeading
//      }
//    }
//  }
  
  // MARK: - Private properties

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

