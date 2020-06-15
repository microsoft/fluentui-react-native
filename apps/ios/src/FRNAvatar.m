#import <React/RCTBridge.h>
#import <React/RCTUIManager.h>
#import <FluentUI/MicrosoftFluentUI-umbrella.h>

#import "FRNAvatar.h"

@implementation FRNAvatar {
  RCTBridge *_bridge;
}

// TODO- expose MSAvatarView props as macros that we can pass through from the JS to the wrapped control

- (instancetype)initWithBridge:(RCTBridge *)bridge {
  RCTAssertParam(bridge);

  if (self = [super initWithFrame:CGRectZero]) {
    _bridge = bridge;
    
    // TODO- Consume the MSAvatarView from MicrosoftFluentUI and add it as a subview
  }
  return self;
}

@end
