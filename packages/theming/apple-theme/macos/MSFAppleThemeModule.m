#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MSFAppleThemeModule, NSObject)

RCT_EXTERN_METHOD(colorWithEffect:(UIColor)color
				  effect:(NSString)effect
				  errorCallback:(RCTResponseSenderBlock)errorCallback
				  successCallback:(RCTResponseSenderBlock)successCallback)

@end
