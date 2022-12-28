#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

@interface RCT_EXTERN_MODULE(FRNAvatarViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(primaryText, contactName, NSString)

RCT_REMAP_VIEW_PROPERTY(secondaryText, contactEmail, NSString)

RCT_REMAP_VIEW_PROPERTY(imageSource, contactImage, UIImage)

RCT_REMAP_VIEW_PROPERTY(backgroundColor, avatarBackgroundColor, UIColor)

RCT_CUSTOM_VIEW_PROPERTY(size, NSString, MSFAvatarView)
{
	NSString *avatarSizeString = [RCTConvert NSString:json];
	if ([avatarSizeString isEqualToString:@"size16"]) {
		[view setAvatarSize:16];
	} else if ([avatarSizeString isEqualToString:@"size20"]) {
		[view setAvatarSize:20];
	} else if ([avatarSizeString isEqualToString:@"size24"]) {
		[view setAvatarSize:24];
	} else if ([avatarSizeString isEqualToString:@"size32"]) {
		[view setAvatarSize:32];
	} else if ([avatarSizeString isEqualToString:@"size40"]) {
		[view setAvatarSize:40];
	} else if ([avatarSizeString isEqualToString:@"size56"]) {
		[view setAvatarSize:56];
	} else if ([avatarSizeString isEqualToString:@"size72"]) {
		[view setAvatarSize:72];
	}
}

@end
