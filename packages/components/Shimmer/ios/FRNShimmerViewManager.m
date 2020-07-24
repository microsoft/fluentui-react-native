//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

#import <React/RCTBridge.h>
#import <React/RCTView.h>

#import "FRNShimmerViewManager.h"

@implementation FRNShimmerViewManager

RCT_EXPORT_MODULE()

#pragma mark - RCTViewManager overrides

- (RCTView *)view {
	return [[FRNShimmerView alloc] initWithBridge:[self bridge]];
}

@end
