#import "FRNViewController.h"
#import "FRNAppDelegate.h"

#import <React/RCTBundleURLProvider.h>
#import <React/RCTBridge.h>
#import <React/RCTRootView.h>

@interface FRNViewController () <RCTBridgeDelegate>

@end

@implementation FRNViewController

- (void)loadView {
  // The delegate must conform to RCTBridgeDelegate to retrieve the JS source file for the packager
  RCTBridge *bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
  RCTRootView *rootView = [[RCTRootView alloc] initWithBridge:bridge moduleName:@"FluentUITester" initialProperties:nil];

  [self setView:rootView];
}

#pragma mark - RCTBridgeDelegate Methods

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:@"main"]; // .jsbundle;
}

@end
