#import <React/RCTViewManager.h>


@interface RCT_EXTERN_MODULE(MSFActivityIndicatorViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(hidesWhenStopped, BOOL);

RCT_EXPORT_VIEW_PROPERTY(color, UIColor);
RCT_EXPORT_VIEW_PROPERTY(size, MSActivityIndicatorViewSize);

@end
