#import "RCTBridgeModule.h"
#import <React/RCTLog.h>
#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

static NSDictionary<NSString *, NSDictionary<NSString *, NSNumber *> *> *MSFDatePickerGetEnumMaps() {
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

@implementation RCTConvert (MSFDatePickerAdditions)

RCT_ENUM_CONVERTER(MSFDateTimePickerMode, MSFDatePickerGetEnumMaps()[@"MSFDateTimePickerMode"], MSFDateTimePickerModeDate, integerValue)
RCT_ENUM_CONVERTER(MSFDateTimePickerDatePickerType, MSFDatePickerGetEnumMaps()[@"MSFDateTimePickerDatePickerType"], MSFDateTimePickerDatePickerTypeCalendar, integerValue)
RCT_ENUM_CONVERTER(MSFDateTimePickerDateRangePresentation, MSFDatePickerGetEnumMaps()[@"MSFDateTimePickerDateRangePresentation"], MSFDateTimePickerDateRangePresentationPaged, integerValue)

@end

@interface RCT_EXTERN_MODULE(MSFDatePickerManager, NSObject)

- (NSDictionary *)constantsToExport
{
    return MSFDatePickerGetEnumMaps();
}

RCT_EXTERN_METHOD(presentWithMode:(MSFDateTimePickerMode)mode startDate:(nullable NSDate *)startDate endDate:(nullable NSDate *)endDate datePickerType:(MSFDateTimePickerDatePickerType)datePickerType dateRangePresentation: (MSFDateTimePickerDateRangePresentation)dateRangePresentation startTitle:(nullable NSString *)startTitle startSubtitle:(nullable NSString *)startSubtitle startTab:(nullable NSString *)startTab endTitle:(nullable NSString *)endTitle endSubtitle:(nullable NSString *)endSubtitle endTab:(nullable NSString *)endTab dateTitle:(nullable NSString *)dateTitle dateSubtitle:(nullable NSString *)dateSubtitle dateTimeTitle:(nullable NSString *)dateTimeTitle dateTimeSubtitle:(nullable NSString *)dateTimeSubtitle)

RCT_EXTERN_METHOD(presentWithMode:(MSFDateTimePickerMode)mode startDate:(nullable NSDate *)startDate endDate:(nullable NSDate *)endDate datePickerType:(MSFDateTimePickerDatePickerType)datePickerType dateRangePresentation: (MSFDateTimePickerDateRangePresentation)dateRangePresentation)

RCT_EXTERN_METHOD(presentWithMode:(MSFDateTimePickerMode)mode)

RCT_EXTERN_METHOD(presentWithStartDate:(nullable NSDate *)startDate endDate:(nullable NSDate *)endDate)

RCT_EXTERN_METHOD(present)

@end
