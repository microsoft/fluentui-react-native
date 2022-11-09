#import <React/RCTBridgeModule.h>
#import <React/RCTEventEmitter.h>

@interface FRNFontMetrics : RCTEventEmitter <RCTBridgeModule>
@end

#import <React/RCTConvert.h>

typedef NS_ENUM(NSInteger, FRNTextStyle) {
    FRNTextStyleUndefined,
    FRNTextStyleCaption2,
    FRNTextStyleCaption1,
    FRNTextStyleFootnote,
    FRNTextStyleSubheadline,
    FRNTextStyleCallout,
    FRNTextStyleBody,
    FRNTextStyleHeadline,
    FRNTextStyleTitle3,
    FRNTextStyleTitle2,
    FRNTextStyleTitle1,
    FRNTextStyleLargeTitle
};

@interface RCTConvert (FRNFontMetrics)

+ (FRNTextStyle)FRNTextStyle:(nullable id)json;

@end

UIFontMetrics *_Nonnull FRNUIFontMetricsForTextStyle(FRNTextStyle textStyle);
CGFloat FRNBaseSizeForTextStyle(FRNTextStyle textStyle);
