// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

#import "RCTFocusZone.h"
#import <React/RCTConvert.h>
#import <React/RCTUIManager.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FocusZoneViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)

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

@end
