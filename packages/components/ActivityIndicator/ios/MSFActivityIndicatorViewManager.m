#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

@interface MSFActivityIndicatorView(RCTComponent)

@end

@implementation RCTConvert (MSFActivityIndicatorView)

RCT_ENUM_CONVERTER(MSFActivityIndicatorViewSize, (@{
	@"xSmall": @(MSFActivityIndicatorViewSizeXSmall),
	@"small": @(MSFActivityIndicatorViewSizeSmall),
	@"medium": @(MSFActivityIndicatorViewSizeMedium),
	@"large": @(MSFActivityIndicatorViewSizeLarge),
	@"xLarge": @(MSFActivityIndicatorViewSizeXLarge),

}), MSFActivityIndicatorViewSizeSmall, integerValue);

@end

@interface RCT_EXTERN_MODULE(MSFActivityIndicatorViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(hidesWhenStopped, BOOL);

RCT_EXPORT_VIEW_PROPERTY(color, UIColor);
RCT_EXPORT_VIEW_PROPERTY(size, MSFActivityIndicatorViewSize);

@end
