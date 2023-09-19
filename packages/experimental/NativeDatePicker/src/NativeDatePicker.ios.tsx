import { NativeModules } from 'react-native';

export const NativeDatePicker = NativeModules.FRNDatePickerManager;
import { parseISOString } from './DatePickerUtils';
import type { DatePickerNativeParameters, NativeDatePickerInterface } from './NativeDatePicker.types.mobile';

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
}: DatePickerNativeParameters) => {
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
  return parseISOString(dateISOString);
};

export default NativeDatePicker as NativeDatePickerInterface;
