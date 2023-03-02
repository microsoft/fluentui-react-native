#import "FRNAppearanceAdditions.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTConstants.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>

NSString *const FRNAppearanceSizeClassCompact = @"compact";
NSString *const FRNAppearanceSizeClassRegular = @"regular";
NSString *const FRNUserInterfaceLevelBase = @"base";
NSString *const FRNUserInterfaceLevelElevated = @"elevated";
NSString *const FRNAccessibilityContrastNormal = @"normal";
NSString *const FRNAccessibilityContrastHigh = @"high";

NSString *RCTHorizontalSizeClassPreference(UITraitCollection *traitCollection) {
    static NSDictionary *sizeClasses;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
        sizeClasses = @{
        @(UIUserInterfaceSizeClassCompact) : FRNAppearanceSizeClassCompact,
        @(UIUserInterfaceSizeClassRegular) : FRNAppearanceSizeClassRegular
      };
    });

    NSString *sizeClass = sizeClasses[@(traitCollection.horizontalSizeClass)];
    if (sizeClass == nil) {
        sizeClass = [traitCollection userInterfaceIdiom] == UIUserInterfaceIdiomPhone ? FRNAppearanceSizeClassCompact : FRNAppearanceSizeClassRegular;
    }
    return sizeClass;
}

NSString *RCTUserInterfaceLevelPreference(UITraitCollection *traitCollection) {
    static NSDictionary *userInterfaceLevels;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
        userInterfaceLevels = @{
        @(UIUserInterfaceLevelBase) : FRNUserInterfaceLevelBase,
        @(UIUserInterfaceLevelElevated) : FRNUserInterfaceLevelElevated
      };
    });

    NSString *userInterfaceLevel = userInterfaceLevels[@(traitCollection.userInterfaceLevel)];
    if (userInterfaceLevel == nil) {
        userInterfaceLevel = FRNUserInterfaceLevelBase;
    }
    return userInterfaceLevel;
}

NSString *RCTAccessibilityContrastPreference(UITraitCollection *traitCollection) {
    static NSDictionary *accessibilityContrastOptions;
    static dispatch_once_t onceToken;

    dispatch_once(&onceToken, ^{
        accessibilityContrastOptions = @{
        @(UIAccessibilityContrastNormal) : FRNAccessibilityContrastNormal,
        @(UIAccessibilityContrastHigh) : FRNAccessibilityContrastHigh,
      };
    });

    NSString *accessibilityContrastOption = accessibilityContrastOptions[@(traitCollection.accessibilityContrast)];
    if (accessibilityContrastOption == nil) {
        accessibilityContrastOption = FRNAccessibilityContrastNormal;
    }
    return accessibilityContrastOption;
}

@implementation FRNAppearanceAdditions {
    BOOL _hasListeners;
    
    NSMutableDictionary<NSNumber *, NSString *> * _rootTagHorizontalSizeClassMap;
    NSMutableDictionary<NSNumber *, NSString *> * _rootTagUserInterfaceLevelMap;
    NSMutableDictionary<NSNumber *, NSString *> * _rootTagAccessibilityContrastMap;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(horizontalSizeClass)
{
    return _rootTagHorizontalSizeClassMap;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(userInterfaceLevel)
{
    return _rootTagUserInterfaceLevelMap;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(accessibilityContrastOption)
{
    return _rootTagAccessibilityContrastMap;
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents {
    return @[ @"appearanceChanged" ];
}

- (dispatch_queue_t)methodQueue
{
    return dispatch_get_main_queue();
}

- (void)startObserving {
    _hasListeners = YES;
    
    _rootTagHorizontalSizeClassMap = [NSMutableDictionary new];
    _rootTagUserInterfaceLevelMap = [NSMutableDictionary new];
    _rootTagAccessibilityContrastMap = [NSMutableDictionary new];
    
    for (UIWindow *window in RCTSharedApplication().windows)
    {
        NSNumber *rootTag = [[[window rootViewController] view] reactTag];
        
        if (rootTag != nil)
        {
            UITraitCollection *windowTraitCollection = [window traitCollection];
            
            _rootTagHorizontalSizeClassMap[rootTag] = RCTHorizontalSizeClassPreference(windowTraitCollection);
            _rootTagUserInterfaceLevelMap[rootTag] = RCTUserInterfaceLevelPreference(windowTraitCollection);
            _rootTagAccessibilityContrastMap[rootTag] = RCTAccessibilityContrastPreference(windowTraitCollection);
        }
    }
    
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appearanceChanged:)
                                                 name:RCTUserInterfaceStyleDidChangeNotification
                                               object:nil];
}

- (void)stopObserving {
    _hasListeners = NO;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Event processing

- (void)appearanceChanged:(NSNotification *)notification {
    if (_hasListeners) {
        UITraitCollection *traitCollection = [[notification userInfo] valueForKey:RCTUserInterfaceStyleDidChangeNotificationTraitCollectionKey];
        if (![traitCollection isKindOfClass:[UITraitCollection class]]) {
            traitCollection = nil;
        }

        NSString *horizontalSizeClass = RCTHorizontalSizeClassPreference(traitCollection);
        NSString *userInterfaceLevel = RCTUserInterfaceLevelPreference(traitCollection);
        NSString *accessibilityContrastOption = RCTAccessibilityContrastPreference(traitCollection);
        
        NSNumber *rootTag = [[[notification object] contentView] reactTag];

        if (![horizontalSizeClass isEqualToString: _rootTagHorizontalSizeClassMap[rootTag]] ||
            ![userInterfaceLevel isEqualToString:_rootTagUserInterfaceLevelMap[rootTag]] ||
            ![accessibilityContrastOption isEqualToString:_rootTagAccessibilityContrastMap[rootTag]]) {
            
            _rootTagHorizontalSizeClassMap[rootTag] = horizontalSizeClass;
            _rootTagUserInterfaceLevelMap[rootTag] = userInterfaceLevel;
            _rootTagAccessibilityContrastMap[rootTag] = accessibilityContrastOption;
            
            [self sendEventWithName:@"appearanceChanged"
                               body:@{
                                        @"rootTag": rootTag,
                                        @"horizontalSizeClass": horizontalSizeClass,
                                        @"userInterfaceLevel": userInterfaceLevel,
                                        @"accessibilityContrastOption": accessibilityContrastOption,
                                    }];
        }
    }
}

RCT_EXPORT_MODULE();

@end
