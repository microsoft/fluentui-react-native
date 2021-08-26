//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

@objc(FRNMenuButton)
class MenuButton: NSPopUpButton {

  public override init(frame buttonFrame: NSRect, pullsDown flag: Bool) {

    super.init(frame: buttonFrame, pullsDown: flag)

    imagePosition = .imageLeading
    bezelStyle = .regularSquare

    updateDropDownCell()
}

  @available(*, unavailable)
  required public init?(coder decoder: NSCoder) {
    preconditionFailure()
  }

  @objc public convenience init() {
    self.init(frame: .zero, pullsDown: true)
    translatesAutoresizingMaskIntoConstraints = false
  }

  @objc public var OnItemClick: RCTBubblingEventBlock?

  @objc public var OnSubmenuItemClick: RCTBubblingEventBlock?

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
      // We must set the image on the dropdown cell rather than the button.
      // If we set the image on Button itself, no image is displayed.
      menuButtonImage = newValue
      updateDropDownCell()
    }
  }

  open override var title: String {
    didSet {
      updateDropDownCell()
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

  private func updateDropDownCell() {
	guard let dropDownCell = cell as? NSPopUpButtonCell else {
	  preconditionFailure()
	}

	dropDownCell.imagePosition = .imageLeading
	dropDownCell.arrowPosition = .arrowAtBottom

    // MenuButton needs a MenuItem set on its cell to display the title and image properly
    let dropdownCellItem = NSMenuItem()
    dropdownCellItem.image = image
    dropdownCellItem.title = title
    dropDownCell.usesItemFromMenu = false

    dropDownCell.menuItem = dropdownCellItem
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

  private var menuButtonImage: NSImage? {
    didSet {
      updateDropDownCell()
    }
  };
}
