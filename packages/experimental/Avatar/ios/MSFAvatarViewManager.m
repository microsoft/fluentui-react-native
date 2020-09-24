#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

@implementation RCTConvert (MSFAvatarSize)

RCT_ENUM_CONVERTER(MSFAvatarSize, (@{
	@"xSmall": @(MSFAvatarSizeExtraSmall),
	@"small": @(MSFAvatarSizeSmall),
	@"medium": @(MSFAvatarSizeMedium),
	@"large": @(MSFAvatarSizeLarge),
	@"xLarge": @(MSFAvatarSizeExtraLarge),
	@"xxLarge": @(MSFAvatarSizeExtraExtraLarge),
}), MSFAvatarSizeSmall, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarStyle, (@{
	@"circle": @(MSFAvatarStyleCircle),
	@"square": @(MSFAvatarStyleSquare),
}), MSFAvatarStyleCircle, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarFallbackImageStyle, (@{
	@"onAccentFilled": @(MSFAvatarFallbackImageStyleOnAccentFilled),
	@"outlined": @(MSFAvatarFallbackImageStyleOutlined),
	@"primaryFilled": @(MSFAvatarFallbackImageStylePrimaryFilled),
	@"primaryOutlined": @(MSFAvatarFallbackImageStylePrimaryOutlined),
}), MSFAvatarFallbackImageStyleOutlined, integerValue);

RCT_ENUM_CONVERTER(MSFPresence, (@{
	@"none": @(MSFPresenceNone),
	@"available": @(MSFPresenceAvailable),
	@"away": @(MSFPresenceAway),
	@"busy": @(MSFPresenceBusy),
	@"doNotDisturb": @(MSFPresenceDoNotDisturb),
	@"outOfOffice": @(MSFPresenceOutOfOffice),
	@"offline": @(MSFPresenceOffline),
	@"unknown": @(MSFPresenceUnknown),
	@"blocked": @(MSFPresenceBlocked),
}), MSFPresenceNone, integerValue);

+ (MSFAvatarData *)MSFAvatarData:(id)json
{
	return [[MSFAvatarData alloc]initWithPrimaryText:[RCTConvert NSString:json[@"primaryText"]]
									   secondaryText:[RCTConvert NSString:json[@"secondaryText"]]
												image:[RCTConvert UIImage:json[@"image"]]
											presence:[RCTConvert MSFPresence:json[@"presence"]]
											   color:[RCTConvert UIColor:json[@"color"]]];
}

@end

@interface MSFAvatarView(RCTComponent)

@end

@interface RCT_EXTERN_MODULE(MSFAvatarViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(avatarSize, MSFAvatarSize);
RCT_EXPORT_VIEW_PROPERTY(avatarBackgroundColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(customBorderImage, UIImage);

RCT_REMAP_VIEW_PROPERTY(avatarStyle, style, MSFAvatarStyle)

RCT_EXPORT_VIEW_PROPERTY(borderColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(presence, MSFPresence);
RCT_EXPORT_VIEW_PROPERTY(useOpaquePresenceBorder, bool);

//TODO Remap this
// RCT_EXPORT_VIEW_PROPERTY(NSString, overrideAccessibilityLabel);

RCT_EXPORT_VIEW_PROPERTY(preferredFallbackImageStyle, MSFAvatarFallbackImageStyle);
RCT_EXPORT_VIEW_PROPERTY(hasPointerInteraction, bool);

RCT_CUSTOM_VIEW_PROPERTY(avatarData, MSFAvatarData, MSFAvatarView)
{
	MSFAvatarData *avatarData = [RCTConvert MSFAvatarData:json];
	[view setupWithAvatar:avatarData];
}

@end
