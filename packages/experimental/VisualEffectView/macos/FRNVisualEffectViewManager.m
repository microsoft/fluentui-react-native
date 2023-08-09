#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation RCTConvert (FRNVisualEffectViewAdditions)

RCT_ENUM_CONVERTER(NSVisualEffectMaterial, (@{
	@"titlebar": @(NSVisualEffectMaterialTitlebar),
	@"selection": @(NSVisualEffectMaterialSelection),
	@"menu": @(NSVisualEffectMaterialMenu),
	@"popover": @(NSVisualEffectMaterialPopover),
	@"sidebar": @(NSVisualEffectMaterialSidebar),
	@"headerview": @(NSVisualEffectMaterialHeaderView),
	@"sheet": @(NSVisualEffectMaterialSheet),
	@"windowbackground": @(NSVisualEffectMaterialWindowBackground),
	@"hudWindow": @(NSVisualEffectMaterialHUDWindow),
	@"fullScreenUI": @(NSVisualEffectMaterialFullScreenUI),
	@"toolTip": @(NSVisualEffectMaterialToolTip),
	@"contentBackground": @(NSVisualEffectMaterialContentBackground),
	@"underWindowBackground": @(NSVisualEffectMaterialUnderWindowBackground),
	@"underPageBackground": @(NSVisualEffectMaterialUnderPageBackground),
}), NSVisualEffectMaterialMenu, integerValue);

@end


@interface RCT_EXTERN_MODULE(FRNVisualEffectViewManager, RCTViewManager)


RCT_CUSTOM_VIEW_PROPERTY(material, NSString, NSView)
{
  NSVisualEffectMaterial material = [RCTConvert NSVisualEffectMaterial:json];
  [(NSVisualEffectView *)[[view subviews] firstObject] setMaterial:material];
}

RCT_CUSTOM_VIEW_PROPERTY(behindWindow, BOOL, NSView)
{
  BOOL behindWindow = [RCTConvert BOOL:json];
  if (behindWindow) {
	[(NSVisualEffectView *)[[view subviews] firstObject] setBlendingMode:NSVisualEffectBlendingModeBehindWindow];
  } else {
	[(NSVisualEffectView *)[[view subviews] firstObject] setBlendingMode:NSVisualEffectBlendingModeWithinWindow];
  }
}

@end
