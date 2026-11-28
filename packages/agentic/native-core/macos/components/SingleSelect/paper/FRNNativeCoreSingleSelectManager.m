#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNNativeCoreSingleSelectManager, RCTViewManager)
RCT_REMAP_VIEW_PROPERTY(targetLabel, accessibilityLabel, NSString)
RCT_REMAP_VIEW_PROPERTY(targetTestID, accessibilityIdentifier, NSString)
RCT_REMAP_VIEW_PROPERTY(targetHelp, accessibilityHelp, NSString)
RCT_REMAP_VIEW_PROPERTY(options, optionRecords, NSArray)
RCT_EXPORT_VIEW_PROPERTY(selectedKey, NSString)
RCT_EXPORT_VIEW_PROPERTY(placeholder, NSString)
RCT_EXPORT_VIEW_PROPERTY(invalid, BOOL)
RCT_EXPORT_VIEW_PROPERTY(onSelectionRequest, RCTDirectEventBlock)
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSControl)
{
  [view setEnabled:json ? ![json boolValue] : [defaultView isEnabled]];
}
@end
