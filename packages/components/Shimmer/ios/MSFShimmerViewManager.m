#import <React/RCTViewManager.h>


@interface RCT_EXTERN_MODULE(MSFShimmerViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(shimmerAlpha, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(shimmerWidth, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(shimmerAngle, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(shimmerSpeed, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(shimmerDelay, double)

RCT_EXPORT_VIEW_PROPERTY(viewTintColor, UIColor)
RCT_EXPORT_VIEW_PROPERTY(cornerRadius, CGFloat)

@end
