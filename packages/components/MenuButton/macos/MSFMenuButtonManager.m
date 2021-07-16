#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>



@interface RCT_EXTERN_MODULE(MSFMenuButtonManager, RCTViewManager)

RCT_REMAP_VIEW_PROPERTY(imageSource, image, UIImage)

//RCT_CUSTOM_VIEW_PROPERTY(menu, NSMenu, NSPopUpButton)
//{
//  NSMenu *menu = [self createMenuFromJson:json];
//  [view setMenu:menu];
//  NSString *avatarSizeString = [RCTConvert NSString:json];
//  if ([avatarSizeString isEqualToString:@"xSmall"]) {
//    [view setAvatarSize:16];
//  } else if ([avatarSizeString isEqualToString:@"small"]) {
//    [view setAvatarSize:24];
//  } else if ([avatarSizeString isEqualToString:@"medium"]) {
//    [view setAvatarSize:32];
//  } else if ([avatarSizeString isEqualToString:@"large"]) {
//    [view setAvatarSize:40];
//  } else if ([avatarSizeString isEqualToString:@"xLarge"]) {
//    [view setAvatarSize:52];
//  } else if ([avatarSizeString isEqualToString:@"xxLarge"]) {
//    [view setAvatarSize:72];
//  }
//}


// - (void)createMenuFromJsonobjc:(NSString *)json {
//   NSError *e = nil;
//   NSString *jsonString = @"[{\"id\": \"1\", \"name\":\"sam\"}]";
//   NSData *data = [jsonString dataUsingEncoding:NSUTF8StringEncoding];

//   NSArray *jsonArray = [NSJSONSerialization JSONObjectWithData: data options:  NSJSONReadingMutableContainers error: &e];

//   if (!jsonArray) {
//       NSLog(@"Error parsing JSON: %@", e);
//   } else {
//       for(NSDictionary *item in jsonArray) {
//           NSLog(@"Item: %@", item);
//       }
//   }
// }

@end
