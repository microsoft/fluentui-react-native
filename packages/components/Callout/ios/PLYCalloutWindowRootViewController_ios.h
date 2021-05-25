// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import <React/RCTUIKit.h>

@protocol PLYCalloutWindowRootViewControllerLifeCycle;

@interface PLYCalloutWindowRootViewController : UIViewController

- (instancetype)initWithCalloutWindowRootViewControllerLifeCycle:(id<PLYCalloutWindowRootViewControllerLifeCycle>)calloutViewLifeCycle NS_DESIGNATED_INITIALIZER;
- (instancetype)initWithNibName:(NSString *)nibNameOrNil bundle:(NSBundle *)nibBundleOrNil NS_UNAVAILABLE;
- (instancetype)initWithCoder:(NSCoder *)aDecoder NS_UNAVAILABLE;

@end
