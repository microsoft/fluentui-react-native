#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNNativeCoreDialogWindowManager, RCTViewManager)
RCT_EXPORT_VIEW_PROPERTY(shown, BOOL)
RCT_EXPORT_VIEW_PROPERTY(mode, NSString)
RCT_EXPORT_VIEW_PROPERTY(windowLabel, NSString)
RCT_EXPORT_VIEW_PROPERTY(onWindowEvent, RCTDirectEventBlock)
@end
