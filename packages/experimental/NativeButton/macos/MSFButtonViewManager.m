#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>
#import "RCTBridgeModule.h"

@import FluentUI;

@implementation RCTConvert (MSFButtonAdditions)
RCT_ENUM_CONVERTER(MSFButtonStyle, (@{
	@"primary": @(MSFButtonStylePrimary),
	@"secondary": @(MSFButtonStyleSecondary),
	@"acrylic": @(MSFButtonStyleAcrylic),
	@"borderless": @(MSFButtonStyleBorderless),
}), MSFButtonStylePrimary, integerValue);

@end

@interface RCT_EXTERN_MODULE(MSFButtonViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(title, NSString);
RCT_EXPORT_VIEW_PROPERTY(accentColor, UIColor);
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(isImageTinted, BOOL);
RCT_REMAP_VIEW_PROPERTY(buttonStyle, style, MSFButtonStyle);
RCT_CUSTOM_VIEW_PROPERTY(isEnabled, BOOL, MSFButton) {
	[view setEnabled:[RCTConvert BOOL:json]];
}
RCT_CUSTOM_VIEW_PROPERTY(image, NSImage, MSFButton) {
	[view setImage:[RCTConvert UIImage:json]];
}
@end

