import type { DatePickerNativeAndroidParameters } from './NativeDatePicker.types.android';
import type { DatePickerNativeIOSParameters } from './NativeDatePicker.types.ios';

export type DatePickerNativeSharedParameters = {
  mode?: 'date' | 'dateTime' | 'dateRange' | 'dateTimeRange';
  startDate?: Date;
  endDate?: Date;
  callback: (startDate: string, endDate: string) => void;
};

export type DatePickerNativeParameters = DatePickerNativeSharedParameters &
  DatePickerNativeIOSParameters &
  DatePickerNativeAndroidParameters;

export type NativeDatePickerInterface = {
  present(params: DatePickerNativeParameters): void;
  parseISOString(dateISOString: string): Date;
};
