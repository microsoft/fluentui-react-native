#import <React/RCTViewManager.h>
#import <React/RCTConvert.h>

@interface RCT_EXTERN_MODULE(MSFShimmerViewManager, RCTViewManager)

/// Dictionary that maps the React Native "appearance" prop to the ShimmerView property "appearance"
RCT_EXPORT_VIEW_PROPERTY(appearance, NSDictionary)

/// Dictionary that maps the React Native "shimmerAppearance" prop to the ShimmerView property "shimmerAppearance"
RCT_EXPORT_VIEW_PROPERTY(shimmerAppearance, NSDictionary)

@end
