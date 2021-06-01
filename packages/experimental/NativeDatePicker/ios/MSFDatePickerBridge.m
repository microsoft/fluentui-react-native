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

//- (NSDictionary *)constantsToExport
//{
//  return @{ @"date" : @(MSFDateTimePickerModeDate),
//            @"statusBarAnimationFade" : @(UIStatusBarAnimationFade),
//            @"statusBarAnimationSlide" : @(UIStatusBarAnimationSlide) };
//};

// Properties used directly by the `DateTimePicker.present` method
RCT_EXPORT_VIEW_PROPERTY(mode, MSFDateTimePickerMode);
RCT_EXPORT_VIEW_PROPERTY(startDate, nonnull NSDate);
RCT_EXPORT_VIEW_PROPERTY(endDate, nullable NSDate);
RCT_EXPORT_VIEW_PROPERTY(type, MSFDateTimePickerDatePickerType);
RCT_EXPORT_VIEW_PROPERTY(dateRangePresentation, MSFDateTimePickerDateRangePresentation);

// Properties of `DateTimePicker.Titles`
//RCT_REMAP_VIEW_PROPERTY(buttonStyle, style, MSFButtonStyle);

RCT_EXTERN_METHOD(present)

@end
