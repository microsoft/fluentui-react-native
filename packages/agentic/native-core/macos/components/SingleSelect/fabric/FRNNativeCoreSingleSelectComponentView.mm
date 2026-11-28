#ifdef RCT_NEW_ARCH_ENABLED

#import "FRNNativeCoreSingleSelectComponentView.h"
#import <React/RCTComponent.h>
#import <React/RCTConversions.h>
#import <React/RCTView.h>
#import <react/renderer/components/FRNNativeCoreSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNNativeCoreSpec/EventEmitters.h>
#import <react/renderer/components/FRNNativeCoreSpec/Props.h>
#import "FRNNativeCore-Swift.h"

using namespace facebook::react;

@implementation FRNNativeCoreSingleSelectComponentView {
  FRNNativeCoreSingleSelectView *_picker;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<FRNNativeCoreSingleSelectComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static const auto defaults = std::make_shared<const FRNNativeCoreSingleSelectProps>();
    _props = defaults;
    _picker = [[FRNNativeCoreSingleSelectView alloc] initWithFrame:self.bounds pullsDown:NO];
    self.contentView = _picker;
  }
  return self;
}

- (NSView *)accessibilityElement
{
  return _picker;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  [super updateProps:props oldProps:oldProps];
  const auto &next = static_cast<const FRNNativeCoreSingleSelectProps &>(*props);
  _picker.accessibilityLabel = RCTNSStringFromString(next.targetLabel);
  _picker.accessibilityIdentifier = next.targetTestID.empty() ? nil : RCTNSStringFromString(next.targetTestID);
  _picker.accessibilityHelp = next.targetHelp.empty() ? nil : RCTNSStringFromString(next.targetHelp);
  _picker.enabled = !next.disabled;
  _picker.invalid = next.invalid;
  _picker.selectedKey = next.selectedKey.empty() ? nil : RCTNSStringFromString(next.selectedKey);
  _picker.placeholder = next.placeholder.empty() ? nil : RCTNSStringFromString(next.placeholder);
  NSMutableArray<NSDictionary *> *options = [NSMutableArray arrayWithCapacity:next.options.size()];
  for (const auto &option : next.options) {
    [options addObject:@{
      @"key": RCTNSStringFromString(option.key),
      @"label": RCTNSStringFromString(option.label),
      @"disabled": @(option.disabled),
    }];
  }
  _picker.optionRecords = options;
  __weak FRNNativeCoreSingleSelectComponentView *weakSelf = self;
  _picker.onRequest = ^(NSString *key) {
    FRNNativeCoreSingleSelectComponentView *view = weakSelf;
    if (!view || !view->_eventEmitter) return;
    std::static_pointer_cast<const FRNNativeCoreSingleSelectEventEmitter>(view->_eventEmitter)
        ->onSelectionRequest({.key = key.UTF8String});
  };
}

- (void)prepareForRecycle
{
  _picker.onRequest = nil;
  [super prepareForRecycle];
}

@end

#endif
