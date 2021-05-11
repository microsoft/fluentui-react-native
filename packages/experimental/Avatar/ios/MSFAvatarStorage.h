//
//  MSFAvatarStorage.h
//  Pods
//
//  Created by Saad Najmi on 5/11/21.
//

#ifndef MSFAvatarStorage_h
#define MSFAvatarStorage_h

@import FluentUI;

NS_ASSUME_NONNULL_BEGIN

@interface MSFAvatarStorage : NSObject

@property NSMutableDictionary<UIView *, MSFAvatar *> *viewToControllerMapping;

+ (instancetype)sharedInstance;

-(void)addNewHostingController:(MSFAvatar *)hostingController; // Not actually a hosting controller "UIKitWrapper" <-- The Name

-(id)getHostingController:(UIView *)view;

@end

NS_ASSUME_NONNULL_END

#endif /* MSFAvatarStorage_h */
