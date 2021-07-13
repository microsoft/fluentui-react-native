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
		[view setNavigateAtEnd:NavigateStopAtEnds];
	}
	else
	{
		[view setNavigateAtEnd:[defaultView navigateAtEnd]];
	}
}

- (RCTView *)view
{
  return [RCTFocusZone new];
}

@end
