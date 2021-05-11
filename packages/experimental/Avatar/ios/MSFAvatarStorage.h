//
//  MSFAvatarStorage.h
//  Pods
//
//  Created by Saad Najmi on 5/11/21.
//

#ifndef MSFAvatarStorage_h
#define MSFAvatarStorage_h

NS_ASSUME_NONNULL_BEGIN

@interface MSFAvatarStorage : NSObject

@property NSMutableDictionary *viewToControllerMapping;

+ (instancetype)sharedInstance;

-(void)addNewHostingController:(id)hostingController;

-(id)getHostingController:(id)view;

@end

NS_ASSUME_NONNULL_END

#endif /* MSFAvatarStorage_h */
