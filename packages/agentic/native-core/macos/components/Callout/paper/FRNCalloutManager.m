#import "FRNCalloutManager.h"

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

// Collapse the directional hint options to the 4 NSRectEdge options.
// CalloutView uses MinY for placement above the anchor and MaxY for placement below it.
RCT_ENUM_CONVERTER(NSRectEdge, (@{
	@"leftTopEdge": @(NSRectEdgeMinX),
	@"leftCenter": @(NSRectEdgeMinX),
	@"leftBottomEdge": @(NSRectEdgeMinX),
	@"topLeftEdge": @(NSRectEdgeMinY),
	@"topAutoEdge": @(NSRectEdgeMinY),
	@"topCenter": @(NSRectEdgeMinY),
	@"topRightEdge": @(NSRectEdgeMinY),
	@"rightTopEdge": @(NSRectEdgeMaxX),
	@"rightCenter": @(NSRectEdgeMaxX),
	@"rightBottomEdge": @(NSRectEdgeMaxX),
	@"bottomLeftEdge": @(NSRectEdgeMaxY),
	@"bottomAutoEdge": @(NSRectEdgeMaxY),
	@"bottomCenter": @(NSRectEdgeMaxY),
	@"bottomRightEdge": @(NSRectEdgeMaxY),
}), NSRectEdgeMaxY, integerValue);

@end

@interface RCT_EXTERN_MODULE(RCTCalloutManager, RCTViewManager)

RCT_EXTERN_METHOD(focusWindow : (nonnull NSNumber *)viewTag)

RCT_EXTERN_METHOD(blurWindow : (nonnull NSNumber *)viewTag)

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(anchorRect, screenRect)

RCT_EXPORT_VIEW_PROPERTY(directionalHint, NSRectEdge)

RCT_EXPORT_VIEW_PROPERTY(setInitialFocus, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

@end

@interface RCT_EXTERN_MODULE(FRNCalloutManager, RCTCalloutManager)
@end
