#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNSwitchManager, RCTViewManager)

RCT_CUSTOM_VIEW_PROPERTY(value, BOOL, NSSwitch) {
  [view setState:[RCTConvert BOOL:json] ? NSControlStateValueOn : NSControlStateValueOff];
}
RCT_CUSTOM_VIEW_PROPERTY(defaultValue, BOOL, NSSwitch) {
  [view setState:[RCTConvert BOOL:json] ? NSControlStateValueOn : NSControlStateValueOff];
}
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSSwitch) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(tooltip, toolTip, NSString)
RCT_EXPORT_VIEW_PROPERTY(onValueChange, RCTBubblingEventBlock)

@end
