#import "../shared/RCTFocusZone.h"
#import "RCTFocusZoneManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUIManager.h>

@implementation RCTFocusZoneManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)
RCT_EXPORT_VIEW_PROPERTY(commandGeneration, NSInteger)
RCT_EXPORT_VIEW_PROPERTY(onOperationResult, RCTDirectEventBlock)

RCT_EXPORT_METHOD(requestFocus:(nonnull NSNumber *)viewTag
                  generation:(NSInteger)generation
                  requestId:(NSInteger)requestId
                  targetTag:(NSInteger)targetTag
                  strategy:(NSString *)strategy)
{
  dispatch_async(dispatch_get_main_queue(), ^{
    RCTFocusZone *view = (RCTFocusZone *)[self.bridge.uiManager viewForReactTag:viewTag];
    if (![view isKindOfClass:[RCTFocusZone class]]) return;
    NSView *target = targetTag > 0 ? [self.bridge.uiManager viewForReactTag:@(targetTag)] : nil;
    NSString *status = [view requestFocusTarget:target strategy:strategy generation:generation];
    if (view.onOperationResult) view.onOperationResult(@{@"generation": @(generation), @"requestId": @(requestId), @"status": status});
  });
}

RCT_CUSTOM_VIEW_PROPERTY(navigationOrderInRenderOrder, BOOL, RCTFocusZone)
{
	[view setNavigationOrderInRenderOrder:[json boolValue]];
	[[view window] recalculateKeyViewLoop];
}

RCT_CUSTOM_VIEW_PROPERTY(focusZoneDirection, NSString, RCTFocusZone)
{
	if ([json isEqualToString:@"bidirectional"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionBidirectional];
	}
	else if ([json isEqualToString:@"vertical"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionVertical];
	}
	else if ([json isEqualToString:@"horizontal"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionHorizontal];
	}
	else if ([json isEqualToString:@"none"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionNone];
	}
	else
	{
		[view setFocusZoneDirection:[defaultView focusZoneDirection]];
	}
}

RCT_EXPORT_VIEW_PROPERTY(navigateAtEnd, NSString)
RCT_EXPORT_VIEW_PROPERTY(tabKeyNavigation, NSString)

RCT_CUSTOM_VIEW_PROPERTY(defaultTabbableElement, NSNumber, RCTFocusZone)
{
	NSNumber *tag = [RCTConvert NSNumber:json];
	RCTUIManager *manager = [[self bridge] uiManager];
	NSView *defaultResponder = [manager viewForReactTag:tag];
	[view setDefaultResponder:defaultResponder];
}

- (RCTView *)view
{
  return [RCTFocusZone new];
}

@end
