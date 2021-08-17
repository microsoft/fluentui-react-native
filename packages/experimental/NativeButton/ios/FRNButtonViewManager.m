#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>
#import "RCTBridgeModule.h"

@import FluentUI;

@implementation RCTConvert (FRNButtonAdditions)
RCT_ENUM_CONVERTER(MSFButtonStyle, (@{
  @"primary": @(MSFButtonStylePrimaryFilled),
  @"secondary": @(MSFButtonStyleSecondaryOutline),
  @"borderless": @(MSFButtonStyleBorderless),
  @"acrylic": @(MSFButtonStylePrimaryFilled),
}), MSFButtonStylePrimaryFilled, integerValue);

@end

@interface RCT_EXTERN_MODULE(FRNButtonViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(image, UIImage);
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(enabled, BOOL);
RCT_REMAP_VIEW_PROPERTY(buttonStyle, style, MSFButtonStyle);
RCT_CUSTOM_VIEW_PROPERTY(title, String, MSFButton) {
	// for simplicity only normal state is supported
	[view setTitle:[RCTConvert NSString:json] forState:normal];
}

@end

