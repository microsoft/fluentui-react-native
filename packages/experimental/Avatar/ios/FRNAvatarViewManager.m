#import <React/RCTViewManager.h>

@import FluentUI;

NS_ASSUME_NONNULL_BEGIN

@implementation RCTConvert (FRNAvatarAdditions)

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
}), MSFAvatarPresenceNone, integerValue);

RCT_ENUM_CONVERTER(MSFAvatarStyle, (@{
    @"default": @(MSFAvatarStyleDefault),
    @"accent": @(MSFAvatarStyleAccent),
    @"group": @(MSFAvatarStyleGroup),
    @"outlined": @(MSFAvatarStyleOutlined),
    @"outlinedPrimary": @(MSFAvatarStyleOutlinedPrimary),
    @"overflow": @(MSFAvatarStyleOverflow),
}), MSFAvatarStyleDefault, integerValue);

@end

@interface RCT_EXTERN_MODULE(FRNAvatarViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(primaryText, state.primaryText, NSString)

RCT_REMAP_VIEW_PROPERTY(secondaryText, state.secondaryText, NSString)

RCT_REMAP_VIEW_PROPERTY(imageSource, state.image, UIImage)

RCT_REMAP_VIEW_PROPERTY(ringColor, state.ringColor, UIColor)

RCT_REMAP_VIEW_PROPERTY(foregroundColor, state.foregroundColor, UIColor)

RCT_REMAP_VIEW_PROPERTY(backgroundColor, state.backgroundColor, UIColor)

RCT_REMAP_VIEW_PROPERTY(presence, state.presence, MSFAvatarPresence)

RCT_REMAP_VIEW_PROPERTY(isRingVisible, state.isRingVisible, BOOL)

RCT_REMAP_VIEW_PROPERTY(isTransparent, state.isTransparent, BOOL)

RCT_REMAP_VIEW_PROPERTY(isOutOfOffice, state.isOutOfOffice, BOOL)

RCT_REMAP_VIEW_PROPERTY(size, state.size, MSFAvatarSize)

RCT_REMAP_VIEW_PROPERTY(avatarStyle, state.style, MSFAvatarStyle)

RCT_REMAP_VIEW_PROPERTY(hasRingInnerGap, state.hasRingInnerGap, BOOL)

RCT_REMAP_VIEW_PROPERTY(customBorderImageSource, state.imageBasedRingColor, UIImage)

@end

NS_ASSUME_NONNULL_END
