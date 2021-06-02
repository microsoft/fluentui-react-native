import { NativeModules } from 'react-native';
export const NativeDatePicker = NativeModules.MSFDatePickerManager;
export const { MSFDateTimePickerMode, MSFDateTimePickerDatePickerType, MSFDateTimePickerDateRangePresentation } = NativeDatePicker.getConstants();

type NativeDatePickerMode = keyof typeof MSFDateTimePickerMode;
type NativeDatePickerType = keyof typeof MSFDateTimePickerDatePickerType;
type NativeDatePickerDateRangePresentation = keyof typeof MSFDateTimePickerDateRangePresentation;
type NullableDate = Date | null;
type NullableString = String | null;

interface NativeDatePickerInterface {
    present(): void;
    presentWithMode(mode: NativeDatePickerMode): void;
    presentWithStartDate(startDate: NullableDate, endDate: NullableDate): void;
    presentWithMode(
        mode: NativeDatePickerMode,
        startDate: NullableDate,
        endDate: NullableDate,
        datePickerType: NativeDatePickerType,
        dateRangePresentation: NativeDatePickerDateRangePresentation): void;
    presentWithMode(
        mode: NativeDatePickerMode,
        startDate: NullableDate,
        endDate: NullableDate,
        datePickerType: NativeDatePickerType,
        dateRangePresentation: NativeDatePickerDateRangePresentation,
        startTitle: NullableString, 
        startSubtitle: NullableString, 
        startTab: NullableString, 
        endTitle: NullableString, 
        endSubtitle: NullableString, 
        endTab: NullableString, 
        dateTitle: NullableString, 
        dateSubtitle: NullableString, 
        dateTimeTitle: NullableString, 
        dateTimeSubtitle: NullableString): void;
 }

 export default NativeDatePicker as NativeDatePickerInterface;
