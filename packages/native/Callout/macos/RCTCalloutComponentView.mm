#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTCalloutComponentView.h"

#import <react/renderer/components/FRNCalloutSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNCalloutSpec/EventEmitters.h>
#import <react/renderer/components/FRNCalloutSpec/Props.h>
#import <react/renderer/components/FRNCalloutSpec/RCTComponentViewHelpers.h>
#import <react/renderer/components/view/ViewProps.h>

#import <React/RCTComponent.h>
#import <React/RCTComponentViewProtocol.h>
#import <React/RCTConversions.h>
#import <React/RCTSurfaceTouchHandler.h>
#import <React/RCTView.h>

#import "FRNCallout-Swift.h"

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

static RCTPlatformView *RCTFindCalloutAnchorInWindow(NSWindow *window, NSInteger tag)
{
  RCTPlatformView *match = RCTFindComponentViewWithTag(window.contentView, tag);
  if (match) {
    return match;
  }
  for (NSWindow *child in window.childWindows) {
    match = RCTFindCalloutAnchorInWindow(child, tag);
    if (match) {
      return match;
    }
  }
  return nil;
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
    _calloutView.managedEventsAttached = NO;

    __weak RCTCalloutComponentView *weakSelf = self;
    _calloutView.onShow = ^(__unused NSDictionary *event) {
      [weakSelf emitOnShow];
    };
    _calloutView.onDismiss = ^(__unused NSDictionary *event) {
      [weakSelf emitOnDismiss];
    };
    _calloutView.onReady = ^(NSDictionary *event) {
      RCTCalloutComponentView *strongSelf = weakSelf;
      if (strongSelf && strongSelf->_eventEmitter) {
        std::static_pointer_cast<const CalloutEventEmitter>(strongSelf->_eventEmitter)->onReady({
          .generation = [event[@"generation"] UTF8String]
        });
      }
    };
    _calloutView.onDismissContext = ^(NSDictionary *event) {
      RCTCalloutComponentView *strongSelf = weakSelf;
      if (strongSelf && strongSelf->_eventEmitter) {
        std::static_pointer_cast<const CalloutEventEmitter>(strongSelf->_eventEmitter)->onDismissContext({
          .generation = [event[@"generation"] UTF8String],
          .reason = [event[@"reason"] UTF8String],
          .returnFocus = [event[@"returnFocus"] UTF8String]
        });
      }
    };
    _calloutView.onManagedOperationResult = ^(NSDictionary *event) {
      RCTCalloutComponentView *strongSelf = weakSelf;
      if (strongSelf && strongSelf->_eventEmitter) {
        std::static_pointer_cast<const CalloutEventEmitter>(strongSelf->_eventEmitter)->onManagedOperationResult({
          .generation = [event[@"generation"] UTF8String],
          .requestId = [event[@"requestId"] UTF8String],
          .operation = [event[@"operation"] UTF8String],
          .status = [event[@"status"] UTF8String],
          .returnFocus = [event[@"returnFocus"] UTF8String]
        });
      }
    };
    _calloutView.onMenuPointerMove = ^(NSDictionary *event) {
      RCTCalloutComponentView *strongSelf = weakSelf;
      if (strongSelf && strongSelf->_eventEmitter) {
        std::static_pointer_cast<const CalloutEventEmitter>(strongSelf->_eventEmitter)->onMenuPointerMove({
          .generation = [event[@"generation"] UTF8String],
          .pointerId = [event[@"pointerId"] UTF8String],
          .screenX = [event[@"screenX"] doubleValue],
          .screenY = [event[@"screenY"] doubleValue],
          .targetTag = [event[@"targetTag"] intValue]
        });
      }
    };
    _calloutView.isManagedTargetEligible = ^BOOL(NSView *view) {
      if (![view isKindOfClass:[RCTViewComponentView class]]) {
        return NO;
      }
      const auto props = std::static_pointer_cast<const ViewProps>([(id<RCTComponentViewProtocol>)view props]);
      return props->focusable && (!props->accessibilityState.has_value() || !props->accessibilityState->disabled);
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
  const auto &newProps = *std::static_pointer_cast<const CalloutProps>(props);

  _calloutView.directionalHint = RCTNSRectEdgeFromDirectionalHint(newProps.directionalHint);
  _calloutView.setInitialFocus = newProps.setInitialFocus;
  if (_calloutView.menuFocusManagement && !newProps.menuFocusManagement) {
    [_calloutView resetManagedPresentation];
  }
  _calloutView.menuFocusManagement = newProps.menuFocusManagement;

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

- (void)updateEventEmitter:(const EventEmitter::Shared &)eventEmitter
{
  [super updateEventEmitter:eventEmitter];
  _calloutView.managedEventsAttached = _eventEmitter != nullptr;
  [_calloutView finalizeManagedPresentation];
}

- (void)viewDidMoveToWindow
{
  [super viewDidMoveToWindow];
  [self updateAnchorView];
  [_calloutView finalizeManagedPresentation];
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
  [_calloutView resetManagedPresentation];
  [super prepareForRecycle];
  _targetTag = 0;
  [_calloutView setAnchorView:nil];
}

- (void)finalizeUpdates:(RNComponentViewUpdateMask)updateMask
{
  [super finalizeUpdates:updateMask];
  [self updateAnchorView];
  [_calloutView finalizeManagedPresentation];
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

- (void)focusInitialChild:(NSString *)generation requestId:(NSString *)requestId targetTag:(NSInteger)targetTag
{
  [_calloutView focusInitialChild:generation requestId:requestId targetTag:@(targetTag)];
}

- (void)closeOwned:(NSString *)generation requestId:(NSString *)requestId reason:(NSString *)reason returnFocus:(BOOL)returnFocus
{
  [_calloutView closeOwned:generation requestId:requestId reason:reason returnFocus:returnFocus];
}

- (void)focusOwnedChild:(NSString *)generation requestId:(NSString *)requestId targetTag:(NSInteger)targetTag intent:(NSString *)intent
{
  [_calloutView focusOwnedChild:generation requestId:requestId targetTag:@(targetTag) intent:intent];
}

- (void)updateAnchorView
{
  NSWindow *owner = self.window;
  if (_calloutView.menuFocusManagement) {
    while (owner.parentWindow) {
      owner = owner.parentWindow;
    }
  }
  [_calloutView setAnchorView:_targetTag > 0 && owner ? RCTFindCalloutAnchorInWindow(owner, _targetTag) : nil];
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
