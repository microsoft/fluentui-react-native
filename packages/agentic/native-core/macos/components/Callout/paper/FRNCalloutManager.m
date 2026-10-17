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

@end

@interface RCT_EXTERN_MODULE(RCTCalloutManager, RCTViewManager)

RCT_EXTERN_METHOD(focusWindow : (nonnull NSNumber *)viewTag)

RCT_EXTERN_METHOD(blurWindow : (nonnull NSNumber *)viewTag)

RCT_EXTERN_METHOD(requestFocus : (nonnull NSNumber *)viewTag generation : (NSInteger)generation requestId : (NSInteger)requestId targetTag : (NSInteger)targetTag strategy : (NSString *)strategy)

RCT_EXTERN_METHOD(close : (nonnull NSNumber *)viewTag generation : (NSInteger)generation requestId : (NSInteger)requestId)

RCT_EXTERN_METHOD(reposition : (nonnull NSNumber *)viewTag generation : (NSInteger)generation requestId : (NSInteger)requestId)

RCT_CUSTOM_VIEW_PROPERTY(target, NSNumber, RCTView)
{
  NSNumber *tag = [RCTConvert NSNumber:json];
  NSView *anchor = tag ? [self.bridge.uiManager viewForReactTag:tag] : nil;
  if (tag && !anchor) {
    RCTLogError(@"Callout target %@ is not mounted in its bridge.", tag);
  }
  [(id<FRNCalloutPropertyManager>)self setAnchor:anchor forView:view];
}

RCT_EXPORT_VIEW_PROPERTY(commandGeneration, NSInteger)

RCT_EXPORT_VIEW_PROPERTY(anchorMode, NSString)

RCT_EXPORT_VIEW_PROPERTY(gapSpace, CGFloat)

RCT_EXPORT_VIEW_PROPERTY(onReady, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onClosed, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onOperationResult, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(anchorRect, screenRect)

// The shared view derives its preferred edge and alignment from the hint name.
RCT_REMAP_VIEW_PROPERTY(directionalHint, placementHint, NSString)

RCT_EXPORT_VIEW_PROPERTY(setInitialFocus, BOOL)

RCT_EXPORT_VIEW_PROPERTY(onShow, RCTDirectEventBlock)

RCT_EXPORT_VIEW_PROPERTY(onDismiss, RCTDirectEventBlock)

@end

@interface RCT_EXTERN_MODULE(FRNCalloutManager, RCTCalloutManager)
@end
