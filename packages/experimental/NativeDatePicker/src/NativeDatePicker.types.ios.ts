import { NativeModules } from 'react-native';
export const NativeDatePicker = NativeModules.FRNDatePickerManager;
export const { MSFDateTimePickerMode, MSFDateTimePickerDatePickerType, MSFDateTimePickerDateRangePresentation } =
  NativeDatePicker.getConstants();

// Enums from the iOS DateTimePicker in FluentUI-Apple
type NativeDatePickerType = keyof typeof MSFDateTimePickerDatePickerType;
type NativeDatePickerDateRangePresentation = keyof typeof MSFDateTimePickerDateRangePresentation;

export type DatePickerNativeIOSParameters = {
  dateRangePresentation?: NativeDatePickerDateRangePresentation;
  datePickerType?: NativeDatePickerType;
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
};
