// Copyright (c) 2018 Microsoft Corporation. All rights reserved.

#import "PLYCalloutViewManager.h"
#if !TARGET_OS_OSX
#import "PLYShadowCalloutView_ios.h"
#import "PLYCalloutView_ios.h"
#else
#import "PLYCalloutView_mac.h"
#endif

@implementation PLYCalloutViewManager

RCT_EXPORT_MODULE()

#pragma mark - RCTViewManager overrides

- (RCTUIView *)view {
	return [[PLYCalloutView alloc] initWithBridge:[self bridge]];
}

#if !TARGET_OS_OSX
- (RCTShadowView *)shadowView {
	return [PLYShadowCalloutView new];
}
#endif

- (dispatch_queue_t)methodQueue {
	return dispatch_get_main_queue();
}

#pragma mark - Exported JS props

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)
RCT_CUSTOM_VIEW_PROPERTY(anchorPos, CGRect, PLYCalloutView) {
	// TODO: change shared TypeScript, Android, and Windows code to use conventional RN rect x,y,width,height instead of top,left,width,height.
	// When done then this custom prop will be replaced by:
	// RCT_REMAP_VIEW_PROPERTY(anchorPos, anchorPosition, CGRect)
	if (json) {
		NSMutableDictionary *mutableAnchorPosition = [json mutableCopy];
		mutableAnchorPosition[@"x"] = mutableAnchorPosition[@"left"];
		mutableAnchorPosition[@"y"] = mutableAnchorPosition[@"top"];
		[view setAnchorPosition:[RCTConvert CGRect:mutableAnchorPosition]];
	} else {
		[view setAnchorPosition:CGRectZero];
	}
}
RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

@end
