#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation RCTConvert (FRNMenuButtonAdditions)

+ (NSMenuItem *)NSMenuItem:(id)json
{
  NSMenuItem *menuItem = [[NSMenuItem alloc] init];
  [menuItem setTitle:[RCTConvert NSString:json[@"title"]]];
  [menuItem setImage:[RCTConvert UIImage:json[@"image"]]];
  [menuItem setEnabled:[RCTConvert BOOL:json[@"enabled"]]];
  [menuItem setToolTip:[RCTConvert NSString:json[@"tooltip"]]];
  [menuItem setIdentifier:[RCTConvert NSString:json[@"identifier"]]];
  return menuItem;
}

+ (NSMenu *)NSMenu:(id)json
{
  NSMenu *menu = [[NSMenu alloc] init];
  [menu setAutoenablesItems:NO];

  NSArray *menuItems = [RCTConvert NSArray:json];
  for (NSDictionary *menuItemJson in menuItems) {
    NSMenuItem *menuItem = [RCTConvert NSMenuItem:menuItemJson];

    // Recursively parse and assign the submenu to the menu item
    if ([menuItemJson objectForKey:@"hasSubmenu"])
    {
      BOOL hasSubmenu = [RCTConvert BOOL:menuItemJson[@"hasSubmenu"]];
      if (hasSubmenu) {
        NSMenu *submenu = [RCTConvert NSMenu:menuItemJson[@"submenu"]];
        [menu setSubmenu:submenu forItem:menuItem];
      }
    }
    [menu addItem:menuItem];
  }
  return menu;
}

@end


@interface RCT_EXTERN_MODULE(FRNMenuButtonManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(content, title, NSString)

RCT_EXPORT_VIEW_PROPERTY(image, UIImage)

RCT_EXPORT_VIEW_PROPERTY(enabled, BOOL)

RCT_EXPORT_VIEW_PROPERTY(menu, NSMenu)

RCT_EXPORT_VIEW_PROPERTY(onItemClick, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onSubmenuItemClick, RCTBubblingEventBlock)

@end
