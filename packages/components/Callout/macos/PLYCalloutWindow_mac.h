// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import <React/RCTUIKit.h>

@protocol PLYCalloutWindowLifeCycle;

@interface PLYCalloutWindow : NSWindow

@property (nonatomic, weak) id<PLYCalloutWindowLifeCycle> calloutWindowLifeCycle;

@end
