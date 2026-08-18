import AppKit
#if USE_REACT_AS_MODULE
import React
#endif // USE_REACT_AS_MODULE

@objc(FRNPopUpButton)
class FRNPopUpButton: NSPopUpButton {

  @objc public var onChange: RCTBubblingEventBlock?

  public override init(frame buttonFrame: NSRect, pullsDown flag: Bool) {
    super.init(frame: buttonFrame, pullsDown: flag)
  }

  @available(*, unavailable)
  required init?(coder decoder: NSCoder) {
    preconditionFailure("init(coder:) has not been implemented")
  }

  @objc public convenience init() {
    self.init(frame: .zero, pullsDown: false)
    target = self
    action = #selector(sendChangeEvent)
  }

  // Rebuilds the native menu any time the JS-provided `items` array changes. Selection is
  // preserved (clamped) across rebuilds since RN may re-set this prop on every render.
  @objc public func setItems(_ items: NSArray) {
    let previousSelectedIndex = indexOfSelectedItem
    removeAllItems()
    for entry in items {
      guard let item = entry as? NSDictionary else {
        continue
      }
      let title = (item["title"] as? String) ?? ""
      addItem(withTitle: title)
      if let menuItem = self.item(withTitle: title) {
        menuItem.identifier = NSUserInterfaceItemIdentifier((item["identifier"] as? String) ?? title)
        menuItem.isEnabled = (item["enabled"] as? Bool) ?? true
      }
    }
    if previousSelectedIndex >= 0 && previousSelectedIndex < items.count {
      selectItem(at: previousSelectedIndex)
    }
  }

  @objc(sendChangeEvent:)
  private func sendChangeEvent(sender: NSPopUpButton) {
    let index = indexOfSelectedItem
    let identifier = selectedItem?.identifier?.rawValue ?? ""
    onChange?(["selectedIndex": index, "identifier": identifier])
  }
}
