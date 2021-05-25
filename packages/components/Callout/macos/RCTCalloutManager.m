#import <React/RCTViewManager.h>
#import "RCTCalloutView_mac.h"

@interface RCT_EXTERN_MODULE(RCTCalloutManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)
RCT_CUSTOM_VIEW_PROPERTY(anchorPos, CGRect, RCTCalloutView) {
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
