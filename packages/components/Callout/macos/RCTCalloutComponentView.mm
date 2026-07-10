//
//  RCTCalloutComponentView.mm
//  FRNCallout
//
//  Copyright (c) Microsoft Corporation.
//  Licensed under the MIT License.
//

#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTCalloutComponentView.h"

#import <react/renderer/components/FRNCalloutSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNCalloutSpec/EventEmitters.h>
#import <react/renderer/components/FRNCalloutSpec/Props.h>
#import <react/renderer/components/FRNCalloutSpec/RCTComponentViewHelpers.h>

#import <React/RCTBridge.h>
#import <React/RCTBridge+Private.h>
#import <React/RCTComponent.h>
#import <React/RCTView.h>
#import <React/RCTSurfacePresenterStub.h>
#import <React/RCTSurfaceTouchHandler.h>

// Swift interop header generated for the FRNCallout module. Provides `FRNCalloutView`, the shared
// AppKit view that manages the floating Callout window and positioning logic (reused by both the
// Paper view manager and this Fabric component view).
//
// It must be imported after the React headers above: the generated header references `RCTView`
// (the Swift view's superclass) and `RCTDirectEventBlock` (its onShow/onDismiss properties), which
// come from <React/RCTView.h> / <React/RCTComponent.h>.
#import "FRNCallout-Swift.h"

using namespace facebook::react;

/// Collapses the 15 JS directional hints to the 4 `NSRectEdge` values the macOS Callout supports,
/// mirroring the RCTConvert mapping used by the legacy (Paper) FRNCalloutManager.
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
  return NSRectEdgeMaxY;
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

    // Surface the Callout's show/dismiss lifecycle through the Fabric event emitter. The Swift view
    // passes a payload dictionary (unused here) as it does for the Paper RCTDirectEventBlock path.
    __weak RCTCalloutComponentView *weakSelf = self;
    _calloutView.onShow = ^(__unused NSDictionary *event) {
      [weakSelf emitOnShow];
    };
    _calloutView.onDismiss = ^(__unused NSDictionary *event) {
      [weakSelf emitOnDismiss];
    };

    // The Callout content lives in a separate floating window, so the normal surface touch handling
    // doesn't reach it. Attach a dedicated Fabric touch handler to the proxied content view.
    _touchHandler = [RCTSurfaceTouchHandler new];
    [_touchHandler attachToView:_calloutView.contentProxyView];

    self.contentView = _calloutView;
  }
  return self;
}

#pragma mark - Children (mounted into the floating Callout window)

- (void)mountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_calloutView mountContentSubview:childComponentView at:index];
}

- (void)unmountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)childComponentView index:(__unused NSInteger)index
{
  [_calloutView unmountContentSubview:childComponentView];
}

#pragma mark - Props

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RCTCalloutProps>(props);

  _calloutView.directionalHint = RCTNSRectEdgeFromDirectionalHint(newProps.directionalHint);
  _calloutView.setInitialFocus = newProps.setInitialFocus;

  const auto &rect = newProps.anchorRect;
  _calloutView.anchorRect = NSMakeRect(rect.screenX, rect.screenY, rect.width, rect.height);

  // `target` is a React tag (from findNodeHandle on the JS side). Resolve it to its mounted view via
  // the surface presenter — the Fabric equivalent of the Paper `bridge.uiManager.view(forReactTag:)`
  // lookup. When no target is provided we fall back on `anchorRect`.
  NSInteger targetTag = 0;
  if (newProps.target.isNumber()) {
    targetTag = (NSInteger)newProps.target.asDouble();
  }
  [_calloutView setAnchorView:[self anchorViewForTag:targetTag]];

  [super updateProps:props oldProps:oldProps];
}

- (void)updateLayoutMetrics:(const LayoutMetrics &)layoutMetrics
           oldLayoutMetrics:(const LayoutMetrics &)oldLayoutMetrics
{
  [super updateLayoutMetrics:layoutMetrics oldLayoutMetrics:oldLayoutMetrics];
  const auto size = layoutMetrics.frame.size;
  [_calloutView updateContentSize:NSMakeSize(size.width, size.height)];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  [_calloutView setAnchorView:nil];
}

#pragma mark - Commands

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

#pragma mark - Private

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
    // `target` is part of the generated event payload but isn't consumed by the JS Callout (its
    // onShow/onDismiss take no arguments); macOS Fabric views don't expose a settable react tag, so 0.
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

#endif // RCT_NEW_ARCH_ENABLED
