#import <React/RCTI18nUtil.h>
#import <React/RCTTouchHandler.h>
#import <React/RCTUIManager.h>
#import <React/RCTView.h>
#import <React/RCTViewManager.h>

// Implemented by the Swift Paper manager so custom property bridges never name generated Swift view types.
@protocol FRNCalloutPropertyManager
- (void)setAnchor:(nullable NSView *)anchor forView:(nonnull NSView *)view;
@end
