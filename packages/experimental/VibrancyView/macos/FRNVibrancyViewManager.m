#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation RCTConvert (FRNVibrancyViewAdditions)

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

RCT_ENUM_CONVERTER(NSVisualEffectBlendingMode, (@{
	@"behindWindow": @(NSVisualEffectBlendingModeBehindWindow),
	@"withinWindow": @(NSVisualEffectBlendingModeWithinWindow),
}), NSVisualEffectBlendingModeBehindWindow, integerValue);

RCT_ENUM_CONVERTER(NSVisualEffectState, (@{
	@"followsWindowActiveState": @(NSVisualEffectStateFollowsWindowActiveState),
	@"active": @(NSVisualEffectStateActive),
	@"inactive": @(NSVisualEffectStateInactive),
}), NSVisualEffectStateFollowsWindowActiveState, integerValue);

@end


@interface RCT_EXTERN_MODULE(FRNVibrancyViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(material, NSVisualEffectMaterial)

RCT_EXPORT_VIEW_PROPERTY(blendingMode, NSVisualEffectBlendingMode)

RCT_EXPORT_VIEW_PROPERTY(state, NSVisualEffectState)

@end
