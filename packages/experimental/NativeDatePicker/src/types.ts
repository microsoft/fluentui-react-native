import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { NativeModules } from 'react-native';

export const nativeDatePickerName = 'NativeDatePicker';

export const NativeDatePickerComponent = ensureNativeComponent('MSFDatePicker');

export const { MSFDateTimePickerMode, MSFDateTimePickerDatePickerType, MSFDateTimePickerDateRangePresentation } = NativeModules.MSFDatePickerManager.getConstants();

export type NativeDatePickerMode = keyof typeof MSFDateTimePickerMode;
export type NativeDatePickerType = keyof typeof MSFDateTimePickerDatePickerType;
export type NativeDatePickerDateRangePresentation = keyof typeof MSFDateTimePickerDateRangePresentation;

export type NullableDate = Date | null;

export type NativeDatePickerBasicProps = {
  mode?: NativeDatePickerMode;
  type?: NativeDatePickerType;
  dateRangePresentation?: NativeDatePickerDateRangePresentation;
  startDate?: NullableDate;
  endDate?: NullableDate;
};

export type NullableString = string | null;

export type NativeDatePickerTitles = {
  startTitle?: NullableString;
  startSubtitle?: NullableString;
  startTab?: NullableString;
  endTitle?: NullableString;
  endSubtitle?: NullableString;
  endTab?: NullableString;
  dateTitle?: NullableString;
  dateSubtitle?: NullableString;
  dateTimeTitle?: NullableString;
  dateTimeSubtitle?: NullableString;
};

export type NativeDatePickerProps = NativeDatePickerBasicProps & NativeDatePickerTitles;

export interface NativeDatePickerTokens {
}

export type NativeDatePickerViewProps = NativeDatePickerProps & NativeDatePickerTokens;

export interface NativeDatePickerComponentType {
  props: NativeDatePickerProps;
  tokens: NativeDatePickerTokens;
  slotProps: {
    root: NativeDatePickerViewProps;
  };
}
