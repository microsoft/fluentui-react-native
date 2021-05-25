// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import "PLYCalloutView_ios.h"
#import "PLYCalloutWindowRootViewController_ios.h"
#import "PLYCalloutWindow_ios.h"
#import "PLYCalloutViewLocalData_ios.h"
#import <React/RCTTouchHandler.h>
#import <React/UIView+React.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTAssert.h>

#import <React/RCTShadowView.h>

// In React Native, touch handler coordinates are handled in the coordinate space of the view that the touch handler is attached to.
// Frame coordinates are handled in the coordinate space of the closest superview that responds `YES` to `isReactRootView`, or
// if none do, the window of the view.
//
// To keep our touch handler and frame coordintes in the same coordinate space, let's make the `_calloutProxyView` claim to be a react root view
// VSO 2411761 - Is there a less hacky way to do this? Should we instead not have a root view and attach the touch handler to the window?
@interface PLYRootView : RCTView
@end

@implementation PLYRootView

- (BOOL)isReactRootView {
	return YES;
}

@end

@implementation PLYCalloutView	{
	__weak RCTBridge *_bridge;
	PLYCalloutWindow *_calloutWindow;
	PLYCalloutWindowRootViewController *_calloutWindowRootViewController;
	RCTView *_calloutProxyView;
	RCTTouchHandler *_calloutProxyTouchHandler;
}

- (instancetype)initWithBridge:(RCTBridge *)bridge {
  if (self = [super init]) {
    _bridge = bridge;
    // The proxy view is a React view that will be hosted in a seperate window.	The child react views added to this view will actually be added to the proxy view.
    // To ensure our touch handler and our view frames are communicated to the JavaScript layer in the same coordinate space, this view needs to be recognized
    // as a react root view. So let's use a PLYRootView instead of an RCTView.
    _calloutProxyView = [[PLYRootView alloc] init];
    // We need our own touch handler because the callout proxy view will be in its own window instead of a RCTRootView hierarchy.
    _calloutProxyTouchHandler = [[RCTTouchHandler alloc] initWithBridge:bridge];
    [_calloutProxyTouchHandler attachToView:_calloutProxyView];

    // The callout window root view will contain the proxy react view.	It will be offset within the window to align with the callout target rect
    // The callout window root view controller manages device rotation callbacks.
    _calloutWindowRootViewController = [[PLYCalloutWindowRootViewController alloc] initWithCalloutWindowRootViewControllerLifeCycle:self];

    // The callout window hosts the callout root view which hosts the proxy view.	The window is responsible for hit testing and dismissing the callout if taps happen outside of the callout root view.
    // We set the frame and scene later once we know what both should be
    _calloutWindow = [[PLYCalloutWindow alloc] initWithFrame:CGRectZero calloutWindowLifeCycle:self];

	[_calloutWindow setRootViewController:_calloutWindowRootViewController];
	[_calloutWindow setUserInteractionEnabled:YES];
	[_calloutWindow setHidden:NO];
	[_calloutWindow setBackgroundColor:[UIColor clearColor]];

	[[_calloutWindowRootViewController view] addSubview:_calloutProxyView];
  }
  return self;
}

#pragma mark - RCTComponent overrides

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(UIView *)subview atIndex:(NSInteger)atIndex {
	// Do not want to call super (despite NS_REQUIRES_SUPER on base class) since this will cause the Callout's children to appear within the main component.
	// Instead we want to add the react subviews to the proxy callout view which is in its own callout window.
	[_calloutProxyView insertReactSubview:subview atIndex:atIndex];
	[_calloutProxyView insertSubview:subview atIndex:atIndex];
}
#pragma clang diagnostic pop

- (void)removeFromSuperview {
	[[_calloutProxyView subviews] makeObjectsPerformSelector:@selector(removeFromSuperview)];
	_calloutProxyTouchHandler = nil;
	_calloutProxyView = nil;
	_calloutWindowRootViewController = nil;
	_calloutWindow = nil;
	[super removeFromSuperview];
}

- (void)reactSetFrame:(CGRect)frame {
	[super reactSetFrame:frame];
	[self updateCalloutFrameToTargetFrame];
}

#pragma mark - UIView overrides

// We never want this view to be visible, its a placeholder for the react component hierarchy.	Only its react children will be visible inside the callout view in the callout window
- (BOOL)isHidden {
	return YES;
}

-(void)didMoveToSuperview {
	[super didMoveToSuperview];

	if ([self superview] != nil) {
		[self updateCalloutFrameToTargetFrame];
	}
}

#pragma mark - PLYCalloutWindowLifeCycle

- (void)didDetectHitOutsideCallout:(__unused PLYCalloutWindow *)calloutWindow {
	[self dismissCallout];
}

#pragma mark - PLYCalloutWindowRootViewControllerLifeCycle

- (void)sizeDidChangeForCalloutWindowRootViewController:(__unused PLYCalloutWindowRootViewController *)calloutWindowRootViewController {
	// Move our popover to position under the target when a device detects a view size change
	[self updateCalloutFrameToTargetFrame];
}

#pragma mark - Internal life cycle

- (void)updateCalloutFrameToTargetFrame {
	CGRect targetFrameInWindowCoordinates = CGRectZero;

	RCTPlatformView *targetView = [[_bridge uiManager] viewForReactTag:[self target]];
	if (targetView != nil) {
		targetFrameInWindowCoordinates = [[targetView superview] convertRect:[targetView frame] toView:[targetView window]];
	}

    CGRect windowFrame = CGRectZero;
     if (@available(iOS 13.0, *)) {
        // Only manipulate our scenes if the prop is explicitly set in our info plist
        if ([[NSBundle mainBundle] objectForInfoDictionaryKey:@"UIApplicationSceneManifest"] != nil) {
            UIView *viewInWindow = targetView != nil ? targetView : self;
            UIWindowScene *windowScene = [[viewInWindow window] windowScene];
            [_calloutWindow setWindowScene:windowScene];
            windowFrame = [[windowScene screen] bounds];
        }
     }
     
     // If we're either in ios 12 or ios 13 failed to get us the bounds (e.g. windowScene is nil), fallback to the main screen's bounds
     if (CGRectEqualToRect(windowFrame, CGRectZero)) {
        windowFrame = [[UIScreen mainScreen] bounds];
     }
     [_calloutWindow setFrame:windowFrame];

	// if the optional anchorPos is supplied, offset the target frame by the anchorPos and update the size for later calculations
	if (!CGRectEqualToRect(_anchorPosition, CGRectZero)) {
		targetFrameInWindowCoordinates.origin.x += _anchorPosition.origin.x;
		targetFrameInWindowCoordinates.origin.y += _anchorPosition.origin.y;
		targetFrameInWindowCoordinates.size = _anchorPosition.size;
	}

	CGRect availableFrame = [[[self window] safeAreaLayoutGuide] layoutFrame];

	PLYCalloutViewLocalData *calloutViewLocalData = [PLYCalloutViewLocalData new];
	[calloutViewLocalData setTargetRect:targetFrameInWindowCoordinates];
	[calloutViewLocalData setAvailableFrame:availableFrame];
	[calloutViewLocalData setUserInterfaceIdiomPhone:([[UIDevice currentDevice] userInterfaceIdiom] == UIUserInterfaceIdiomPhone)];
	RCTUIManager *uiManager = [_bridge uiManager];
	[uiManager setLocalData:calloutViewLocalData forView:self];

	CGRect frame = [self frame];
	[[_calloutWindowRootViewController view] setFrame:frame];

	// The proxy react view must have a width and height otherwise VoiceOver will exclude its descendant views from VoiceOver navigation.
	CGRect calloutProxyFrame = frame;
	calloutProxyFrame.origin = CGPointZero;
	[_calloutProxyView setFrame:calloutProxyFrame];
}

- (void)dismissCallout {
	RCTDirectEventBlock onDismiss = [self onDismiss];
	if (onDismiss != nil) {
		NSDictionary *event = @{ @"target": [self reactTag], };
		onDismiss(event);
	}
}

@end
