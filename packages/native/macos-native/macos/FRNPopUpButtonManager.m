#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNPopUpButtonManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(items, NSArray)
RCT_REMAP_VIEW_PROPERTY(selectedIndex, indexOfSelectedItem, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(pullsDown, BOOL)
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSPopUpButton) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(tooltip, toolTip, NSString)
RCT_EXPORT_VIEW_PROPERTY(onChange, RCTBubblingEventBlock)

@end
