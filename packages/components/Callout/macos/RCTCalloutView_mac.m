// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import "RCTCalloutView_mac.h"
#import "PLYCalloutWindowRootViewController_mac.h"
#import "PLYCalloutWindow_mac.h"
#import <React/RCTTouchHandler.h>
#import <React/UIView+React.h>
#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <React/RCTAssert.h>

@implementation RCTCalloutView	{
	__weak RCTBridge *_bridge;
	PLYCalloutWindow *_calloutWindow;
	PLYCalloutWindowRootViewController *_calloutWindowRootViewController;
	RCTView *_calloutProxyView;
	RCTTouchHandler *_calloutProxyTouchHandler;
	// Internally track that the callout never shrinks in size when it's laying out
	NSInteger _maxCalloutHeight;
	NSInteger _maxCalloutWidth;
}

- (instancetype)initWithBridge:(RCTBridge *)bridge {
	if (self = [super init]) {
		_bridge = bridge;
		// The proxy view is a React view that will be hosted in a seperate window.	The child react views added to this view will actually be added to the proxy view.
		_calloutProxyView = [[RCTView alloc] init];
		// We need our own touch handler because the callout proxy view will be in its own window instead of a RCTRootView hierarchy.
		_calloutProxyTouchHandler = [[RCTTouchHandler alloc] initWithBridge:bridge];
		[_calloutProxyView addGestureRecognizer:_calloutProxyTouchHandler];
		
		// The callout window root view will contain the proxy react view.	It will be offset within the window to align with the callout target rect
		// The callout window root view controller manages device rotation callbacks.
		_calloutWindowRootViewController = [[PLYCalloutWindowRootViewController alloc] init];
		
		// The callout window hosts the callout root view which hosts the proxy view.	The window is responsible for hit testing and dismissing the callout if taps happen outside of the callout root view.
		_calloutWindow = [PLYCalloutWindow windowWithContentViewController:_calloutWindowRootViewController];
		[_calloutWindow setCalloutWindowLifeCycle:self];
		[_calloutWindow setStyleMask:NSWindowStyleMaskBorderless];
		[_calloutWindow setLevel:NSStatusWindowLevel];
		[_calloutWindow setIsVisible:YES];
		[_calloutWindow setBackgroundColor:[RCTUIColor clearColor]];

		[[_calloutWindowRootViewController view] addSubview:_calloutProxyView];
	}
	return self;
}

#pragma mark - RCTComponent overrides

#pragma clang diagnostic push
#pragma clang diagnostic ignored "-Wobjc-missing-super-calls"
- (void)insertReactSubview:(RCTUIView *)subview atIndex:(NSInteger)atIndex {
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

#pragma mark - PLYCalloutWindowLifeCycle protocols

- (void)applicationDidResignActiveForCalloutWindow:(__unused PLYCalloutWindow *)calloutWindow {
	[self dismissCallout];
}

- (void)didDetectHitOutsideCallout:(__unused PLYCalloutWindow*)calloutWindow {
	[self dismissCallout];
}

#pragma mark - Internal Life Cycle

- (void)updateCalloutFrameToTargetFrame {
	CGRect targetFrameInWindowCoordinates = CGRectZero;
	
	RCTPlatformView *targetView = [[_bridge uiManager] viewForReactTag:[self target]];
	if (targetView) {
		NSRect targetFrameInWindow = [targetView convertRect:[targetView frame] toView:nil];
		targetFrameInWindowCoordinates = [[targetView window] convertRectToScreen:targetFrameInWindow];
	}
	
	// if the optional anchorPos is supplied, offset the target frame by the anchorPos
	if (!CGRectEqualToRect(_anchorPosition, CGRectZero)) {
		targetFrameInWindowCoordinates.origin.x += _anchorPosition.origin.x;
		targetFrameInWindowCoordinates.origin.y += _anchorPosition.origin.y;
		targetFrameInWindowCoordinates.size = _anchorPosition.size;
	}
	
	CGRect calloutRect = [self bestRectRelativeToTargetFrame:targetFrameInWindowCoordinates];

	[_calloutWindow setFrame:calloutRect display:YES];
	
	calloutRect.origin.x = 0;
	calloutRect.origin.y = 0;
	[_calloutProxyView setFrame:calloutRect];

	[[_calloutWindowRootViewController view] setFrame:calloutRect];
}

- (void)dismissCallout {
	RCTDirectEventBlock onDismiss = [self onDismiss];
	if (onDismiss != nil) {
		NSDictionary *event = @{ @"target": [self reactTag], };
		onDismiss(event);
	}
}

#pragma mark - internal methods

- (CGRect)bestRectRelativeToTargetFrame:(CGRect)targetRect {
	CGRect calloutFrame = [self frame];
	_maxCalloutHeight = MAX(_maxCalloutHeight, calloutFrame.size.height);
	_maxCalloutWidth = MAX(_maxCalloutWidth, calloutFrame.size.width);
	
	// Use the screen the anchor view is on, not necessarily the main screen
	// TODO: VSO#2339406, don't use mainScreen. Mirror CUIMenuWindow
	NSRect screenFrame = [[NSScreen mainScreen] visibleFrame];
	
	CGRect rect = CGRectMake((NSInteger)targetRect.origin.x, (NSInteger)targetRect.origin.y, _maxCalloutWidth, _maxCalloutHeight);
	// 1. If space below, callout is below
	 if (rect.origin.y + _maxCalloutHeight + targetRect.size.height < screenFrame.size.height) {
		rect.origin.y -= _maxCalloutHeight;
		RCTAssert(rect.origin.y >= 0, @"Callout currently extends off the lower end of the screen.");
	}
	// 2. Else if space above, callout is above
	else if (rect.origin.y > _maxCalloutHeight) {
		rect.origin.y -= _maxCalloutHeight;
	}
	// 3. Else callout is resized to fit wherever there is more space
	else {
		CGFloat menuBarHeight = [[[NSApplication sharedApplication] mainMenu] menuBarHeight];
		NSInteger heightAboveTarget = screenFrame.size.height - targetRect.origin.y - targetRect.size.height - menuBarHeight;
		NSInteger heightBelowTarget = targetRect.origin.y;
		if (heightAboveTarget > heightBelowTarget) {
			// Take up as much space as available above
			rect.origin.y += targetRect.size.height;
			rect.size.height = rect.origin.y - menuBarHeight;
		} else {
			// Take up as much space as available below
			rect.size.height = rect.origin.y;
			rect.origin.y = [NSStatusBar systemStatusBar].thickness;
		}
	}

	// HORIZONTAL ALIGNMENT
	if (rect.origin.x < 0) {
		rect.origin.x = 0;
	}
	if (rect.origin.x + rect.size.width >= screenFrame.size.width) {
		rect.origin.x -= (rect.origin.x + rect.size.width - screenFrame.size.width);
	}

	return rect;
}

@end
