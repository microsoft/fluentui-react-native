#ifdef RCT_NEW_ARCH_ENABLED

#import "FRNNativeCoreDialogWindowComponentView.h"
#import <React/RCTComponent.h>
#import <React/RCTConversions.h>
#import <React/RCTSurfaceTouchHandler.h>
#import <React/RCTView.h>
#import <react/renderer/components/FRNNativeCoreSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNNativeCoreSpec/EventEmitters.h>
#import <react/renderer/components/FRNNativeCoreSpec/Props.h>
#import "FRNNativeCore-Swift.h"

using namespace facebook::react;

@implementation FRNNativeCoreDialogWindowComponentView {
  FRNNativeCoreDialogWindowView *_host;
  RCTSurfaceTouchHandler *_touchHandler;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<FRNNativeCoreDialogWindowComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static const auto defaults = std::make_shared<const FRNNativeCoreDialogWindowProps>();
    _props = defaults;
    _host = [[FRNNativeCoreDialogWindowView alloc] initWithFrame:self.bounds];
    _touchHandler = [RCTSurfaceTouchHandler new];
    [_touchHandler attachToView:_host.contentHost];
    self.contentView = _host;
    __weak FRNNativeCoreDialogWindowComponentView *weakSelf = self;
    _host.onEvent = ^(NSString *kind) {
      FRNNativeCoreDialogWindowComponentView *view = weakSelf;
      if (!view || !view->_eventEmitter) return;
      std::static_pointer_cast<const FRNNativeCoreDialogWindowEventEmitter>(view->_eventEmitter)
          ->onWindowEvent({.kind = kind.UTF8String});
    };
  }
  return self;
}

- (void)mountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)child index:(NSInteger)index
{
  [_host mountContent:child at:index];
}

- (void)unmountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)child index:(__unused NSInteger)index
{
  [_host unmountContent:child];
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  [super updateProps:props oldProps:oldProps];
  const auto &next = static_cast<const FRNNativeCoreDialogWindowProps &>(*props);
  _host.windowLabel = RCTNSStringFromString(next.windowLabel);
  _host.mode = [NSString stringWithUTF8String:toString(next.mode).c_str()];
  _host.shown = next.shown;
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
  const auto size = layoutMetrics.frame.size;
  [_host updateContentSize:NSMakeSize(size.width, size.height)];
}

- (void)prepareForRecycle
{
  _host.shown = NO;
  [_host invalidatePresentation];
  [super prepareForRecycle];
}

@end

#endif
