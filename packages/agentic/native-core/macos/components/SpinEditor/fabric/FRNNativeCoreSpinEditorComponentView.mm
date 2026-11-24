#ifdef RCT_NEW_ARCH_ENABLED

#import "FRNNativeCoreSpinEditorComponentView.h"

#import <React/RCTComponent.h>
#import <React/RCTConversions.h>
#import <React/RCTView.h>
#import <react/renderer/components/FRNNativeCoreSpec/ComponentDescriptors.h>
#import <react/renderer/components/FRNNativeCoreSpec/EventEmitters.h>
#import <react/renderer/components/FRNNativeCoreSpec/Props.h>
#import "FRNNativeCore-Swift.h"

using namespace facebook::react;

@implementation FRNNativeCoreSpinEditorComponentView {
  FRNNativeCoreSpinEditorView *_editor;
}

+ (ComponentDescriptorProvider)componentDescriptorProvider
{
  return concreteComponentDescriptorProvider<FRNNativeCoreSpinEditorComponentDescriptor>();
}

- (instancetype)initWithFrame:(CGRect)frame
{
  if ((self = [super initWithFrame:frame])) {
    static const auto defaults = std::make_shared<const FRNNativeCoreSpinEditorProps>();
    _props = defaults;
    _editor = [[FRNNativeCoreSpinEditorView alloc] initWithFrame:self.bounds];
    self.contentView = _editor;
  }
  return self;
}

- (NSView *)accessibilityElement
{
  return _editor.fieldElement;
}

- (void)updateProps:(const Props::Shared &)props oldProps:(const Props::Shared &)oldProps
{
  [super updateProps:props oldProps:oldProps];
  const auto &next = static_cast<const FRNNativeCoreSpinEditorProps &>(*props);
  _editor.targetLabel = RCTNSStringFromString(next.targetLabel);
  _editor.targetTestID = RCTNSStringFromStringNilIfEmpty(next.targetTestID);
  _editor.incrementLabel = RCTNSStringFromString(next.incrementLabel);
  _editor.decrementLabel = RCTNSStringFromString(next.decrementLabel);
  _editor.draft = RCTNSStringFromString(next.draft);
  _editor.numericValue = next.numericValue;
  _editor.minimum = next.minimum;
  _editor.maximum = next.maximum;
  _editor.canIncrement = next.canIncrement;
  _editor.canDecrement = next.canDecrement;
  _editor.hasLargeStep = next.hasLargeStep;
  _editor.disabled = next.disabled;
  _editor.readOnly = next.readOnly;
  _editor.invalid = next.invalid;
  __weak FRNNativeCoreSpinEditorComponentView *weakSelf = self;
  _editor.onRequest = ^(NSString *kind, NSString *text, double value) {
    FRNNativeCoreSpinEditorComponentView *view = weakSelf;
    if (!view || !view->_eventEmitter) return;
    std::static_pointer_cast<const FRNNativeCoreSpinEditorEventEmitter>(view->_eventEmitter)
        ->onEditorInput({.kind = kind.UTF8String, .text = text.UTF8String, .value = value});
  };
}

- (void)prepareForRecycle
{
  _editor.onRequest = nil;
  [super prepareForRecycle];
}

@end

#endif
