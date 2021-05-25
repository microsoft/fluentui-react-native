// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import <React/RCTUIKit.h>

@interface PLYCalloutViewLocalData : NSObject


/**
 The rect of the object presenting the callout
 */
@property (nonatomic) CGRect targetRect;

/**
 The rect that is safe to present a callout in. Views such as status bar shouldn't be in the availableFrame.
 */
@property (nonatomic) CGRect availableFrame;

/**
 Set to YES if the device is an iPhone
 */
@property (nonatomic, getter=isUserInterfaceIdiomPhone) BOOL userInterfaceIdiomPhone;

@end
