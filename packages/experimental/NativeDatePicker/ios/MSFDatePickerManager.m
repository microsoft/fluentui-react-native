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


@interface RCT_EXTERN_MODULE(MSFDatePickerManager, RCTViewManager)

- (NSDictionary *)constantsToExport
{
    return MSFDatePickerGetEnumMaps();
}

// Properties used directly by the `DateTimePicker.present` method
RCT_EXPORT_VIEW_PROPERTY(mode, MSFDateTimePickerMode)
RCT_EXPORT_VIEW_PROPERTY(startDate, nullable NSDate)
RCT_EXPORT_VIEW_PROPERTY(endDate, nullable NSDate)
RCT_EXPORT_VIEW_PROPERTY(type, MSFDateTimePickerDatePickerType)
RCT_EXPORT_VIEW_PROPERTY(dateRangePresentation, MSFDateTimePickerDateRangePresentation)

// Properties of `DateTimePicker.Titles`
RCT_REMAP_VIEW_PROPERTY(startTitle, titles.startTitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(startSubtitle, titles.startSubtitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(startTab, titles.startTab, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(endTitle, titles.endTitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(endSubtitle, titles.endSubtitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(endTab, titles.endTab, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(dateTitle, titles.dateTitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(dateSubtitle, titles.dateSubtitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(dateTimeTitle, titles.dateTimeTitle, nullable NSString)
RCT_REMAP_VIEW_PROPERTY(dateTimeSubtitle, titles.dateTimeSubtitle, nullable NSString)

@end
