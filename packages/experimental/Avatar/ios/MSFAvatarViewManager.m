#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;


@interface RCT_EXTERN_MODULE(MSFAvatarViewManager, RCTViewManager)


//RCT_REMAP_VIEW_PROPERTY(size, avatarSize, MSFAvatarLegacySize);
//RCT_REMAP_VIEW_PROPERTY(backgroundColor, avatarBackgroundColor, UIColor);
//
//RCT_REMAP_VIEW_PROPERTY(customBorderImageSource, customBorderImage, UIImage);
//
//RCT_REMAP_VIEW_PROPERTY(avatarStyle, style, MSFAvatarLegacyStyle)
//
//RCT_EXPORT_VIEW_PROPERTY(borderColor, UIColor);
//RCT_EXPORT_VIEW_PROPERTY(presence, MSFPresence);
//RCT_EXPORT_VIEW_PROPERTY(useOpaquePresenceBorder, bool);
//
//RCT_REMAP_VIEW_PROPERTY(accessibilityLabel, overrideAccessibilityLabel, NSString);
//
//RCT_EXPORT_VIEW_PROPERTY(preferredFallbackImageStyle, MSFAvatarLegacyFallbackImageStyle);
//
//RCT_REMAP_VIEW_PROPERTY(hasPointerInteractionIOS, hasPointerInteraction, bool)
//
//RCT_CUSTOM_VIEW_PROPERTY(avatarData, MSFAvatarData, MSFAvatarLegacyView)
//{
//	MSFAvatarData *avatarData = [RCTConvert MSFAvatarData:json];
//	[view setupWithAvatar:avatarData];
//}

//RCT_EXPORT_VIEW_PROPERTY(primaryText, NSString);

RCT_CUSTOM_VIEW_PROPERTY(primaryText, NSString, MSFAvatar)
{
	NSLog(@"%@", json);
	[[MSFAvatarViewManager controllerMap] objectForKey:[self uniqueID]]
//	// [RCTConvert UIImage:] throws an error if we pass it a nil value, so do an extra check
//	UIImage *image = (![json[@"image"] isEqual:[NSNull null]]) ?  [RCTConvert UIImage:json[@"image"]] : nil;
//	view.state.image = image;
}

@end


@implementation MSFAvatarViewManagerStorage

<#methods#>

@end
