#import "FRNAppearanceAdditions.h"
#import "RCTUIManager.h"

#import <React/RCTBridgeModule.h>
#import <React/RCTConstants.h>
#import <React/RCTUtils.h>
#import <React/UIView+React.h>
#import <React/RCTRootView.h>
#import <React/RCTBridge+Private.h>

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

/**
 * When initializing this native module, not all the information required to consistently get all correct initial traits is accessible.
 * In order to ensure that the correct traits are always be returned the first time they are reuqested, a react tag for a view in that window can
 * be provided to the native module.
 *
 * This initialization step may be needed when accessing traits that can be different in different windows, which include horizontal size class and user interface level.
 * This initialization step is not necessary if the only traits that are accessed are system wide traits common to all windows, such as accessibility contrast.
 */
RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(initializeTraitCollection:(id)reactTag) {
    RCTUnsafeExecuteOnMainQueueSync(^{
        if ([reactTag isKindOfClass:[NSNumber class]]) {
            UIView *view = [[[self bridge] uiManager] viewForReactTag:reactTag];
            self->_horizontalSizeClass = RCTHorizontalSizeClassPreference([view traitCollection]);
            self->_userInterfaceLevel = RCTUserInterfaceLevelPreference([view traitCollection]);
            self->_accessibilityContrastOption = RCTAccessibilityContrastPreference([view traitCollection]);
        }
    });
    return nil;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(horizontalSizeClass) {
    return _horizontalSizeClass;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(userInterfaceLevel) {
    return _userInterfaceLevel;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(accessibilityContrastOption) {
    return _accessibilityContrastOption;
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents {
    return @[ @"appearanceChanged" ];
}

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

- (void)startObserving {
    _hasListeners = YES;
    
    UITraitCollection *attemptedInitialTraitCollection = [self attemptTraitCollectionInitialization];

    _horizontalSizeClass = RCTHorizontalSizeClassPreference(attemptedInitialTraitCollection);
    _userInterfaceLevel = RCTUserInterfaceLevelPreference(attemptedInitialTraitCollection);
    _accessibilityContrastOption = RCTAccessibilityContrastPreference(attemptedInitialTraitCollection);

    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(appearanceChanged:)
                                                 name:RCTUserInterfaceStyleDidChangeNotification
                                               object:nil];
}

/**
 When this native module is first initialized, we don't have access to the information necessary to consistently retrieve all the right traits.
 We should still attempt to initialize the traits with the right values with the information we do have access to.
 
 The traits retrieved from RCTPresentedViewController() should be correct for non-multiwindow scenarios.
 
 The traits retrieved from [UITraitCollection currentTraitCollection] will always be the same default trait collection,
 presumably because FRNAppearanceAdditions isn't a view, so it never gets updated with the right traitCollection
 (which happens when a view gets added to the view hierachy).
 */
- (UITraitCollection *)attemptTraitCollectionInitialization {
    UIViewController *presentedViewControllerTraitCollection = RCTPresentedViewController();

    if (presentedViewControllerTraitCollection != nil) {
        return [presentedViewControllerTraitCollection traitCollection];
    } else {
        return [UITraitCollection currentTraitCollection];
    }
}

- (void)stopObserving {
    _hasListeners = NO;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Event processing

- (void)appearanceChanged:(NSNotification *)notification {
    if (_hasListeners) {
        RCTBridge *notificationBridge = [[notification object] bridge];
        if (![notificationBridge isKindOfClass:[RCTBridge class]]) {
            return;
        }

        // Don't send the appearanceChanged event if the notification didn't originate from the same react native instance
        RCTBridge *currentBridge = [[self bridge] parentBridge];
        if (![currentBridge isEqual:notificationBridge]) {
            return;
        }

        UITraitCollection *traitCollection = [[notification userInfo] valueForKey:RCTUserInterfaceStyleDidChangeNotificationTraitCollectionKey];
        if (![traitCollection isKindOfClass:[UITraitCollection class]]) {
            return;
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
