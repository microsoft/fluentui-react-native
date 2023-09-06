import { NativeModules } from 'react-native';

import { parseISOString } from './DatePickerUtils';
import type { DatePickerAndroidParameterObject } from './NativeDatePicker.types.android';
import type { DatePickerSharedParameterObject, NativeDatePickerSharedInterface } from './NativeDatePicker.types.shared';
const FRNDatePicker = NativeModules.FRNDatePicker;
const { DIALOG_MODE, DATE_RANGE_MODE } = FRNDatePicker.getConstants();

// external facing paramters
type NativeDatePickerParameterObject = DatePickerSharedParameterObject & DatePickerAndroidParameterObject;

type NativeDatePickerAndroidInterface = NativeDatePickerSharedInterface & {
  present(params: NativeDatePickerParameterObject): void
}

type FRNDatePickerParams = {
  dialogMode: number,
  dateRangeMode: number,
  startDate: string;
  endDate: string;
  callback: (startDate: string, endDate: string) => void;
}

const buildNativeParams = (params: NativeDatePickerParameterObject) : FRNDatePickerParams => {
  const nowDate = new Date();
  return {
    dialogMode: !params.dialogMode ? DIALOG_MODE.DATE : DIALOG_MODE[params.dialogMode],
    dateRangeMode: !params.dateRangeMode ? DATE_RANGE_MODE.NONE : DATE_RANGE_MODE[params.dateRangeMode],
    startDate: !params.startDate ? nowDate.toISOString() : params.startDate.toISOString(),
    endDate: !params.endDate ? nowDate.toISOString() : params.endDate.toISOString(),
    callback: params.callback
  }
}

export const NativeDatePicker: NativeDatePickerAndroidInterface = {
  present: (params: NativeDatePickerParameterObject) => {
    const frnDatePickerParams = buildNativeParams(params);
    FRNDatePicker.showDatePicker(
      frnDatePickerParams.dialogMode,
      frnDatePickerParams.dateRangeMode,
      frnDatePickerParams.startDate,
      frnDatePickerParams.endDate,
      frnDatePickerParams.callback
    );
  },
  parseISOString: (dateString: string) => {
    return parseISOString(dateString);
  }
}