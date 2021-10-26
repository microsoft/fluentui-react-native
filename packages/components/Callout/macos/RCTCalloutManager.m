#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RCTCalloutManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)

// TODO: Support anchorRect (arbritrary rect on Raect Root View)
RCT_EXPORT_VIEW_PROPERTY(anchorRect, NSRect)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTBubblingEventBlock)

@end
