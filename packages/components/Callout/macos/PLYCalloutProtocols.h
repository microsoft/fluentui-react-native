// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import <Foundation/Foundation.h>

@class PLYCalloutWindow;
@class PLYCalloutWindowRootViewController;

@protocol PLYCalloutWindowLifeCycle <NSObject>
@required
/*
 * Notify the PLYCalloutWindowLifeCycle object that the user touched/clicked outside the bounds of the callout.
 */
- (void)didDetectHitOutsideCallout:(PLYCalloutWindow *)calloutWindow;

@optional
/*
 * Notify the PLYCalloutWindowLifeCycle object that the window the callout is in is no longer active.
 */
- (void)applicationDidResignActiveForCalloutWindow:(PLYCalloutWindow *)calloutWindow;
@end

@protocol PLYCalloutWindowRootViewControllerLifeCycle <NSObject>
@required
/*
 * Notify the PLYCalloutWindowRootViewControllerLifeCycle object that the screen orientation changed.
 */
- (void)sizeDidChangeForCalloutWindowRootViewController:(PLYCalloutWindowRootViewController *)calloutWindowRootViewController;
@end
