#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(MSFAppleThemeModule, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
				 withResolver:(RCTPromiseResolveBlock)resolve
				 withRejecter:(RCTPromiseRejectBlock)reject)

+ (BOOL)requiresMainQueueSetup
{
	return YES;
}

//- (NSDictionary *)constantsToExport
//{
// return @{ @"DEFAULT_EVENT_NAME": @"New Event" };
//}


@end
