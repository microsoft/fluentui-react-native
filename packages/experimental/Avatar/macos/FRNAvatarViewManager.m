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
	if ([avatarSizeString isEqualToString:@"xSmall"]) {
		[view setAvatarSize:16];
	} else if ([avatarSizeString isEqualToString:@"small"]) {
		[view setAvatarSize:24];
	} else if ([avatarSizeString isEqualToString:@"medium"]) {
		[view setAvatarSize:32];
	} else if ([avatarSizeString isEqualToString:@"large"]) {
		[view setAvatarSize:40];
	} else if ([avatarSizeString isEqualToString:@"xLarge"]) {
		[view setAvatarSize:52];
	} else if ([avatarSizeString isEqualToString:@"xxLarge"]) {
		[view setAvatarSize:72];
	}
}

@end
