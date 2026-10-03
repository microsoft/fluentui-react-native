#ifdef RCT_NEW_ARCH_ENABLED
#import "FRNNativeCoreComponentLookup.h"

RCTPlatformView *FRNNativeCoreFindView(RCTPlatformView *root, NSInteger tag)
{
  if (tag <= 0) return nil;
  if ([root conformsToProtocol:@protocol(RCTComponentViewProtocol)] &&
      [((id<RCTComponentViewProtocol>)root).reactTag integerValue] == tag) return root;
  for (RCTPlatformView *child in root.subviews) {
    RCTPlatformView *found = FRNNativeCoreFindView(child, tag);
    if (found) return found;
  }
  return nil;
}
#endif
