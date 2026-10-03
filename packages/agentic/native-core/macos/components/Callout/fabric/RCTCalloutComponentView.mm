#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTCalloutComponentView.h"

#import <react/renderer/components/FRNNativeCoreSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNNativeCoreSpec/EventEmitters.h>
#import <react/renderer/components/FRNNativeCoreSpec/Props.h>
#import <react/renderer/components/FRNNativeCoreSpec/RCTComponentViewHelpers.h>

#import <React/RCTComponent.h>
#import <React/RCTComponentViewProtocol.h>
#import <React/RCTConversions.h>
#import <React/RCTSurfaceTouchHandler.h>
#import <React/RCTView.h>

#import "FRNNativeCore-Swift.h"
#import "../../../shared/FRNNativeCoreComponentLookup.h"

using namespace facebook::react;

static NSRectEdge RCTNSRectEdgeFromDirectionalHint(CalloutDirectionalHint hint)
{
  // CalloutView uses MinY for placement above the anchor and MaxY for placement below it.
  switch (hint) {
    case CalloutDirectionalHint::LeftTopEdge:
    case CalloutDirectionalHint::LeftCenter:
    case CalloutDirectionalHint::LeftBottomEdge:
      return NSRectEdgeMinX;
    case CalloutDirectionalHint::TopLeftEdge:
    case CalloutDirectionalHint::TopAutoEdge:
    case CalloutDirectionalHint::TopCenter:
    case CalloutDirectionalHint::TopRightEdge:
      return NSRectEdgeMinY;
    case CalloutDirectionalHint::RightTopEdge:
    case CalloutDirectionalHint::RightCenter:
    case CalloutDirectionalHint::RightBottomEdge:
      return NSRectEdgeMaxX;
    case CalloutDirectionalHint::BottomLeftEdge:
    case CalloutDirectionalHint::BottomAutoEdge:
    case CalloutDirectionalHint::BottomCenter:
    case CalloutDirectionalHint::BottomRightEdge:
      return NSRectEdgeMaxY;
  }
}

static void RCTApplyCalloutAppearance(
    FRNCalloutView *calloutView,
    const CalloutProps &props,
    const LayoutMetrics &layoutMetrics)
{
  const auto borderMetrics = props.resolveBorderMetrics(layoutMetrics);
  calloutView.backgroundColor = RCTUIColorFromSharedColor(props.backgroundColor) ?: NSColor.clearColor;
  calloutView.borderColor = RCTUIColorFromSharedColor(borderMetrics.borderColors.left) ?: NSColor.clearColor;
  calloutView.borderWidth = borderMetrics.borderWidths.left;
  calloutView.borderRadius = borderMetrics.borderRadii.topLeft.horizontal;
  [calloutView setNeedsDisplay:YES];
}

@interface RCTCalloutComponentView () <RCTCalloutViewProtocol>
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
    static const auto defaultProps = std::make_shared<const CalloutProps>();
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
    _calloutView.onReady = ^(NSDictionary *event) { [weakSelf emitReady:event]; };
    _calloutView.onClosed = ^(NSDictionary *event) { [weakSelf emitClosed:event]; };
    _calloutView.onOperationResult = ^(NSDictionary *event) { [weakSelf emitResult:event]; };

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
  const auto &newProps = *std::static_pointer_cast<const CalloutProps>(props);

  _calloutView.commandGeneration = newProps.commandGeneration;
  _calloutView.anchorMode = [NSString stringWithUTF8String:toString(newProps.anchorMode).c_str()];
  _calloutView.placementHint = [NSString stringWithUTF8String:toString(newProps.directionalHint).c_str()];
  _calloutView.gapSpace = newProps.gapSpace;
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

  const auto &props = *std::static_pointer_cast<const CalloutProps>(_props);
  RCTApplyCalloutAppearance(_calloutView, props, layoutMetrics);
}

- (void)prepareForRecycle
{
  [_calloutView invalidatePresentation];
  [super prepareForRecycle];
  _targetTag = 0;
  [_calloutView setAnchorView:nil];
}

- (void)handleCommand:(const NSString *)commandName args:(const NSArray *)args
{
  RCTCalloutHandleCommand(self, commandName, args);
}

- (void)focusWindow
{
  [_calloutView focusWindow];
}

- (void)blurWindow
{
  [_calloutView blurWindow];
}

- (void)requestFocus:(NSInteger)generation requestId:(NSInteger)requestId targetTag:(NSInteger)targetTag
{
  [_calloutView requestFocus:generation requestId:requestId
                     target:FRNNativeCoreFindView(_calloutView.contentProxyView, targetTag)];
}
- (void)close:(NSInteger)generation requestId:(NSInteger)requestId
{
  [_calloutView close:generation requestId:requestId];
}
- (void)reposition:(NSInteger)generation requestId:(NSInteger)requestId
{
  [_calloutView reposition:generation requestId:requestId];
}
- (void)emitReady:(NSDictionary *)event
{
  if (_eventEmitter) std::static_pointer_cast<const CalloutEventEmitter>(_eventEmitter)->onReady(
      {.generation = [event[@"generation"] intValue]});
}
- (void)emitClosed:(NSDictionary *)event
{
  if (_eventEmitter) std::static_pointer_cast<const CalloutEventEmitter>(_eventEmitter)->onClosed(
      {.generation = [event[@"generation"] intValue], .reason = std::string([event[@"reason"] UTF8String])});
}
- (void)emitResult:(NSDictionary *)event
{
  if (_eventEmitter) std::static_pointer_cast<const CalloutEventEmitter>(_eventEmitter)->onOperationResult(
      {.generation = [event[@"generation"] intValue], .requestId = [event[@"requestId"] intValue],
       .status = std::string([event[@"status"] UTF8String])});
}

- (void)updateAnchorView
{
  RCTPlatformView *rootView = self.window.contentView;
  [_calloutView setAnchorView:_targetTag > 0 && rootView ? FRNNativeCoreFindView(rootView, _targetTag) : nil];
}

- (void)emitOnShow
{
  if (_eventEmitter) {
    std::static_pointer_cast<const CalloutEventEmitter>(_eventEmitter)->onShow({.target = 0});
  }
}

- (void)emitOnDismiss
{
  if (_eventEmitter) {
    std::static_pointer_cast<const CalloutEventEmitter>(_eventEmitter)->onDismiss({.target = 0});
  }
}

@end

#endif
