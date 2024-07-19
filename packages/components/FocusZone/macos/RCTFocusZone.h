#pragma once

#import <React/RCTComponent.h>
#import <React/RCTView.h>

typedef NS_ENUM(NSInteger, FocusZoneDirection) {
	FocusZoneDirectionBidirectional,
	FocusZoneDirectionHorizontal,
	FocusZoneDirectionVertical,
	FocusZoneDirectionNone
};

@interface RCTFocusZone : RCTView

@property(nonatomic) BOOL disabled;
@property(nonatomic) BOOL navigationOrderInRenderOrder;
@property(nonatomic) FocusZoneDirection focusZoneDirection;
@property(nonatomic) NSString *navigateAtEnd;
@property(nonatomic) NSView *defaultResponder;

@end
