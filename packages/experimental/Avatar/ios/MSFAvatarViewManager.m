#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

#import "MSFAvatarStorage.h"

@import FluentUI;

NS_ASSUME_NONNULL_BEGIN

@implementation RCTConvert (MSFAvatarAdditions)

RCT_ENUM_CONVERTER(MSFAvatarSize, (@{
    @"xSmall": @(MSFAvatarSizeXsmall),
    @"small": @(MSFAvatarSizeSmall),
    @"medium": @(MSFAvatarSizeMedium),
    @"large": @(MSFAvatarSizeLarge),
    @"xLarge": @(MSFAvatarSizeXlarge),
    @"xxLarge": @(MSFAvatarSizeXxlarge),
}), MSFAvatarSizeSmall, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarPresence, (@{
    @"none": @(MSFAvatarPresenceNone),
    @"available": @(MSFAvatarPresenceAvailable),
    @"away": @(MSFAvatarPresenceAway),
    @"blocked": @(MSFAvatarPresenceBlocked),
    @"busy": @(MSFAvatarPresenceBusy),
    @"doNotDisturb": @(MSFAvatarPresenceDoNotDisturb),
    @"offline": @(MSFAvatarPresenceOffline),
    @"unknown": @(MSFAvatarPresenceUnknown),
}), MSFPresenceNone, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarStyle, (@{
    @"default": @(MSFAvatarStyleDefault),
    @"accent": @(MSFAvatarStyleAccent),
    @"group": @(MSFAvatarStyleGroup),
    @"outlined": @(MSFAvatarStyleOutlined),
    @"outlinedPrimary": @(MSFAvatarStyleOutlinedPrimary),
    @"overflow": @(MSFAvatarStyleOverflow),
}), MSFAvatarStyleDefault, integerValue);

@end

@interface RCT_EXTERN_MODULE(MSFAvatarViewManager, RCTViewManager)

RCT_CUSTOM_VIEW_PROPERTY(primaryText, NSString, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    id controller = [storage getHostingController:view];
    if (controller) {
        NSString *primaryText = [RCTConvert NSString:json];
        [[(MSFAvatar *)controller state] setPrimaryText:primaryText];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(secondaryText, NSString, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        NSString *secondaryText = [RCTConvert NSString:json];
        [[controller state] setSecondaryText:secondaryText];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(imageSource, UIImage, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        UIImage *image = [RCTConvert UIImage:json];
        [[controller state] setImage:image];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(ringColor, UIColor, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        UIColor *ringColor = [RCTConvert UIColor:json];
        [[controller state] setRingColor:ringColor];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(foregroundColor, UIColor, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        UIColor *foregroundColor = [RCTConvert UIColor:json];
        [[controller state] setForegroundColor:foregroundColor];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(backgroundColor, UIColor, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        UIColor *backgroundColor = [RCTConvert UIColor:json];
        [[controller state] setBackgroundColor:backgroundColor];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(presence, MSFAvatarPresence, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        MSFAvatarPresence presence = [RCTConvert MSFAvatarPresence:json];
        [[controller state] setPresence:presence];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(isRingVisible, bool, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        bool isRingVisible = [RCTConvert BOOL:json];
        [[controller state] setIsRingVisible:isRingVisible];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(isTransparent, bool, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        bool isTransparent = [RCTConvert BOOL:json];
        [[controller state] setIsTransparent:isTransparent];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(isOutOfOffice, bool, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        bool isOutOfOffice = [RCTConvert BOOL:json];
        [[controller state] setIsOutOfOffice:isOutOfOffice];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(size, MSFAvatarSize, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        MSFAvatarSize size = [RCTConvert MSFAvatarSize:json];
        [controller setSizeWithSize:size];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

RCT_CUSTOM_VIEW_PROPERTY(style, MSFAvatarStyle, UIView)
{
    MSFAvatarStorage *storage = [MSFAvatarStorage sharedInstance];
    MSFAvatar *controller = [storage getHostingController:view];
    if (controller) {
        MSFAvatarStyle style = [RCTConvert MSFAvatarStyle:json];
        [controller setStyleWithStyle:style];
    } else {
        RCTLogError(@"Corresponding UIHostingController not found");
    }
}

@end

NS_ASSUME_NONNULL_END
