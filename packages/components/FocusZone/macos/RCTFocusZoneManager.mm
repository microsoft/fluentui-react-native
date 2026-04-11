#import "RCTFocusZone.h"
#import "RCTFocusZoneManager.h"
#import <React/RCTConvert.h>
#import <React/RCTUIManager.h>

@implementation RCTFocusZoneManager

RCT_EXPORT_MODULE()

RCT_EXPORT_VIEW_PROPERTY(disabled, BOOL)

RCT_CUSTOM_VIEW_PROPERTY(navigationOrderInRenderOrder, BOOL, RCTFocusZone)
{
	[view setNavigationOrderInRenderOrder:[json boolValue]];
	[[view window] recalculateKeyViewLoop];
}

RCT_CUSTOM_VIEW_PROPERTY(focusZoneDirection, NSString, RCTFocusZone)
{
	if ([json isEqualToString:@"bidirectional"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionBidirectional];
	}
	else if ([json isEqualToString:@"vertical"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionVertical];
	}
	else if ([json isEqualToString:@"horizontal"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionHorizontal];
	}
	else if ([json isEqualToString:@"none"])
	{
		[view setFocusZoneDirection:FocusZoneDirectionNone];
	}
	else
	{
		[view setFocusZoneDirection:[defaultView focusZoneDirection]];
	}
}

RCT_EXPORT_VIEW_PROPERTY(navigateAtEnd, NSString)
RCT_EXPORT_VIEW_PROPERTY(tabKeyNavigation, NSString)

RCT_CUSTOM_VIEW_PROPERTY(defaultTabbableElement, NSNumber, RCTFocusZone)
{
	NSNumber *tag = [RCTConvert NSNumber:json];
	RCTUIManager *manager = [[self bridge] uiManager];
	NSView *defaultResponder = [manager viewForReactTag:tag];
	[view setDefaultResponder:defaultResponder];
}

- (RCTView *)view
{
  return [RCTFocusZone new];
}

@end

#ifdef RCT_NEW_ARCH_ENABLED

#include <react/renderer/components/RCTFocusZoneSpec/ComponentDescriptors.h>
#include <react/renderer/components/RCTFocusZoneSpec/Props.h>
#include <react/renderer/components/RCTFocusZoneSpec/RCTComponentViewHelpers.h>

#import <React/RCTFabricComponentsPlugins.h>

using namespace facebook::react;

@interface FocusZoneComponentView : RCTViewComponentView
@end

@implementation FocusZoneComponentView {
  RCTFocusZone *_focusZoneView;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<RCTFocusZoneComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if (self = [super initWithFrame:frame]) {
    _focusZoneView = [RCTFocusZone new];
    self.contentView = _focusZoneView;
  }
  return self;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  const auto &newProps = static_cast<const RCTFocusZoneProps &>(*props);

  _focusZoneView.disabled = newProps.disabled;
  _focusZoneView.navigationOrderInRenderOrder = newProps.navigationOrderInRenderOrder;

  switch (newProps.navigateAtEnd) {
    case RCTFocusZoneNavigateAtEnd::NavigateWrap:
      _focusZoneView.navigateAtEnd = @"NavigateWrap";
      break;
    case RCTFocusZoneNavigateAtEnd::NavigateContinue:
      _focusZoneView.navigateAtEnd = @"NavigateContinue";
      break;
    case RCTFocusZoneNavigateAtEnd::NavigateStopAtEnds:
      _focusZoneView.navigateAtEnd = @"NavigateStopAtEnds";
      break;
  }

  switch (newProps.focusZoneDirection) {
    case RCTFocusZoneFocusZoneDirection::Bidirectional:
      _focusZoneView.focusZoneDirection = FocusZoneDirectionBidirectional;
      break;
    case RCTFocusZoneFocusZoneDirection::Vertical:
      _focusZoneView.focusZoneDirection = FocusZoneDirectionVertical;
      break;
    case RCTFocusZoneFocusZoneDirection::Horizontal:
      _focusZoneView.focusZoneDirection = FocusZoneDirectionHorizontal;
      break;
    case RCTFocusZoneFocusZoneDirection::None:
      _focusZoneView.focusZoneDirection = FocusZoneDirectionNone;
      break;
  }

  switch (newProps.tabKeyNavigation) {
    case RCTFocusZoneTabKeyNavigation::None:
      _focusZoneView.tabKeyNavigation = @"None";
      break;
    case RCTFocusZoneTabKeyNavigation::NavigateWrap:
      _focusZoneView.tabKeyNavigation = @"NavigateWrap";
      break;
    case RCTFocusZoneTabKeyNavigation::NavigateStopAtEnds:
      _focusZoneView.tabKeyNavigation = @"NavigateStopAtEnds";
      break;
    case RCTFocusZoneTabKeyNavigation::Normal:
      _focusZoneView.tabKeyNavigation = @"Normal";
      break;
  }

  // defaultTabbableElement is not handled here: resolving a view by React tag
  // requires the legacy UIManager and is not supported in the Fabric renderer.

  [super updateProps:props oldProps:oldProps];
}

@end

Class<RCTComponentViewProtocol> RCTFocusZoneCls(void)
{
  return FocusZoneComponentView.class;
}

#endif // RCT_NEW_ARCH_ENABLED
