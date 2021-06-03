import { NativeModules } from 'react-native';
export const NativeDatePicker = NativeModules.MSFDatePickerManager;
export const { MSFDateTimePickerMode, MSFDateTimePickerDatePickerType, MSFDateTimePickerDateRangePresentation } = NativeDatePicker.getConstants();

type NativeDatePickerMode = keyof typeof MSFDateTimePickerMode;
type NativeDatePickerType = keyof typeof MSFDateTimePickerDatePickerType;
type NativeDatePickerDateRangePresentation = keyof typeof MSFDateTimePickerDateRangePresentation;
type NullableDate = Date | null;
type NullableString = String | null;

interface DatePickerParameterObject {
    mode?: NativeDatePickerMode;
    dateRangePresentation?: NativeDatePickerDateRangePresentation;
    datePickerType?: NativeDatePickerType;
    startDate?: NullableDate;
    endDate?: NullableDate;
    startTitle?: NullableString;
    startSubtitle?: NullableString;
    startTab?: NullableString;
    endTitle?: NullableString;
    endSubtitle?: NullableString;
    endTab?: NullableString;
    dateTitle?: NullableString;
    dateSubtitle?: NullableString;
    timeTitle?: NullableString;
    timeSubtitle?: NullableString;
}

NativeDatePicker.present = ({
    mode = "date",
    dateRangePresentation = "tabbed",
    datePickerType = "calendar",
    startDate = null,
    endDate = null,
    startTitle = null,
    startSubtitle = null,
    startTab = null,
    endTitle = null,
    endSubtitle = null,
    endTab = null,
    dateTitle = null,
    dateSubtitle = null,
    timeTitle = null,
    timeSubtitle = null,
}: DatePickerParameterObject) => {
    NativeDatePicker.presentWithOptions(
        mode,
        dateRangePresentation,
        datePickerType,
        startDate,
        endDate,
        startTitle,
        startSubtitle,
        startTab,
        endTitle,
        endSubtitle,
        endTab,
        dateTitle,
        dateSubtitle,
        timeTitle,
        timeSubtitle
    );
}

interface NativeDatePickerInterface {
    present(object: DatePickerParameterObject): void;
}

 export default NativeDatePicker as NativeDatePickerInterface;
