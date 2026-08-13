#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTCalloutComponentView.h"

#import <react/renderer/components/FRNCalloutSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNCalloutSpec/EventEmitters.h>
#import <react/renderer/components/FRNCalloutSpec/Props.h>
#import <react/renderer/components/FRNCalloutSpec/RCTComponentViewHelpers.h>

#import <React/RCTBridge+Private.h>
#import <React/RCTBridge.h>
#import <React/RCTComponent.h>
#import <React/RCTConversions.h>
#import <React/RCTSurfacePresenterStub.h>
#import <React/RCTSurfaceTouchHandler.h>
#import <React/RCTView.h>

#import "FRNCallout-Swift.h"

using namespace facebook::react;

static NSRectEdge RCTNSRectEdgeFromDirectionalHint(RCTCalloutDirectionalHint hint)
{
  switch (hint) {
    case RCTCalloutDirectionalHint::LeftTopEdge:
    case RCTCalloutDirectionalHint::LeftCenter:
    case RCTCalloutDirectionalHint::LeftBottomEdge:
      return NSRectEdgeMinX;
    case RCTCalloutDirectionalHint::TopLeftEdge:
    case RCTCalloutDirectionalHint::TopAutoEdge:
    case RCTCalloutDirectionalHint::TopCenter:
    case RCTCalloutDirectionalHint::TopRightEdge:
      return NSRectEdgeMaxY;
    case RCTCalloutDirectionalHint::RightTopEdge:
    case RCTCalloutDirectionalHint::RightCenter:
    case RCTCalloutDirectionalHint::RightBottomEdge:
      return NSRectEdgeMaxX;
    case RCTCalloutDirectionalHint::BottomLeftEdge:
    case RCTCalloutDirectionalHint::BottonLeftEdge:
    case RCTCalloutDirectionalHint::BottomAutoEdge:
    case RCTCalloutDirectionalHint::BottomCenter:
    case RCTCalloutDirectionalHint::BottomRightEdge:
      return NSRectEdgeMinY;
  }
}

static void RCTApplyCalloutAppearance(
    FRNCalloutView *calloutView,
    const RCTCalloutProps &props,
    const LayoutMetrics &layoutMetrics)
{
  const auto borderMetrics = props.resolveBorderMetrics(layoutMetrics);
  calloutView.backgroundColor = RCTUIColorFromSharedColor(props.backgroundColor) ?: NSColor.clearColor;
  calloutView.borderColor = RCTUIColorFromSharedColor(borderMetrics.borderColors.left) ?: NSColor.clearColor;
  calloutView.borderWidth = borderMetrics.borderWidths.left;
  calloutView.borderRadius = borderMetrics.borderRadii.topLeft.horizontal;
  [calloutView setNeedsDisplay:YES];
}

@interface RCTCalloutComponentView () <RCTRCTCalloutViewProtocol>
@end

@implementation RCTCalloutComponentView {
  FRNCalloutView *_calloutView;
  RCTSurfaceTouchHandler *_touchHandler;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RCTCalloutComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RCTCalloutProps>();
    _props = defaultProps;

    _calloutView = [[FRNCalloutView alloc] initWithFrame:self.bounds];

    __weak RCTCalloutComponentView *weakSelf = self;
    _calloutView.onShow = ^(__unused NSDictionary *event) {
      [weakSelf emitOnShow];
    };
    _calloutView.onDismiss = ^(__unused NSDictionary *event) {
      [weakSelf emitOnDismiss];
    };

    _touchHandler = [RCTSurfaceTouchHandler new];
    [_touchHandler attachToView:_calloutView.contentProxyView];

    self.contentView = _calloutView;
  }
  return self;
}

- (void)mountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_calloutView mountContentSubview:childComponentView at:index];
}

- (void)unmountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)childComponentView index:(__unused NSInteger)index
{
  [_calloutView unmountContentSubview:childComponentView];
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RCTCalloutProps>(props);

  _calloutView.directionalHint = RCTNSRectEdgeFromDirectionalHint(newProps.directionalHint);
  _calloutView.setInitialFocus = newProps.setInitialFocus;

  const auto &rect = newProps.anchorRect;
  _calloutView.anchorRect = NSMakeRect(rect.screenX, rect.screenY, rect.width, rect.height);

  NSInteger targetTag = 0;
  if (newProps.target.isNumber()) {
    targetTag = (NSInteger)newProps.target.asDouble();
  }
  [_calloutView setAnchorView:[self anchorViewForTag:targetTag]];
  RCTApplyCalloutAppearance(_calloutView, newProps, _layoutMetrics);

  [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];

  const auto size = layoutMetrics.frame.size;
  [_calloutView updateContentSize:NSMakeSize(size.width, size.height)];

  const auto &props = *std::static_pointer_cast<const RCTCalloutProps>(_props);
  RCTApplyCalloutAppearance(_calloutView, props, layoutMetrics);
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [_calloutView setAnchorView:nil];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTRCTCalloutHandleCommand(self, commandName, args);
}

- (void)focusWindow
{
  [_calloutView focusWindow];
}

- (void)blurWindow
{
  [_calloutView blurWindow];
}

- (nullable RCTPlatformView *)anchorViewForTag:(NSInteger)tag
{
  if (tag <= 0) {
    return nil;
  }

  id<RCTSurfacePresenterStub> surfacePresenter = [RCTBridge currentBridge].surfacePresenter;
  return [surfacePresenter findComponentViewWithTag_DO_NOT_USE_DEPRECATED:tag];
}

- (void)emitOnShow
{
  if (_eventEmitter) {
    std::static_pointer_cast<const RCTCalloutEventEmitter>(_eventEmitter)->onShow({.target = 0});
  }
}

- (void)emitOnDismiss
{
  if (_eventEmitter) {
    std::static_pointer_cast<const RCTCalloutEventEmitter>(_eventEmitter)->onDismiss({.target = 0});
  }
}

@end

#endif
