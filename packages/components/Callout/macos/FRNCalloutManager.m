#import "FRNCalloutManager.h"

#import "FRNCallout-Swift.h"

@implementation RCTConvert (FRNCalloutAdditions)

// RCTConvert does not properly convert a JS screenRect into a native CGRect/NSRect,
// due to the mismatch of x/y and screenX/screenY. Let's do it manually.
// Note this does not take into account that macOS uses a flipped Y axis.
+ (NSRect)screenRect:(id)json
{
	CGFloat x = [RCTConvert CGFloat:json[@"screenX"]];
	CGFloat y = [RCTConvert CGFloat:json[@"screenY"]];
	CGFloat width = [RCTConvert CGFloat:json[@"width"]];
	CGFloat height = [RCTConvert CGFloat:json[@"height"]];
	return NSMakeRect(x, y, width, height);
}

// Collapse the directional hint options to the 4 NSRectEdge options
RCT_ENUM_CONVERTER(NSRectEdge, (@{
	@"leftTopEdge": @(NSRectEdgeMinX),
	@"leftCenter": @(NSRectEdgeMinX),
	@"leftBottomEdge": @(NSRectEdgeMinX),
	@"topLeftEdge": @(NSRectEdgeMaxY),
	@"topAutoEdge": @(NSRectEdgeMaxY),
	@"topCenter": @(NSRectEdgeMaxY),
	@"topRightEdge": @(NSRectEdgeMaxY),
	@"rightTopEdge": @(NSRectEdgeMaxX),
	@"rightCenter": @(NSRectEdgeMaxX),
	@"rightBottomEdge": @(NSRectEdgeMaxX),
	@"bottonLeftEdge": @(NSRectEdgeMinY),
	@"bottomAutoEdge": @(NSRectEdgeMinY),
	@"bottomCenter": @(NSRectEdgeMinY),
	@"bottomRightEdge": @(NSRectEdgeMinY),
}), NSRectEdgeMaxY, integerValue);

@end

@interface RCT_EXTERN_MODULE(FRNCalloutManager, RCTViewManager)

RCT_EXPORT_METHOD(focusWindow : (nonnull NSNumber *)viewTag)
{
	[self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTUIView *> *viewRegistry) {
#pragma unused(uiManager)
		RCTUIView *view = viewRegistry[viewTag];

		if ([view isKindOfClass:[FRNCalloutView class]]) {
			[(FRNCalloutView *)view focusWindow];
		}
	}];
}

RCT_EXPORT_METHOD(blurWindow : (nonnull NSNumber *)viewTag)
{
	[self.bridge.uiManager addUIBlock:^(RCTUIManager *uiManager, NSDictionary<NSNumber *, RCTUIView *> *viewRegistry) {
#pragma unused(uiManager)
		RCTUIView *view = viewRegistry[viewTag];

		if ([view isKindOfClass:[FRNCalloutView class]]) {
			[(FRNCalloutView *)view blurWindow];
		}
	}];
}

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(anchorRect, screenRect)

RCT_EXPORT_VIEW_PROPERTY(directionalHint, NSRectEdge)

RCT_EXPORT_VIEW_PROPERTY(setInitialFocus, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

@end
