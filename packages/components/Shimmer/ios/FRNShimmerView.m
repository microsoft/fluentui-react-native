#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>

#import "FluentUI-Swift.h"
//#import <FluentUI/FluentUI.h>

#import "FRNShimmerView.h"

@implementation FRNShimmerView {
	RCTBridge *_bridge;
	MSFShimmerLinesView *_shimmerLinesView;
}

- (instancetype)initWithBridge:(RCTBridge *)bridge {
	RCTAssertParam(bridge);

	if (self = [super initWithFrame:CGRectZero]) {
		_bridge = bridge;

		_shimmerLinesView = [[MSFShimmerLinesView alloc] init];
		[self addSubview:_shimmerLinesView];
	}
	return self;
}

@end
