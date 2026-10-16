#pragma once

#ifdef RCT_NEW_ARCH_ENABLED
#import <React/RCTComponentViewProtocol.h>

RCTPlatformView *FRNNativeCoreFindView(RCTPlatformView *root, NSInteger tag);
#endif
