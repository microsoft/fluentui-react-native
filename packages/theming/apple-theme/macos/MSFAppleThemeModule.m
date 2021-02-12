#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MSFAppleThemeModule, NSObject)

RCT_EXTERN_METHOD(hoverColorForColor:(NSColor)color
				  withResolver:(RCTPromiseResolveBlock)resolve
				  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(pressedColorForColor:(NSColor)color
				  withResolver:(RCTPromiseResolveBlock)resolve
				  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(disabledColorForColor:(NSColor)color
				  withResolver:(RCTPromiseResolveBlock)resolve
				  withRejecter:(RCTPromiseRejectBlock)reject)



@end
