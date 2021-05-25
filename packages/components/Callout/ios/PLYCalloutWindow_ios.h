// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import <React/RCTUIKit.h>

@protocol PLYCalloutWindowLifeCycle;

@interface PLYCalloutWindow : UIWindow

- (instancetype)initWithFrame:(CGRect)frame calloutWindowLifeCycle:(__weak id<PLYCalloutWindowLifeCycle>)calloutWindowLifeCycle NS_DESIGNATED_INITIALIZER;
- (instancetype)initWithFrame:(CGRect)frame NS_UNAVAILABLE;
- (instancetype)initWithCoder:(NSCoder *)aDecoder NS_UNAVAILABLE;

@end
