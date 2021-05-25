// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import "PLYCalloutWindow_ios.h"
#import "PLYCalloutProtocols.h"

@implementation PLYCalloutWindow {
	__weak id<PLYCalloutWindowLifeCycle> _calloutWindowLifeCycle;
}

- (instancetype)initWithFrame:(CGRect)frame calloutWindowLifeCycle:(__weak id<PLYCalloutWindowLifeCycle>)calloutWindowLifeCycle {
	self = [super initWithFrame:frame];
	if (self) {
		_calloutWindowLifeCycle = calloutWindowLifeCycle;
	}
	return self;
}

- (UIView *)hitTest:(CGPoint)point withEvent:(UIEvent *)event {
	UIView *hit = [super hitTest:point withEvent:event];
	UIView *rootView = [[self rootViewController] view];
	CGPoint testPoint = [rootView convertPoint:point fromView:self];
	if (![rootView pointInside:testPoint withEvent:event]) {
		[_calloutWindowLifeCycle didDetectHitOutsideCallout:self];
	}
	return hit;
}

@end
