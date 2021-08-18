#import <React/RCTViewManager.h>

#import "FRNAvatarStorage.h"

@import FluentUI;

// Macros inspired by https://betterprogramming.pub/react-native-meets-swiftui-d1606a8e1681

#define RCT_EXPORT_SWIFTUI_PROPERTY(name, type, proxyClass) \
RCT_REMAP_VIEW_PROPERTY(name, __custom__, type)  \
- (void)set_##name:(id)json forView:(UIView *)view withDefaultView:(UIView *)defaultView RCT_DYNAMIC { \
    NSMutableDictionary *storage = [proxyClass storage]; \
    proxyClass *proxy = storage[[NSValue valueWithNonretainedObject:view]];  \
    proxy.state.name = [RCTConvert type:json]; \
}

#define RCT_REMAP_SWIFTUI_PROPERTY(name, keyPath, type, proxyClass) \
RCT_REMAP_VIEW_PROPERTY(name, __custom__, type)  \
- (void)set_##name:(id)json forView:(UIView *)view withDefaultView:(UIView *)defaultView RCT_DYNAMIC { \
    NSMutableDictionary *storage = [proxyClass storage]; \
    proxyClass *proxy = storage[[NSValue valueWithNonretainedObject:view]];  \
    proxy.state.keyPath = [RCTConvert type:json]; \
}

#define RCT_EXPORT_CUSTOM_SWIFTUI_PROPERTY(name, type, proxyClass) \
RCT_REMAP_VIEW_PROPERTY(name, __custom__, type)  \
- (void)set_##name:(id)json forView:(UIView *)view withDefaultView:(UIView *)defaultView RCT_DYNAMIC

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

RCT_EXPORT_SWIFTUI_PROPERTY(primaryText, NSString, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(secondaryText, NSString, MSFAvatar)

RCT_REMAP_SWIFTUI_PROPERTY(imageSource, image, UIImage, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(ringColor, UIColor, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(foregroundColor, UIColor, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(backgroundColor, UIColor, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(presence, MSFAvatarPresence, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(isRingVisible, BOOL, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(isTransparent, BOOL, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(isOutOfOffice, BOOL, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(size, MSFAvatarSize, MSFAvatar)

RCT_REMAP_SWIFTUI_PROPERTY(avatarStyle, style, MSFAvatarStyle, MSFAvatar)

RCT_EXPORT_SWIFTUI_PROPERTY(hasRingInnerGap, BOOL, MSFAvatar)

RCT_EXPORT_CUSTOM_SWIFTUI_PROPERTY(customBorderImageSource, UIImage, MSFAvatar)
{
    NSMutableDictionary *storage = [MSFAvatar storage];
    MSFAvatar *viewWrapper = storage[[NSValue valueWithNonretainedObject:view]];
    UIImage *customBorderImage = [RCTConvert UIImage:json];
    [[viewWrapper state] setImageBasedRingColor:customBorderImage];
}

@end

NS_ASSUME_NONNULL_END
