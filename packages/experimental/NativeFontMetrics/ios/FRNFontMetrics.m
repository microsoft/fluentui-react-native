#import "FRNFontMetrics.h"

static NSDictionary<NSString *, NSNumber *> *FRNRecognizedTextStyles() {
    static NSDictionary<NSString *, NSNumber *> *styles;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        styles = @{
            @"caption1": @(FRNTextStyleCaption1),
            @"caption2": @(FRNTextStyleCaption2),
            @"footnote": @(FRNTextStyleFootnote),
            @"subheadline": @(FRNTextStyleSubheadline),
            @"callout": @(FRNTextStyleCallout),
            @"body": @(FRNTextStyleBody),
            @"headline": @(FRNTextStyleHeadline),
            @"title3": @(FRNTextStyleTitle3),
            @"title2": @(FRNTextStyleTitle2),
            @"title1": @(FRNTextStyleTitle1),
            @"largeTitle": @(FRNTextStyleLargeTitle),
        };
    });
    return styles;
}

@implementation RCTConvert (FRNTextStyle)

RCT_ENUM_CONVERTER(FRNTextStyle, FRNRecognizedTextStyles(), FRNTextStyleUndefined, integerValue)

@end

NS_ASSUME_NONNULL_BEGIN

UIFontMetrics *FRNUIFontMetricsForTextStyle(FRNTextStyle textStyle) {
    static NSDictionary<NSNumber *, UIFontTextStyle> *mapping;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        mapping = @{
            @(FRNTextStyleCaption2): UIFontTextStyleCaption2,
            @(FRNTextStyleCaption1): UIFontTextStyleCaption1,
            @(FRNTextStyleFootnote): UIFontTextStyleFootnote,
            @(FRNTextStyleSubheadline): UIFontTextStyleSubheadline,
            @(FRNTextStyleCallout): UIFontTextStyleCallout,
            @(FRNTextStyleBody): UIFontTextStyleBody,
            @(FRNTextStyleHeadline): UIFontTextStyleHeadline,
            @(FRNTextStyleTitle3): UIFontTextStyleTitle3,
            @(FRNTextStyleTitle2): UIFontTextStyleTitle2,
            @(FRNTextStyleTitle1): UIFontTextStyleTitle1,
            @(FRNTextStyleLargeTitle): UIFontTextStyleLargeTitle,
        };
    });

    UIFontTextStyle uiFontTextStyle = mapping[@(textStyle)] ?: UIFontTextStyleBody; // Default to body if we don't recognize the specified ramp
    return [UIFontMetrics metricsForTextStyle:uiFontTextStyle];
}

CGFloat FRNBaseSizeForTextStyle(FRNTextStyle textStyle) {
    static NSDictionary<NSNumber *, NSNumber *> *mapping;
    static dispatch_once_t onceToken;
    dispatch_once(&onceToken, ^{
        // Values taken from https://developer.apple.com/design/human-interface-guidelines/foundations/typography/#specifications
        mapping = @{
            @(FRNTextStyleCaption2): @11,
            @(FRNTextStyleCaption1): @12,
            @(FRNTextStyleFootnote): @13,
            @(FRNTextStyleSubheadline): @15,
            @(FRNTextStyleCallout): @16,
            @(FRNTextStyleBody): @17,
            @(FRNTextStyleHeadline): @17,
            @(FRNTextStyleTitle3): @20,
            @(FRNTextStyleTitle2): @22,
            @(FRNTextStyleTitle1): @28,
            @(FRNTextStyleLargeTitle): @34,
        };
    });

    NSNumber *baseSize = mapping[@(textStyle)] ?: @17; // Default to body size if we don't recognize the specified ramp
    return CGFLOAT_IS_DOUBLE ? [baseSize doubleValue] : [baseSize floatValue];
}

@implementation FRNFontMetrics {
    BOOL _hasListeners;
}

+ (BOOL)requiresMainQueueSetup
{
    return YES;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(allScaleFactors)
{
    NSMutableDictionary *result = [NSMutableDictionary new];
    [FRNRecognizedTextStyles() enumerateKeysAndObjectsUsingBlock:^(NSString * styleString, __unused NSNumber * boxedTextStyle, __unused BOOL * stop) {
        result[styleString] = [self scaleFactorForStyle:styleString];
    }];
    return result;
}

RCT_EXPORT_BLOCKING_SYNCHRONOUS_METHOD(scaleFactorForStyle:(NSString *)styleString)
{
    FRNTextStyle style = [RCTConvert FRNTextStyle:styleString];
    UIFontMetrics *fontMetrics = FRNUIFontMetricsForTextStyle(style);
    CGFloat baseSize = FRNBaseSizeForTextStyle(style);
    CGFloat scaleFactor = [fontMetrics scaledValueForValue:baseSize] / baseSize;
    return @(scaleFactor);
}

#pragma mark - RCTEventEmitter

- (NSArray<NSString *> *)supportedEvents
{
    return @[ @"onFontMetricsChanged" ];
}

- (void)startObserving
{
    _hasListeners = YES;
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(onFontMetricsChanged:)
                                                 name:UIContentSizeCategoryDidChangeNotification
                                               object:nil];
}

- (void)stopObserving
{
    _hasListeners = NO;
    [[NSNotificationCenter defaultCenter] removeObserver:self];
}

#pragma mark - Event processing

- (void)onFontMetricsChanged:(NSNotification *)notification {
    if (_hasListeners) {
        [self sendEventWithName:@"onFontMetricsChanged" body:@{@"newScaleFactors": [self allScaleFactors]}];
    }
}

RCT_EXPORT_MODULE();

@end

NS_ASSUME_NONNULL_END
