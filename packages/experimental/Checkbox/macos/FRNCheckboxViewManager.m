#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNCheckboxViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(label, title, NSString);
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSButton) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(checked, state, NSControlStateValue);
RCT_REMAP_VIEW_PROPERTY(defaultChecked, state, NSControlStateValue);
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);
RCT_REMAP_VIEW_PROPERTY(tooltip, toolTip, NSString)
@end
@implementation RCTConvert (FRNCheckboxAdditions)

RCT_ENUM_CONVERTER(NSControlStateValue, (@{
	@"true": @(NSControlStateValueOn),
	@"false": @(NSControlStateValueOff),
}), NSControlStateValueOff, boolValue);
@end
