#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation RCTConvert (FRNSegmentedControlAdditions)

RCT_ENUM_CONVERTER(NSSegmentSwitchTracking, (@{
	@"selectOne": @(NSSegmentSwitchTrackingSelectOne),
	@"selectAny": @(NSSegmentSwitchTrackingSelectAny),
	@"momentary": @(NSSegmentSwitchTrackingMomentary),
}), NSSegmentSwitchTrackingSelectOne, integerValue);

RCT_ENUM_CONVERTER(NSSegmentStyle, (@{
	@"automatic": @(NSSegmentStyleAutomatic),
	@"rounded": @(NSSegmentStyleRounded),
	@"texturedRounded": @(NSSegmentStyleTexturedRounded),
	@"roundRect": @(NSSegmentStyleRoundRect),
	@"texturedSquare": @(NSSegmentStyleTexturedSquare),
	@"capsule": @(NSSegmentStyleCapsule),
	@"smallSquare": @(NSSegmentStyleSmallSquare),
	@"separated": @(NSSegmentStyleSeparated),
}), NSSegmentStyleAutomatic, integerValue);

@end

@interface RCT_EXTERN_MODULE(FRNSegmentedControlManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(segments, NSArray)
RCT_REMAP_VIEW_PROPERTY(selectedIndex, selectedSegment, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(trackingMode, NSSegmentSwitchTracking)
RCT_EXPORT_VIEW_PROPERTY(segmentStyle, NSSegmentStyle)
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSSegmentedControl) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(tooltip, toolTip, NSString)
RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock)

@end
