#ifdef RCT_NEW_ARCH_ENABLED

#import "RCTFocusZoneComponentView.h"

#import <react/renderer/components/FRNFocusZoneSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNFocusZoneSpec/EventEmitters.h>
#import <react/renderer/components/FRNFocusZoneSpec/Props.h>
#import <react/renderer/components/FRNFocusZoneSpec/RCTComponentViewHelpers.h>

#import <React/RCTComponentViewProtocol.h>

#import "RCTFocusZone.h"

using namespace facebook::react;

static FocusZoneDirection RCTFocusZoneDirectionFromProp(FocusZoneFocusZoneDirection direction)
{
  switch (direction) {
    case FocusZoneFocusZoneDirection::Bidirectional:
      return FocusZoneDirectionBidirectional;
    case FocusZoneFocusZoneDirection::Horizontal:
      return FocusZoneDirectionHorizontal;
    case FocusZoneFocusZoneDirection::Vertical:
      return FocusZoneDirectionVertical;
    case FocusZoneFocusZoneDirection::None:
      return FocusZoneDirectionNone;
  }
}

static NSString *RCTNavigateAtEndFromProp(FocusZoneNavigateAtEnd navigateAtEnd)
{
  switch (navigateAtEnd) {
    case FocusZoneNavigateAtEnd::NavigateStopAtEnds:
      return @"NavigateStopAtEnds";
    case FocusZoneNavigateAtEnd::NavigateWrap:
      return @"NavigateWrap";
    case FocusZoneNavigateAtEnd::NavigateContinue:
      return @"NavigateContinue";
  }
}

static NSString *RCTTabKeyNavigationFromProp(FocusZoneTabKeyNavigation tabKeyNavigation)
{
  switch (tabKeyNavigation) {
    case FocusZoneTabKeyNavigation::None:
      return @"None";
    case FocusZoneTabKeyNavigation::NavigateWrap:
      return @"NavigateWrap";
    case FocusZoneTabKeyNavigation::NavigateStopAtEnds:
      return @"NavigateStopAtEnds";
    case FocusZoneTabKeyNavigation::Normal:
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

static RCTPlatformView *RCTFindComponentViewWithNativeID(RCTPlatformView *rootView, NSString *nativeID)
{
  if ([rootView isKindOfClass:[RCTViewComponentView class]] &&
      [((RCTViewComponentView *)rootView).nativeId isEqualToString:nativeID]) {
    return rootView;
  }

  for (RCTPlatformView *subview in rootView.subviews) {
    RCTPlatformView *match = RCTFindComponentViewWithNativeID(subview, nativeID);
    if (match) {
      return match;
    }
  }

  return nil;
}

@interface RCTFocusZoneComponentView () <RCTFocusZoneViewProtocol>
@end

@implementation RCTFocusZoneComponentView {
  NSString *_defaultResponderNativeID;
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
    static const auto defaultProps = std::make_shared<const FocusZoneProps>();
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
  const auto &newProps = *std::static_pointer_cast<const FocusZoneProps>(props);

  _focusZone.disabled = newProps.disabled;
  _focusZone.focusZoneDirection = RCTFocusZoneDirectionFromProp(newProps.focusZoneDirection);
  _focusZone.navigateAtEnd = RCTNavigateAtEndFromProp(newProps.navigateAtEnd);
  _focusZone.navigationOrderInRenderOrder = newProps.navigationOrderInRenderOrder;
  _focusZone.tabKeyNavigation = RCTTabKeyNavigationFromProp(newProps.tabKeyNavigation);

  _defaultResponderNativeID = nil;
  _defaultResponderTag = 0;
  if (newProps.defaultTabbableElement.isNumber()) {
    _defaultResponderTag = (NSInteger)newProps.defaultTabbableElement.asDouble();
  } else if (newProps.defaultTabbableElement.isString()) {
    _defaultResponderNativeID = [NSString stringWithUTF8String:newProps.defaultTabbableElement.getString().c_str()];
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
  _defaultResponderNativeID = nil;
  _defaultResponderTag = 0;
  _focusZone.defaultResponder = nil;
}

- (BOOL)acceptsFirstResponder
{
  // The content view owns key-loop participation; the Fabric wrapper only forwards programmatic focus.
  return NO;
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
  if (_defaultResponderTag > 0 && rootView) {
    _focusZone.defaultResponder = RCTFindComponentViewWithTag(rootView, _defaultResponderTag);
  } else if (_defaultResponderNativeID && rootView) {
    _focusZone.defaultResponder = RCTFindComponentViewWithNativeID(rootView, _defaultResponderNativeID);
  } else {
    _focusZone.defaultResponder = nil;
  }
}

@end

#endif
