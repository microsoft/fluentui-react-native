//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

import AppKit

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
    updateDropDownCell()

    select(nil) // Don't select any menu item by default
  }

  @available(*, unavailable)
  required public init?(coder decoder: NSCoder) {
    preconditionFailure()
  }

  @objc public convenience init() {
    self.init(frame: .zero, pullsDown: true)
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
    dropDownCell.usesItemFromMenu = false
    dropDownCell.imagePosition = .imageLeading
    dropDownCell.arrowPosition = .arrowAtBottom

    // MenuButton needs a MenuItem set on it's cell to display the title and image properly
    let dropdownCellItem = NSMenuItem()
    dropdownCellItem.image = image
    dropdownCellItem.onStateImage = nil
    dropdownCellItem.mixedStateImage = nil
    dropdownCellItem.title = title

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
}
