#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTCalloutComponentView.h"

#import <react/renderer/components/FRNCalloutSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNCalloutSpec/EventEmitters.h>
#import <react/renderer/components/FRNCalloutSpec/Props.h>
#import <react/renderer/components/FRNCalloutSpec/RCTComponentViewHelpers.h>

#import <React/RCTComponent.h>
#import <React/RCTComponentViewProtocol.h>
#import <React/RCTConversions.h>
#import <React/RCTSurfaceTouchHandler.h>
#import <React/RCTView.h>

#import "FRNCallout-Swift.h"

using namespace facebook::react;

namespace facebook::react {

extern const char CalloutComponentName[] = "Callout";

using CalloutShadowNode = ConcreteViewShadowNode<
    CalloutComponentName,
    RCTCalloutProps,
    RCTCalloutEventEmitter,
    RCTCalloutState>;
using CalloutComponentDescriptor = ConcreteComponentDescriptor<CalloutShadowNode>;

} // namespace facebook::react

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

static RCTPlatformView *RCTFindComponentViewWithTag(RCTPlatformView *rootView, NSInteger tag)
{
  if ([rootView conformsToProtocol:@protocol(RCTComponentViewProtocol)] &&
      [((id<RCTComponentViewProtocol>)rootView).reactTag integerValue] == tag) {
    return rootView;
  }

  for (RCTPlatformView *subview in rootView.subviews) {
    RCTPlatformView *match = RCTFindComponentViewWithTag(subview, tag);
    if (match) {
      return match;
    }
  }

  return nil;
}

@interface RCTCalloutComponentView () <RCTRCTCalloutViewProtocol>
@end

@implementation RCTCalloutComponentView {
  FRNCalloutView *_calloutView;
  NSInteger _targetTag;
  RCTSurfaceTouchHandler *_touchHandler;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  // Fabric normalizes the legacy RCT-prefixed view name before component lookup.
  return concreteComponentDescriptorProvider<CalloutComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RCTCalloutProps>();
    _props = defaultProps;

    // This view manages content mounted in the Callout window and must not render in the React surface.
    self.hidden = YES;

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

  _targetTag = 0;
  if (newProps.target.isNumber()) {
    _targetTag = (NSInteger)newProps.target.asDouble();
  }
  [self updateAnchorView];
  RCTApplyCalloutAppearance(_calloutView, newProps, _layoutMetrics);

  [super updateProps:props oldProps:oldProps];
}

- (void)viewDidMoveToWindow
{
  [super viewDidMoveToWindow];
  [self updateAnchorView];
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
  _targetTag = 0;
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

- (void)updateAnchorView
{
  RCTPlatformView *rootView = self.window.contentView;
  [_calloutView setAnchorView:_targetTag > 0 && rootView ? RCTFindComponentViewWithTag(rootView, _targetTag) : nil];
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
