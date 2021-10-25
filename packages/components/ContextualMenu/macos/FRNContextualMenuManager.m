#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNContextualMenuManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(onItemClick, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTBubblingEventBlock)

@end
