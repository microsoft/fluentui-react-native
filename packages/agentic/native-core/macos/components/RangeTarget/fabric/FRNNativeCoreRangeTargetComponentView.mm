#ifdef RCT_NEW_ARCH_ENABLED

#import "FRNNativeCoreRangeTargetComponentView.h"
#import <React/RCTComponent.h>
#import <React/RCTConversions.h>
#import <React/RCTView.h>
#import <react/renderer/components/FRNNativeCoreSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNNativeCoreSpec/EventEmitters.h>
#import <react/renderer/components/FRNNativeCoreSpec/Props.h>
#import "FRNNativeCore-Swift.h"

using namespace facebook::react;

@implementation FRNNativeCoreRangeTargetComponentView {
  FRNNativeCoreRangeTargetView *_range;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<FRNNativeCoreRangeTargetComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static const auto defaults = std::make_shared<const FRNNativeCoreRangeTargetProps>();
    _props = defaults;
    _range = [[FRNNativeCoreRangeTargetView alloc] initWithFrame:self.bounds];
    self.contentView = _range;
  }
  return self;
}

- (NSView *)accessibilityElement
{
  return _range;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  [super updateProps:props oldProps:oldProps];
  const auto &next = static_cast<const FRNNativeCoreRangeTargetProps &>(*props);
  _range.targetLabel = RCTNSStringFromString(next.targetLabel);
  _range.targetTestID = next.targetTestID.empty() ? nil : RCTNSStringFromString(next.targetTestID);
  _range.minimum = next.minimum;
  _range.maximum = next.maximum;
  _range.step = next.step;
  _range.value = next.value;
  _range.hasValue = next.hasValue;
  _range.valueDescription = next.valueDescription.empty() ? nil : RCTNSStringFromString(next.valueDescription);
  _range.disabled = next.disabled;
  _range.readOnly = next.readOnly;
  _range.clearable = next.clearable;
  _range.horizontalReversed = next.horizontalReversed;
  __weak FRNNativeCoreRangeTargetComponentView *weakSelf = self;
  _range.onRequest = ^(NSString *kind, double value) {
    FRNNativeCoreRangeTargetComponentView *view = weakSelf;
    if (!view || !view->_eventEmitter) return;
    std::static_pointer_cast<const FRNNativeCoreRangeTargetEventEmitter>(view->_eventEmitter)
        ->onValueRequest({.kind = kind.UTF8String, .value = value});
  };
}

- (void)prepareForRecycle
{
  _range.onRequest = nil;
  [super prepareForRecycle];
}

@end

#endif
