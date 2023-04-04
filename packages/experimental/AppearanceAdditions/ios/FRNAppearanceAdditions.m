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

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(horizontalSizeClass:(id)reactTag) {
    RCTUnsafeExecuteOnMainQueueSync(^{
        if ([reactTag isKindOfClass:[NSNumber class]]) {
            UIView *view = [[[self bridge] uiManager] viewForReactTag:reactTag];
            NSString *horizontalSizeClass = RCTHorizontalSizeClassPreference([view traitCollection]);
            self->_horizontalSizeClass = horizontalSizeClass;
        }
    });
    return _horizontalSizeClass;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(userInterfaceLevel:(id)reactTag) {
    RCTUnsafeExecuteOnMainQueueSync(^{
        if ([reactTag isKindOfClass:[NSNumber class]]) {
            UIView *view = [[[self bridge] uiManager] viewForReactTag:reactTag];
            NSString *horizontalSizeClass = RCTHorizontalSizeClassPreference([view traitCollection]);
            self->_horizontalSizeClass = horizontalSizeClass;
        }
    });
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
