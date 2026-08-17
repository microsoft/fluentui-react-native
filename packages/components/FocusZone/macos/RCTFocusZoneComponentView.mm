#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTFocusZoneComponentView.h"

#import <react/renderer/components/FRNFocusZoneSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNFocusZoneSpec/EventEmitters.h>
#import <react/renderer/components/FRNFocusZoneSpec/Props.h>
#import <react/renderer/components/FRNFocusZoneSpec/RCTComponentViewHelpers.h>

#import <React/RCTComponentViewProtocol.h>

#import "RCTFocusZone.h"

using namespace facebook::react;

namespace facebook::react {

extern const char FocusZoneComponentName[] = "FocusZone";

using FocusZoneShadowNode = ConcreteViewShadowNode<
    FocusZoneComponentName,
    RCTFocusZoneProps,
    RCTFocusZoneEventEmitter,
    RCTFocusZoneState>;
using FocusZoneComponentDescriptor = ConcreteComponentDescriptor<FocusZoneShadowNode>;

} // namespace facebook::react

static FocusZoneDirection RCTFocusZoneDirectionFromProp(RCTFocusZoneFocusZoneDirection direction)
{
  switch (direction) {
    case RCTFocusZoneFocusZoneDirection::Bidirectional:
      return FocusZoneDirectionBidirectional;
    case RCTFocusZoneFocusZoneDirection::Horizontal:
      return FocusZoneDirectionHorizontal;
    case RCTFocusZoneFocusZoneDirection::Vertical:
      return FocusZoneDirectionVertical;
    case RCTFocusZoneFocusZoneDirection::None:
      return FocusZoneDirectionNone;
  }
}

static NSString *RCTNavigateAtEndFromProp(RCTFocusZoneNavigateAtEnd navigateAtEnd)
{
  switch (navigateAtEnd) {
    case RCTFocusZoneNavigateAtEnd::NavigateStopAtEnds:
      return @"NavigateStopAtEnds";
    case RCTFocusZoneNavigateAtEnd::NavigateWrap:
      return @"NavigateWrap";
    case RCTFocusZoneNavigateAtEnd::NavigateContinue:
      return @"NavigateContinue";
  }
}

static NSString *RCTTabKeyNavigationFromProp(RCTFocusZoneTabKeyNavigation tabKeyNavigation)
{
  switch (tabKeyNavigation) {
    case RCTFocusZoneTabKeyNavigation::None:
      return @"None";
    case RCTFocusZoneTabKeyNavigation::NavigateWrap:
      return @"NavigateWrap";
    case RCTFocusZoneTabKeyNavigation::NavigateStopAtEnds:
      return @"NavigateStopAtEnds";
    case RCTFocusZoneTabKeyNavigation::Normal:
      return @"Normal";
  }
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

@interface RCTFocusZoneComponentView () <RCTRCTFocusZoneViewProtocol>
@end

@implementation RCTFocusZoneComponentView {
  NSInteger _defaultResponderTag;
  RCTFocusZone *_focusZone;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  // Fabric normalizes the legacy RCT-prefixed view name before component lookup.
  return concreteComponentDescriptorProvider<FocusZoneComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    static const auto defaultProps = std::make_shared<const RCTFocusZoneProps>();
    _props = defaultProps;

    _focusZone = [[RCTFocusZone alloc] initWithFrame:self.bounds];
    self.contentView = _focusZone;
  }
  return self;
}

- (NSView *)accessibilityElement
{
  return _focusZone;
}

- (void)mountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)childComponentView index:(NSInteger)index
{
  [_focusZone insertSubview:childComponentView atIndex:index];
  [self updateDefaultResponder];
}

- (void)unmountChildComponentView:(RCTUIView<RCTComponentViewProtocol> *)childComponentView index:(__unused NSInteger)index
{
  [childComponentView removeFromSuperview];
  [self updateDefaultResponder];
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = *std::static_pointer_cast<const RCTFocusZoneProps>(props);

  _focusZone.disabled = newProps.disabled;
  _focusZone.focusZoneDirection = RCTFocusZoneDirectionFromProp(newProps.focusZoneDirection);
  _focusZone.navigateAtEnd = RCTNavigateAtEndFromProp(newProps.navigateAtEnd);
  _focusZone.navigationOrderInRenderOrder = newProps.navigationOrderInRenderOrder;
  _focusZone.tabKeyNavigation = RCTTabKeyNavigationFromProp(newProps.tabKeyNavigation);

  _defaultResponderTag = 0;
  if (newProps.defaultTabbableElement.isNumber()) {
    _defaultResponderTag = (NSInteger)newProps.defaultTabbableElement.asDouble();
  }
  [self updateDefaultResponder];
  [self.window recalculateKeyViewLoop];

  [super updateProps:props oldProps:oldProps];
}

- (void)viewDidMoveToWindow
{
  [super viewDidMoveToWindow];
  [self updateDefaultResponder];
}

- (void)prepareForRecycle
{
  [super prepareForRecycle];
  _defaultResponderTag = 0;
  _focusZone.defaultResponder = nil;
}

- (BOOL)acceptsFirstResponder
{
  return _focusZone.acceptsFirstResponder;
}

- (BOOL)becomeFirstResponder
{
  return [_focusZone becomeFirstResponder];
}

- (void)keyDown:(NSEvent *)event
{
  [_focusZone keyDown:event];
}

- (void)updateDefaultResponder
{
  RCTPlatformView *rootView = self.window.contentView;
  _focusZone.defaultResponder =
      _defaultResponderTag > 0 && rootView ? RCTFindComponentViewWithTag(rootView, _defaultResponderTag) : nil;
}

@end

#endif
