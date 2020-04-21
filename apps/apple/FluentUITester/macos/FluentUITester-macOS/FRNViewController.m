#import "FRNViewController.h"
#import "FRNAppDelegate.h"

#import <React/RCTRootView.h>

@implementation FRNViewController

- (void)loadView {
  // The delegate must conform to RCTBridgeDelegate to retrieve the JS source file for the packager
  id<RCTBridgeDelegate> delegate = (id<RCTBridgeDelegate>)[NSApp delegate];
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:delegate launchOptions:nil];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"FluentUITester" initialProperties:nil];

  [self setView:rootView];
}

@end
