#import "RCTFocusZone.h"
#import "RCTFocusZoneManager.h"

@implementation RCTFocusZoneManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)

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
		AssertTag(json == nil, 0x228146d8 /* tag_86u1y */);
		[view setFocusZoneDirection:[defaultView focusZoneDirection]];
	}
}

RCT_CUSTOM_VIEW_PROPERTY(navigateAtEnd, NSString, RCTFocusZone)
{
	if ([json isEqualToString:@"NavigateStopAtEnds"])
	{
		[view setNavigateAtEnd:NavigateStopAtEnds];
	}
	else if ([json isEqualToString:@"NavigateWrap"] || [json isEqualToString:@"NavigateContinue"])
	{
		AssertTag(false, 0x228146d7 /* tag_86u1x */);	// NYI
		[view setNavigateAtEnd:NavigateStopAtEnds];
	}
	else
	{
		AssertTag(json == nil, 0x228146d6 /* tag_86u1w */);
		[view setNavigateAtEnd:[defaultView navigateAtEnd]];
	}
}

- (RCTView *)view
{
  return [[RCTFocusZone new] autorelease];
}

@end
