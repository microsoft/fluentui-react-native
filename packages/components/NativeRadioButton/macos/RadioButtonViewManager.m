#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@interface RCT_EXTERN_MODULE(MSFRadioButtonViewManager, RCTViewManager)

RCT_EXPORT_VIEW_PROPERTY(title, NSString);
RCT_EXPORT_VIEW_PROPERTY(enabled, BOOL);
RCT_EXPORT_VIEW_PROPERTY(isBordered, BOOL);
RCT_REMAP_VIEW_PROPERTY(buttonKey, keyEquivalent, NSString)
RCT_CUSTOM_VIEW_PROPERTY(state, BOOL, NSButton) {
	if ([[RCTConvert NSNumber:json] isEqualToNumber:[NSNumber numberWithBool:YES]]) {
		[view setState:NSControlStateValueOn];
	}
}
@end
