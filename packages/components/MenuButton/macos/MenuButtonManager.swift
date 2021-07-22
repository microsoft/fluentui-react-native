import Foundation

struct ContextualMenuPropStruct: Codable {
  var itemKey: String
  var  text: String
  var icon: String?
  var hasSubmenu: BooleanLiteralType?
  var submenuItems: [ContextualMenuPropStruct]?
}

let testJson = """
    [
      {
        "itemKey": "1",
        "text": "MenuItem 1",
        "icon": "testImage",
      },
      {
        "itemKey": "2",
        "text": "MenuItem 2",
        "icon": "testImage",
      },
      {
        "itemKey": "3",
        "text": "MenuItem 3",
        "icon": "testImage",
        "hasSubmenu": true,
        "submenuItems": [
          {
            "itemKey": "1",
            "text": "MenuItem 1",
            "icon": "testImage",
          },
          {
            "itemKey": "2",
            "text": "MenuItem 2",
            "icon": "testImage",
          }
        ]
      }
    ]
    """

func createMenuFromJson(json: String) -> NSMenu {
  let menu = NSMenu()
  
  let data = json.data(using: .utf8)!
  do {
    let response = try JSONDecoder().decode([ContextualMenuPropStruct].self, from: data)
    let menuItems = parseDecodedJsonIntoMenuItems(decodedData: response, menu: menu)
    menu.items = menuItems
    
  } catch {
    print(error)
    preconditionFailure("Could not decode ContextualMenuItemProps json")
  }
  return menu
}

func parseDecodedJsonIntoMenuItems(decodedData: [ContextualMenuPropStruct], menu: NSMenu) -> [NSMenuItem] {
  var menuItems: [NSMenuItem] = []
  for item in decodedData {
    let menuItem = NSMenuItem()
    menuItem.title = item.text
    menuItems.append(menuItem)
    if item.hasSubmenu ?? false {
      guard let subMenuItemsStruct = item.submenuItems else {
        preconditionFailure()
      }
      let submenu = NSMenu()
      let submenuItems = parseDecodedJsonIntoMenuItems(decodedData: subMenuItemsStruct, menu: menu)
      submenu.items = submenuItems
      menu.setSubmenu(submenu, for: menuItem)
    }
  }
  return menuItems
}


@objc(MSFMenuButtonManager)
class MenuButtonManager: RCTViewManager {
  override func view()->NSView! {
    let menuButton = MenuButton()
    
//    let image = NSImage(named: NSImage.iconViewTemplateName)!
//    image.size = CGSize(width: 15, height: 15)
//    menuButton.image = image
    
    return menuButton
  }

  override class func requiresMainQueueSetup() -> Bool {
    return true
  }

  @objc(createMenuFromJson:)
  func createMenuFromJson(json: String) -> NSMenu {
    let menu = NSMenu()
    
    let data = json.data(using: .utf8)!
    do {
      let response = try JSONDecoder().decode([ContextualMenuPropStruct].self, from: data)
      let menuItems = parseDecodedJsonIntoMenuItems(decodedData: response, menu: menu)
      menu.items = menuItems
      
    } catch {
      print(error)
      preconditionFailure("Could not decode ContextualMenuItemProps json")
    }
    
    return menu
  }

  func parseDecodedJsonIntoMenuItems(decodedData: [ContextualMenuPropStruct], menu: NSMenu) -> [NSMenuItem] {
    var menuItems: [NSMenuItem] = []
    for item in decodedData {
      let menuItem = NSMenuItem()
      menuItem.title = item.text
      menuItems.append(menuItem)
      if item.hasSubmenu ?? false {
        guard let subMenuItemsStruct = item.submenuItems else {
          preconditionFailure()
        }
        let submenu = NSMenu()
        let submenuItems = parseDecodedJsonIntoMenuItems(decodedData: subMenuItemsStruct, menu: menu)
        submenu.items = submenuItems
        menu.setSubmenu(submenu, for: menuItem)
      }
    }
    return menuItems
  }
}
