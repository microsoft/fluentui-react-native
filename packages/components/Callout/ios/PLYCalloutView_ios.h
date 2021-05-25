// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

@class RCTBridge;

#import <React/RCTView.h>
#import "PLYCalloutProtocols.h"

@interface PLYCalloutView : RCTView <PLYCalloutWindowLifeCycle, PLYCalloutWindowRootViewControllerLifeCycle>

@property (nonatomic, copy) NSNumber *target;
@property (nonatomic) CGRect anchorPosition;
@property (nonatomic, copy) RCTDirectEventBlock onDismiss;
@property (nonatomic, weak, readonly) RCTBridge *bridge;

- (instancetype)initWithBridge:(RCTBridge *)bridge;

@end
