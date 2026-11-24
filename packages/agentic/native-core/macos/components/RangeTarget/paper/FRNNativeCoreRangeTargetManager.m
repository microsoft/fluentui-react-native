#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNNativeCoreRangeTargetManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(targetLabel, NSString)
RCT_EXPORT_VIEW_PROPERTY(targetTestID, NSString)
RCT_EXPORT_VIEW_PROPERTY(minimum, double)
RCT_EXPORT_VIEW_PROPERTY(maximum, double)
RCT_EXPORT_VIEW_PROPERTY(step, double)
RCT_EXPORT_VIEW_PROPERTY(value, double)
RCT_EXPORT_VIEW_PROPERTY(hasValue, BOOL)
RCT_EXPORT_VIEW_PROPERTY(valueDescription, NSString)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(readOnly, BOOL)
RCT_EXPORT_VIEW_PROPERTY(clearable, BOOL)
RCT_EXPORT_VIEW_PROPERTY(horizontalReversed, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onValueRequest, RCTDirectEventBlock)
@end
