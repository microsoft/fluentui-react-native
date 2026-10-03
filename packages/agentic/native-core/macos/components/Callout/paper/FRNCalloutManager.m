#import "FRNCalloutManager.h"

#import "FRNNativeCore-Swift.h"

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

RCT_EXPORT_METHOD(focusWindow : (nonnull NSNumber *)viewTag)
{
	dispatch_async(dispatch_get_main_queue(), ^{
		NSView *view = [self.bridge.uiManager viewForReactTag:viewTag];

		if ([view isKindOfClass:[FRNCalloutView class]]) {
			[(FRNCalloutView *)view focusWindow];
		}
	});
}

RCT_EXPORT_METHOD(blurWindow : (nonnull NSNumber *)viewTag)
{
	dispatch_async(dispatch_get_main_queue(), ^{
		NSView *view = [self.bridge.uiManager viewForReactTag:viewTag];

		if ([view isKindOfClass:[FRNCalloutView class]]) {
			[(FRNCalloutView *)view blurWindow];
		}
	});
}

RCT_CUSTOM_VIEW_PROPERTY(target, NSNumber, FRNCalloutView)
{
  NSNumber *tag = [RCTConvert NSNumber:json];
  NSView *target = tag ? [self.bridge.uiManager viewForReactTag:tag] : nil;
  if (tag && !target) RCTLogError(@"Callout target %@ is not mounted in its bridge.", tag);
  [view setAnchorView:target];
}

RCT_EXPORT_VIEW_PROPERTY(commandGeneration, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(anchorMode, NSString)
RCT_EXPORT_VIEW_PROPERTY(gapSpace, CGFloat)
RCT_EXPORT_VIEW_PROPERTY(onReady, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onClosed, RCTDirectEventBlock)
RCT_EXPORT_VIEW_PROPERTY(onOperationResult, RCTDirectEventBlock)

RCT_EXPORT_METHOD(requestFocus:(nonnull NSNumber *)viewTag generation:(NSInteger)generation
                  requestId:(NSInteger)requestId targetTag:(NSInteger)targetTag)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    FRNCalloutView *view = (FRNCalloutView *)[self.bridge.uiManager viewForReactTag:viewTag];
    if (![view isKindOfClass:[FRNCalloutView class]]) return;
    [view requestFocus:generation requestId:requestId target:[self.bridge.uiManager viewForReactTag:@(targetTag)]];
  });
}
RCT_EXPORT_METHOD(close:(nonnull NSNumber *)viewTag generation:(NSInteger)generation requestId:(NSInteger)requestId)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    FRNCalloutView *view = (FRNCalloutView *)[self.bridge.uiManager viewForReactTag:viewTag];
    if ([view isKindOfClass:[FRNCalloutView class]]) [view close:generation requestId:requestId];
  });
}
RCT_EXPORT_METHOD(reposition:(nonnull NSNumber *)viewTag generation:(NSInteger)generation requestId:(NSInteger)requestId)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    FRNCalloutView *view = (FRNCalloutView *)[self.bridge.uiManager viewForReactTag:viewTag];
    if ([view isKindOfClass:[FRNCalloutView class]]) [view reposition:generation requestId:requestId];
  });
}

RCT_EXPORT_VIEW_PROPERTY(anchorRect, screenRect)

RCT_CUSTOM_VIEW_PROPERTY(directionalHint, NSRectEdge, FRNCalloutView)
{
  view.placementHint = [json isKindOfClass:[NSString class]] ? json : @"";
  view.directionalHint = json ? [RCTConvert NSRectEdge:json] : defaultView.directionalHint;
}

RCT_EXPORT_VIEW_PROPERTY(setInitialFocus, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

@end
