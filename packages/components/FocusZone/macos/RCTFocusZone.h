#import <React/RCTComponent.h>
#import <React/RCTView.h>

typedef enum
{
  FocusZoneDirectionBidirectional,
  FocusZoneDirectionHorizontal,
  FocusZoneDirectionVertical,
  FocusZoneDirectionNone
} FocusZoneDirection;

typedef enum
{
  NavigateStopAtEnds,
} NavigateAtEnd;

@interface RCTFocusZone : RCTView

@property(nonatomic) BOOL disabled;
@property(nonatomic) FocusZoneDirection focusZoneDirection;
@property(nonatomic) NavigateAtEnd navigateAtEnd;

@end