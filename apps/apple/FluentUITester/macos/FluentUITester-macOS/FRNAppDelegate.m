#import "FRNAppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>

@interface FRNAppDelegate () <RCTBridgeDelegate>

@end

@implementation FRNAppDelegate

#pragma mark - RCTBridgeDelegate Methods

- (NSURL *)sourceURLForBridge:(__unused RCTBridge *)bridge {
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index" fallbackResource:@"main"]; // .jsbundle;
}

@end
