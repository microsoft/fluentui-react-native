#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation NSDictionary (MSFMenuButtonAdditions)

- (BOOL)containsKey: (NSString *)key {
     BOOL retVal = 0;
     NSArray *allKeys = [self allKeys];
     retVal = [allKeys containsObject:key];
     return retVal;
}

@end

@implementation RCTConvert (MSFMenuButtonAdditions)

+ (NSMenuItem *)menuItem:(id)json
{
  NSMenuItem *menuItem = [[NSMenuItem alloc] init];
  [menuItem setTitle:[RCTConvert NSString:json[@"text"]]];
  [menuItem setEnabled:![RCTConvert BOOL:json[@"disabled"]]];
  
  return menuItem;
}

+ (NSMenu *)menu:(id)json
{
  NSMenu *menu = [[NSMenu alloc] init];
  [menu setAutoenablesItems:NO];
  
  NSArray *menuItems = [RCTConvert NSArray:json];
  for (NSDictionary *menuItemJson in menuItems) {
    NSMenuItem *menuItem = [RCTConvert menuItem:menuItemJson];
    
    if ([menuItemJson containsKey:@"hasSubmenu"])
    {
      bool hasSubmenu = [RCTConvert BOOL:menuItemJson[@"hasSubmenu"]];
      if (hasSubmenu) {
        NSMenu *submenu = [RCTConvert menu:menuItemJson[@"submenuItems"]];
        [menu setSubmenu:submenu forItem:menuItem];
      }
    }
    
    [menu addItem:menuItem];

  }
  
  return menu;
}

@end


@interface RCT_EXTERN_MODULE(MSFMenuButtonManager, RCTViewManager)

RCT_CUSTOM_VIEW_PROPERTY(disabled, bool, NSPopUpButton)
{
  bool disabled = [RCTConvert BOOL:json];
  [view setEnabled:!disabled];
}

RCT_REMAP_VIEW_PROPERTY(content, title, NSString)

RCT_CUSTOM_VIEW_PROPERTY(menuItems, NSMenu, NSPopUpButton)
{
  NSMenu *menu = [RCTConvert menu:json];
  [view setMenu:menu];
}


@end
