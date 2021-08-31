#import "RCTBridgeModule.h"
#import <React/RCTLog.h>
#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

static NSDictionary<NSString *, NSDictionary<NSString *, NSNumber *> *> *FRNDatePickerGetEnumMaps() {
    return @{
        @"MSFDateTimePickerMode": @{
                @"date": @(MSFDateTimePickerModeDate),
                @"dateTime": @(MSFDateTimePickerModeDateTime),
                @"dateRange": @(MSFDateTimePickerModeDateRange),
                @"dateTimeRange": @(MSFDateTimePickerModeDateTimeRange),
        },
        @"MSFDateTimePickerDatePickerType": @{
            @"calendar": @(MSFDateTimePickerDatePickerTypeCalendar),
            @"components": @(MSFDateTimePickerDatePickerTypeComponents),
        },
        @"MSFDateTimePickerDateRangePresentation": @{
            @"paged": @(MSFDateTimePickerDateRangePresentationPaged),
            @"tabbed": @(MSFDateTimePickerDateRangePresentationTabbed),
        },
    };
}

@implementation RCTConvert (FRNDatePickerAdditions)

RCT_ENUM_CONVERTER(MSFDateTimePickerMode,
				   FRNDatePickerGetEnumMaps()[@"MSFDateTimePickerMode"],
                   MSFDateTimePickerModeDate,
                   integerValue)
RCT_ENUM_CONVERTER(MSFDateTimePickerDatePickerType,
				   FRNDatePickerGetEnumMaps()[@"MSFDateTimePickerDatePickerType"],
                   MSFDateTimePickerDatePickerTypeCalendar,
                   integerValue)
RCT_ENUM_CONVERTER(MSFDateTimePickerDateRangePresentation,
				   FRNDatePickerGetEnumMaps()[@"MSFDateTimePickerDateRangePresentation"],
                   MSFDateTimePickerDateRangePresentationPaged,
                   integerValue)

@end

@interface RCT_EXTERN_MODULE(FRNDatePickerManager, NSObject)

- (NSDictionary *)constantsToExport
{
    return FRNDatePickerGetEnumMaps();
}

RCT_EXTERN_METHOD(presentWithMode:(MSFDateTimePickerMode)mode
                  dateRangePresentation:(MSFDateTimePickerDateRangePresentation)dateRangePresentation
                  datePickerType:(MSFDateTimePickerDatePickerType)datePickerType
                  startDate:(nullable NSDate *)startDate
                  endDate:(nullable NSDate *)endDate
                  startTitle:(nullable NSString *)startTitle
                  startSubtitle:(nullable NSString *)startSubtitle
                  startTab:(nullable NSString *)startTab
                  endTitle:(nullable NSString *)endTitle
                  endSubtitle:(nullable NSString *)endSubtitle
                  endTab:(nullable NSString *)endTab
                  dateTitle:(nullable NSString *)dateTitle
                  dateSubtitle:(nullable NSString *)dateSubtitle
                  timeTitle:(nullable NSString *)timeTitle
                  timeSubtitle:(nullable NSString *)timeSubtitle
                  callback:(RCTResponseSenderBlock)callback)

@end
