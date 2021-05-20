#import "RCTBridgeModule.h"
#import <React/RCTLog.h>
#import <React/RCTComponent.h>
#import <React/RCTViewManager.h>

@import FluentUI;

@implementation RCTConvert (MSFDatePickerAdditions)

RCT_ENUM_CONVERTER(MSFDateTimePickerMode, (@{
    @"date": @(MSFDateTimePickerModeDate),
    @"dateTime": @(MSFDateTimePickerModeDateTime),
    @"dateRange": @(MSFDateTimePickerModeDateRange),
    @"dateTimeRange": @(MSFDateTimePickerModeDateTimeRange),
}), MSFDateTimePickerModeDate, integerValue);

RCT_ENUM_CONVERTER(MSFDateTimePickerDatePickerType, (@{
    @"calendar": @(MSFDateTimePickerDatePickerTypeCalendar),
    @"components": @(MSFDateTimePickerDatePickerTypeComponents),
}), MSFDateTimePickerDatePickerTypeCalendar, integerValue);

RCT_ENUM_CONVERTER(MSFDateTimePickerDateRangePresentation, (@{
    @"paged": @(MSFDateTimePickerDateRangePresentationPaged),
    @"tabbed": @(MSFDateTimePickerDateRangePresentationTabbed),
}), MSFDateTimePickerDateRangePresentationPaged, integerValue);

@end

@interface RCT_EXTERN_MODULE(MSFDatePickerManager, NSObject)

RCT_EXTERN_METHOD(present)

@end
