#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNSliderManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(value, doubleValue, double)
RCT_REMAP_VIEW_PROPERTY(defaultValue, doubleValue, double)
RCT_REMAP_VIEW_PROPERTY(minimumValue, minValue, double)
RCT_REMAP_VIEW_PROPERTY(maximumValue, maxValue, double)
RCT_EXPORT_VIEW_PROPERTY(numberOfTickMarks, NSInteger)
RCT_CUSTOM_VIEW_PROPERTY(continuous, BOOL, NSSlider) {
  [view setContinuous:json ? [RCTConvert BOOL:json] : YES];
}
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSSlider) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(tooltip, toolTip, NSString)
RCT_EXPORT_VIEW_PROPERTY(onValueChange, RCTBubblingEventBlock)

@end
