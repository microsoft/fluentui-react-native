// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import "PLYCalloutWindowRootViewController_ios.h"
#import "PLYCalloutProtocols.h"

@implementation PLYCalloutWindowRootViewController {
	__weak id<PLYCalloutWindowRootViewControllerLifeCycle> _calloutWindowRootViewControllerLifeCycle;
}

- (instancetype)initWithCalloutWindowRootViewControllerLifeCycle:(id<PLYCalloutWindowRootViewControllerLifeCycle>)calloutWindowRootViewControllerLifeCycle {
	if (self = [super initWithNibName:nil bundle:nil]) {
		_calloutWindowRootViewControllerLifeCycle = calloutWindowRootViewControllerLifeCycle;
	}
	return self;
}

- (void)viewWillTransitionToSize:(CGSize)size withTransitionCoordinator:(__unused id<UIViewControllerTransitionCoordinator>)coordinator {
	[super viewWillTransitionToSize:size withTransitionCoordinator:coordinator];

	[coordinator animateAlongsideTransition:^(id<UIViewControllerTransitionCoordinatorContext> _Nonnull context) {
		/* Put anything here that we want to do during the rotation */
	} completion:^(id<UIViewControllerTransitionCoordinatorContext> _Nonnull context) {
		/* Put anything here that we want to do after the rotation */
		// Otherwise, we don't know if the keyboard is hidden and get nondeterministic behavior on where the callout is located
		[_calloutWindowRootViewControllerLifeCycle sizeDidChangeForCalloutWindowRootViewController:self];
	}];
}

@end
