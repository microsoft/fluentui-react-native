#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(FRNRadioButtonViewManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(content, title, NSString);
RCT_CUSTOM_VIEW_PROPERTY(disabled, BOOL, NSButton) {
  [view setEnabled:![RCTConvert BOOL:json]];
}
RCT_REMAP_VIEW_PROPERTY(buttonKey, keyEquivalent, NSString)
RCT_CUSTOM_VIEW_PROPERTY(selected, BOOL, NSButton) {
	if ([[RCTConvert NSNumber:json] isEqualToNumber:[NSNumber numberWithBool:YES]]) {
		[view setState:NSControlStateValueOn];
	} else {
		[view setState:NSControlStateValueOff];
	}
}
RCT_EXPORT_VIEW_PROPERTY(onPress, RCTBubblingEventBlock);

@end
