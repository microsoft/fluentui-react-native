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

@end

@interface MSFAvatarView(RCTComponent)

@end

@interface RCT_EXTERN_MODULE(MSFAvatarViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(avatarSize, MSFAvatarSize);
RCT_EXPORT_VIEW_PROPERTY(avatarBackgroundColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(customBorderImage, UIImage);
//TODO RCT_EXPORT_VIEW_PROPERTY(style, MSFAvatarSize); 
RCT_EXPORT_VIEW_PROPERTY(borderColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(presence, MSFPresence);
RCT_EXPORT_VIEW_PROPERTY(useOpaquePresenceBorder, bool);
//TODO RCT_EXPORT_VIEW_PROPERTY(NSString, overrideAccessibilityLabel);
RCT_EXPORT_VIEW_PROPERTY(preferredFallbackImageStyle, MSFAvatarFallbackImageStyle);
RCT_EXPORT_VIEW_PROPERTY(hasPointerInteraction, bool);


RCT_CUSTOM_VIEW_PROPERTY(primaryText, NSString, MSFAvatarView)
{
	// TODO Preserve values so we don't nil it out each time
	NSString *primaryText = json ? [RCTConvert NSString:json] : @"";
	[view setupWithPrimaryText:primaryText
				 secondaryText:nil
						 image:nil
					  presence:MSFPresenceUnknown
		 convertTextToInitials:YES];
}

RCT_CUSTOM_VIEW_PROPERTY(secondaryText, NSString, MSFAvatarView)
{
	// TODO Preserve values so we don't nil it out each time
	NSString *secondaryText = json ? [RCTConvert NSString:json] : @"";
	[view setupWithPrimaryText:nil
				 secondaryText:secondaryText
						 image:nil
					  presence:MSFPresenceUnknown
		 convertTextToInitials:YES];
}

RCT_CUSTOM_VIEW_PROPERTY(image, UIImage, MSFAvatarView)
{
	// TODO Preserve values so we don't nil it out each time
	UIImage *image = json ? [RCTConvert UIImage:json] : [UIImage new];
	[view setupWithImage:image presence:MSFPresenceUnknown];
}



@end
