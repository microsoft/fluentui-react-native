#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTCalloutManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

@end
