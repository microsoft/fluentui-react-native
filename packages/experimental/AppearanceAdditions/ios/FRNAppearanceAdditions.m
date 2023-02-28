#import "FRNAppearanceAdditions.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTConstants.h>
#import <React/RCTUtils.h>

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
    NSString *_horizontalSizeClass;
    NSString *_userInterfaceLevel;
    NSString *_accessibilityContrastOption;
}

+ (BOOL)requiresMainQueueSetup {
    return YES;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(horizontalSizeClass)
{
    return _horizontalSizeClass;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(userInterfaceLevel)
{
    return _userInterfaceLevel;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(accessibilityContrastOption)
{
    return _accessibilityContrastOption;
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
    
    // Note that [UITraitCollection currentTraitCollection] always returns the same default trait collection,
    // presumably because FRNAppearanceAdditions isn't a view, so it never gets updated with the right traitCollection
    // (which happens when a view gets added to the view hierachy). In order to get the right trait collection,
    // we need to access a view that's been added to the view hierarchy
    UIViewController *viewControllerWithInitialTraitCollection = RCTPresentedViewController();
    UITraitCollection *initialTraitCollection;
    
    if (viewControllerWithInitialTraitCollection != nil) {
        initialTraitCollection = [viewControllerWithInitialTraitCollection traitCollection];
    } else {
        initialTraitCollection = [UITraitCollection currentTraitCollection];
    }
    
    _horizontalSizeClass = RCTHorizontalSizeClassPreference(initialTraitCollection);
    _userInterfaceLevel = RCTUserInterfaceLevelPreference(initialTraitCollection);
    _accessibilityContrastOption = RCTAccessibilityContrastPreference(initialTraitCollection);
    
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

        if (![horizontalSizeClass isEqualToString:_horizontalSizeClass] ||
            ![userInterfaceLevel isEqualToString:_userInterfaceLevel] ||
            ![accessibilityContrastOption isEqualToString:_accessibilityContrastOption]) {
            _horizontalSizeClass = horizontalSizeClass;
            _userInterfaceLevel = userInterfaceLevel;
            _accessibilityContrastOption = accessibilityContrastOption;
            [self sendEventWithName:@"appearanceChanged"
                               body:@{
                                        @"horizontalSizeClass": _horizontalSizeClass,
                                        @"userInterfaceLevel": _userInterfaceLevel,
                                        @"accessibilityContrastOption": _accessibilityContrastOption,
                                    }];
        }
    }
}

RCT_EXPORT_MODULE();

@end
