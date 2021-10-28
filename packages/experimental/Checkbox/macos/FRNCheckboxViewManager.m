#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNCheckboxViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(label, title, NSString);
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSButton) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_CUSTOM_VIEW_PROPERTY(checked, BOOL, NSButton) {
	if ([[RCTConvert NSNumber:json] isEqualToNumber:[NSNumber numberWithBool:YES]]) {
		[view setState:NSControlStateValueOn];
	} else {
		[view setState:NSControlStateValueOff];
	}
}
RCT_REMAP_VIEW_PROPERTY(onChange, onPress, RCTBubblingEventBlock);
RCT_CUSTOM_VIEW_PROPERTY(tooltip, NSString, NSButton) {
  [view setToolTip:[RCTConvert NSString:json]];
}@end
