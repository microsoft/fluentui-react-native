#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>
#import "RCTBridgeModule.h"

@import FluentUI;

@implementation RCTConvert (MSFButtonAdditions)
RCT_ENUM_CONVERTER(MSFButtonStyle, (@{
	@"primary": @(MSFButtonStylePrimaryFilled),
	@"secondary": @(MSFButtonStyleSecondaryOutline),
	@"borderless": @(MSFButtonStyleBorderless),
}), MSFButtonStylePrimaryFilled, integerValue);

@end

@interface RCT_EXTERN_MODULE(MSFUIButtonViewManager, RCTViewManager)

//RCT_EXPORT_VIEW_PROPERTY(image, UIImage);
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);
RCT_REMAP_VIEW_PROPERTY(buttonStyle, style, MSFButtonStyle);
RCT_CUSTOM_VIEW_PROPERTY(title, String, MSFButton) {
	// for simplicity only normal state is supported
	[view setTitle:[RCTConvert NSString:json] forState:normal];
}
RCT_CUSTOM_VIEW_PROPERTY(isEnabled, BOOL, MSFButton) {
	[view setEnabled:[RCTConvert BOOL:json]];
}
RCT_CUSTOM_VIEW_PROPERTY(image, UIImage, MSFButton) {
	[view setImage:[RCTConvert UIImage:json]];
}

@end

