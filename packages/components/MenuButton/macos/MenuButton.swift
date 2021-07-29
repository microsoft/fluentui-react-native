//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

@objc(MSFMenuButton)
open class MenuButton: NSPopUpButton {

  public override init(frame buttonFrame: NSRect, pullsDown flag: Bool) {

    super.init(frame: buttonFrame, pullsDown: flag)

    imagePosition = .imageLeading
    bezelStyle = .recessed

    if #available(OSX 11.0, *) {
      controlSize = .large
    }

    guard let dropDownCell = cell as? NSPopUpButtonCell else {
      preconditionFailure()
    }
    dropDownCell.imagePosition = .imageLeading
    dropDownCell.arrowPosition = .arrowAtBottom
  }

  @available(*, unavailable)
  required public init?(coder decoder: NSCoder) {
    preconditionFailure()
  }

  @objc public convenience init() {
    self.init(frame: .zero, pullsDown: true)
  }

  @objc public var onPress: RCTBubblingEventBlock?

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
      // We must set the image on the dropdown cell rather than the button,
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
   if onPress != nil {
     guard let identifier = sender.identifier else {
       preconditionFailure("itemKey not set on Menu Item")
     }
     onPress!(["key": identifier])
   }
  }

  private var menuButtonImage: NSImage? {
    didSet {
      updateDropDownCell()
    }
  };
}
