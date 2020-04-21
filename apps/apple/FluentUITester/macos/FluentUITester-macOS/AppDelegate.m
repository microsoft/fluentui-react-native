#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>

@interface AppDelegate () <RCTBridgeDelegate>

@end

@implementation AppDelegate {
  RCTBridge *_bridge;
}

/*
 * Lazily create the bridge on demand
 * Returns the current instance of RCTBridge
*/
- (RCTBridge*)bridge {
  if (_bridge == nil) {
    _bridge = [[RCTBridge alloc] initWithDelegate:self launchOptions:nil];
  }
  return _bridge;
}

#pragma mark - RCTBridgeDelegate Methods

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:@"main"]; // .jsbundle;
}

@end
