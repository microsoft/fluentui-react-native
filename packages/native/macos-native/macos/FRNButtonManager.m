#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation RCTConvert (FRNButtonAdditions)

+ (NSBezelStyle)NSBezelStyle:(id)json
{
  static NSDictionary *mapping;
  static dispatch_once_t onceToken;
  dispatch_once(&onceToken, ^{
    NSMutableDictionary *styles = [NSMutableDictionary dictionaryWithDictionary:@{
      @"rounded": @(NSBezelStyleRounded),
      @"regularSquare": @(NSBezelStyleRegularSquare),
      @"texturedRounded": @(NSBezelStyleTexturedRounded),
      @"texturedSquare": @(NSBezelStyleTexturedSquare),
      @"shadowlessSquare": @(NSBezelStyleShadowlessSquare),
      @"circular": @(NSBezelStyleCircular),
      @"help": @(NSBezelStyleHelpButton),
      @"smallSquare": @(NSBezelStyleSmallSquare),
      @"roundRect": @(NSBezelStyleRoundRect),
      @"recessed": @(NSBezelStyleRecessed),
      @"roundedDisclosure": @(NSBezelStyleRoundedDisclosure),
      @"inline": @(NSBezelStyleInline),
    }];
    // NSBezelStyleGlass was introduced in macOS 26 (Tahoe). Guard so this still
    // builds/runs against older SDKs and deployment targets.
    if (@available(macOS 26.0, *)) {
      styles[@"glass"] = @(NSBezelStyleGlass);
    }
    mapping = styles;
  });
  return (NSBezelStyle)[RCTConvert NSInteger:mapping[json] ?: @(NSBezelStyleRounded)];
}

@end

@interface RCT_EXTERN_MODULE(FRNButtonManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(title, title, NSString)
RCT_EXPORT_VIEW_PROPERTY(bezelStyle, NSBezelStyle)
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSButton) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(tooltip, toolTip, NSString)
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock)

@end
