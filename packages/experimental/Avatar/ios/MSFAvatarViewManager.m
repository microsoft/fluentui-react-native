#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

@implementation RCTConvert (MSFAvatarViewAdditions)

RCT_ENUM_CONVERTER(MSFAvatarLegacySize, (@{
	@"xSmall": @(MSFAvatarLegacySizeExtraSmall),
	@"small": @(MSFAvatarLegacySizeSmall),
	@"medium": @(MSFAvatarLegacySizeMedium),
	@"large": @(MSFAvatarLegacySizeLarge),
	@"xLarge": @(MSFAvatarLegacySizeExtraLarge),
	@"xxLarge": @(MSFAvatarLegacySizeExtraExtraLarge),
}), MSFAvatarLegacySizeSmall, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarLegacyStyle, (@{
	@"circle": @(MSFAvatarLegacyStyleCircle),
	@"square": @(MSFAvatarLegacyStyleSquare),
}), MSFAvatarLegacyStyleCircle, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarLegacyFallbackImageStyle, (@{
	@"onAccentFilled": @(MSFAvatarLegacyFallbackImageStyleOnAccentFilled),
    @"outlined": @(MSFAvatarLegacyFallbackImageStyleOutlined),
	@"primaryFilled": @(MSFAvatarLegacyFallbackImageStylePrimaryFilled),
	@"primaryOutlined": @(MSFAvatarLegacyFallbackImageStylePrimaryOutlined),
}), MSFAvatarLegacyFallbackImageStyleOutlined, integerValue);

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
    // [RCTConvert UIImage:] throws an error if we pass it a nil value, so do an extra check
    UIImage *image = (![json[@"image"] isEqual:[NSNull null]]) ?  [RCTConvert UIImage:json[@"image"]] : nil;
    
	return [[MSFAvatarData alloc]initWithPrimaryText:[RCTConvert NSString:json[@"primaryText"]]
                                     secondaryText:[RCTConvert NSString:json[@"secondaryText"]]
                                             image:image
                                          presence:[RCTConvert MSFPresence:json[@"presence"]]
                                             color:[RCTConvert UIColor:json[@"color"]]];
}

@end

@interface RCT_EXTERN_MODULE(MSFAvatarViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(size, avatarSize, MSFAvatarLegacySize);
RCT_REMAP_VIEW_PROPERTY(backgroundColor, avatarBackgroundColor, UIColor);

RCT_REMAP_VIEW_PROPERTY(customBorderImageSource, customBorderImage, UIImage);

RCT_REMAP_VIEW_PROPERTY(avatarStyle, style, MSFAvatarLegacyStyle)

RCT_EXPORT_VIEW_PROPERTY(borderColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(presence, MSFPresence);
RCT_EXPORT_VIEW_PROPERTY(useOpaquePresenceBorder, bool);

RCT_REMAP_VIEW_PROPERTY(accessibilityLabel, overrideAccessibilityLabel, NSString);

RCT_EXPORT_VIEW_PROPERTY(preferredFallbackImageStyle, MSFAvatarLegacyFallbackImageStyle);

RCT_REMAP_VIEW_PROPERTY(hasPointerInteractionIOS, hasPointerInteraction, bool)

RCT_CUSTOM_VIEW_PROPERTY(avatarData, MSFAvatarData, MSFAvatarLegacyView)
{
	MSFAvatarData *avatarData = [RCTConvert MSFAvatarData:json];
	[view setupWithAvatar:avatarData];
}

@end
