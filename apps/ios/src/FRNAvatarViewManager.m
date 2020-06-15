//
//  Copyright (c) Microsoft Corporation. All rights reserved.
//  Licensed under the MIT License.
//

#import <React/RCTBridge.h>
#import <React/RCTView.h>

#import "FRNAvatar.h"
#import "FRNAvatarViewManager.h"

@implementation FRNAvatarViewManager
RCT_EXPORT_MODULE(FRNAvatar)

#pragma mark - RCTViewManager overrides

- (RCTView *)view {
  FRNAvatar *avatar = [[FRNAvatar alloc] initWithBridge:[self bridge]];
  return avatar;
}

@end
