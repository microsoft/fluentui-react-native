#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>
#import "RCTBridgeModule.h"

@import FluentUI;

@implementation RCTConvert (MSFButtonAdditions)
RCT_ENUM_CONVERTER(MSFButtonLegacyStyle, (@{
  @"primary": @(MSFButtonLegacyStylePrimaryFilled),
  @"secondary": @(MSFButtonLegacyStyleSecondaryOutline),
  @"borderless": @(MSFButtonLegacyStyleBorderless),
  @"acrylic": @(MSFButtonLegacyStylePrimaryFilled),
}), MSFButtonLegacyStylePrimaryFilled, integerValue);

@end

@interface RCT_EXTERN_MODULE(MSFButtonViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(image, UIImage);
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);
RCT_EXPORT_VIEW_PROPERTY(enabled, BOOL);
RCT_REMAP_VIEW_PROPERTY(buttonStyle, style, MSFButtonLegacyStyle);
RCT_CUSTOM_VIEW_PROPERTY(title, String, MSFButtonLegacy) {
	// for simplicity only normal state is supported
	[view setTitle:[RCTConvert NSString:json] forState:normal];
}

@end

