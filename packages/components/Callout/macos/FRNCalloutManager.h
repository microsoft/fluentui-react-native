#import <React/RCTTouchHandler.h>
#import <React/RCTUIManager.h>
#import <React/RCTView.h>
#import <React/RCTViewManager.h>

typedef NS_OPTIONS(NSUInteger, FRNCalloutPreventDismiss) {
    FRNCalloutPreventDismissNone            = 0,
    FRNCalloutPreventDismissOnKeyDown       = 1 << 0,
    FRNCalloutPreventDismissOnClickOutside  = 1 << 1,
};

