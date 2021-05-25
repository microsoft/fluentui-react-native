// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

@class RCTBridge;

#import <React/RCTView.h>
#import "PLYCalloutProtocols.h"

@interface RCTCalloutView : RCTView <PLYCalloutWindowLifeCycle>

@property (nonatomic, copy) NSNumber *target;
@property (nonatomic, assign) CGRect anchorPosition;
@property (nonatomic, copy) RCTDirectEventBlock onDismiss;
@property (nonatomic, weak, readonly) RCTBridge *bridge;

- (instancetype)initWithBridge:(RCTBridge *)bridge;

@end
