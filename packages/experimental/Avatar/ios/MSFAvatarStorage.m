//
//  MSFAvatarStorage.m
//  FluentUI-React-Native-Avatar
//
//  Created by Saad Najmi on 5/11/21.
//

#import <Foundation/Foundation.h>

#import "MSFAvatarStorage.h"

NS_ASSUME_NONNULL_BEGIN

@implementation MSFAvatarStorage

static MSFAvatarStorage *s_sharedInstance;

+ (instancetype) sharedInstance {
    if (s_sharedInstance == nil) {
        static dispatch_once_t onceToken;
        dispatch_once(&onceToken, ^{
            s_sharedInstance = [MSFAvatarStorage new];
            [s_sharedInstance setViewToControllerMapping:[NSMutableDictionary new]];
        });
    }
    return s_sharedInstance;
}

-(void)addNewHostingController:(id)hostingController {
    NSValue *key = [NSValue valueWithNonretainedObject:[hostingController view]];
    [[self viewToControllerMapping] setObject:hostingController forKey:key];
}

-(id)getHostingController:(id)view {
    NSValue *key = [NSValue valueWithNonretainedObject:view];
    return [[self viewToControllerMapping] objectForKey:key];
}

@end

NS_ASSUME_NONNULL_END
