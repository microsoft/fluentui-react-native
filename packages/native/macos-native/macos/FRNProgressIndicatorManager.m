#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@implementation RCTConvert (FRNProgressIndicatorAdditions)

RCT_ENUM_CONVERTER(NSProgressIndicatorStyle, (@{
	@"bar": @(NSProgressIndicatorStyleBar),
	@"spinner": @(NSProgressIndicatorStyleSpinning),
}), NSProgressIndicatorStyleBar, integerValue);

@end

@interface RCT_EXTERN_MODULE(FRNProgressIndicatorManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(indicatorStyle, style, NSProgressIndicatorStyle)
RCT_REMAP_VIEW_PROPERTY(indeterminate, indeterminate, BOOL)
RCT_REMAP_VIEW_PROPERTY(value, doubleValue, double)
RCT_REMAP_VIEW_PROPERTY(minValue, minValue, double)
RCT_REMAP_VIEW_PROPERTY(maxValue, maxValue, double)
RCT_EXPORT_VIEW_PROPERTY(animating, BOOL)

@end
