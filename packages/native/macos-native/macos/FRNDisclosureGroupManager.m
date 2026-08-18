#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNDisclosureGroupManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(label, NSString)
RCT_EXPORT_VIEW_PROPERTY(expanded, NSNumber)
RCT_EXPORT_VIEW_PROPERTY(defaultExpanded, BOOL)
RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onExpandedChange, RCTBubblingEventBlock)

@end
