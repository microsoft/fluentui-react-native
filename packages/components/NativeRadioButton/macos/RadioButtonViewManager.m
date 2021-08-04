#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(RadioButtonViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(title, NSString);
RCT_EXPORT_VIEW_PROPERTY(enabled, BOOL);
RCT_REMAP_VIEW_PROPERTY(buttonKey, keyEquivalent, NSString)
RCT_CUSTOM_VIEW_PROPERTY(isSelected, BOOL, NSButton) {
	if ([[RCTConvert NSNumber:json] isEqualToNumber:[NSNumber numberWithBool:YES]]) {
		[view setState:NSControlStateValueOn];
	}
}
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);

@end
