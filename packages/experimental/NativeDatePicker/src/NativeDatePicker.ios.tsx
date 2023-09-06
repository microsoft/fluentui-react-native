import { NativeModules } from 'react-native';

export const NativeDatePicker = NativeModules.FRNDatePickerManager;
import { parseISOString } from './DatePickerUtils';
import type { DatePickeriOSParameterObject } from './NativeDatePicker.types.ios';
import type { DatePickerSharedParameterObject, NativeDatePickerSharedInterface } from './NativeDatePicker.types.shared';

type DatePickerParameterObject = DatePickerSharedParameterObject & DatePickeriOSParameterObject;

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
  return parseISOString(dateISOString);
};

type NativeDatePickeriOSInterface = NativeDatePickerSharedInterface & {
  present(object: DatePickerParameterObject): void;
}

export default NativeDatePicker as NativeDatePickeriOSInterface;
