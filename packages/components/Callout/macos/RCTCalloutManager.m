#import <RCTCalloutManager.h>

@implementation RCTConvert (RCTCalloutAdditions)

// RCTConvert does not properly convert a JS screenRect into a native CGRect/NSRect,
// due to the mismatch of x/y and screenX/screenY. Let's do it manually
+ (NSRect)screenRect:(id)json
{
	CGFloat x = [RCTConvert CGFloat:json[@"screenX"]];
	CGFloat y = [RCTConvert CGFloat:json[@"screenX"]];
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

@interface RCT_EXTERN_MODULE(RCTCalloutManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(target, NSNumber)

RCT_EXPORT_VIEW_PROPERTY(anchorRect, screenRect)

RCT_EXPORT_VIEW_PROPERTY(directionalHint, NSRectEdge)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTBubblingEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTBubblingEventBlock)

@end
