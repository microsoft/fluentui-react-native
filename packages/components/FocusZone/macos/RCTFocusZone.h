#pragma once

#import <React/RCTComponent.h>
#import <React/RCTView.h>

typedef NS_ENUM(NSInteger, FocusZoneDirection) {
	FocusZoneDirectionBidirectional,
	FocusZoneDirectionHorizontal,
	FocusZoneDirectionVertical,
	FocusZoneDirectionNone
};

typedef enum {
	NavigateStopAtEnds,
} NavigateAtEnd;

@interface RCTFocusZone : RCTView

@property(nonatomic) BOOL disabled;
@property(nonatomic) FocusZoneDirection focusZoneDirection;
@property(nonatomic) NavigateAtEnd navigateAtEnd;

@end
