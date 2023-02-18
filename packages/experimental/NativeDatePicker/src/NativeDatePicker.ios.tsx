import { NativeModules } from 'react-native';
export const NativeDatePicker = NativeModules.FRNDatePickerManager;
export const { MSFDateTimePickerMode, MSFDateTimePickerDatePickerType, MSFDateTimePickerDateRangePresentation } =
  NativeDatePicker.getConstants();

// Enums from the iOS DateTimePicker in FluentUI-Apple
type NativeDatePickerMode = keyof typeof MSFDateTimePickerMode;
type NativeDatePickerType = keyof typeof MSFDateTimePickerDatePickerType;
type NativeDatePickerDateRangePresentation = keyof typeof MSFDateTimePickerDateRangePresentation;

interface DatePickerParameterObject {
  mode?: NativeDatePickerMode;
  dateRangePresentation?: NativeDatePickerDateRangePresentation;
  datePickerType?: NativeDatePickerType;
  startDate?: Date;
  endDate?: Date;
  referenceStartDate?: Date;
  referenceEndDate?: Date;
  startTitle?: string;
  startSubtitle?: string;
  startTab?: string;
  endTitle?: string;
  endSubtitle?: string;
  endTab?: string;
  dateTitle?: string;
  dateSubtitle?: string;
  timeTitle?: string;
  timeSubtitle?: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  callback: Function;
}

NativeDatePicker.present = ({
  mode = 'date',
  dateRangePresentation = 'tabbed',
  datePickerType = 'calendar',
  startDate = null,
  endDate = null,
  referenceStartDate = null,
  referenceEndDate = null,
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
  callback,
}: DatePickerParameterObject) => {
  NativeDatePicker.presentWithMode(
    mode,
    dateRangePresentation,
    datePickerType,
    startDate?.toISOString(),
    endDate?.toISOString(),
    referenceStartDate?.toISOString(),
    referenceEndDate?.toISOString(),
    startTitle,
    startSubtitle,
    startTab,
    endTitle,
    endSubtitle,
    endTab,
    dateTitle,
    dateSubtitle,
    timeTitle,
    timeSubtitle,
    callback,
  );
};

// We get date values back from the native side as strings in ISO 8601 format and UTC.
// We want to immediately put them back into `Date` objects in local time.
NativeDatePicker.parseISOString = (dateISOString: string): Date => {
  if (dateISOString == null) {
    return null;
  }
  const dateParts: number[] = dateISOString.split(/\D+/).map((x) => parseInt(x, 10));
  dateParts[1]--; // Date.UTC's `month` arg is zero-based
  const dateUTC = Date.UTC.apply(null, dateParts);
  return new Date(dateUTC);
};

interface NativeDatePickerInterface {
  present(object: DatePickerParameterObject): void;
  parseISOString(dateISOString: string): Date;
}

export default NativeDatePicker as NativeDatePickerInterface;
