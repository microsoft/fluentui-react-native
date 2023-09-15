import { NativeModules } from 'react-native';

import { parseISOString } from './DatePickerUtils';
import type { DatePickerNativeParameters, NativeDatePickerInterface } from './NativeDatePicker.types.mobile';

const FRNDatePicker = NativeModules.FRNDatePicker;
const { DIALOG_MODE, DATE_RANGE_MODE } = FRNDatePicker.getConstants();

type FRNDatePickerParams = {
  dialogMode: number;
  dateRangeMode: number;
  startDate: string;
  endDate: string;
  callback: (startDate: string, endDate: string) => void;
};

const buildNativeParams = (params: DatePickerNativeParameters): FRNDatePickerParams => {
  const nowDate = new Date();
  let dialogMode = DIALOG_MODE.DATE;
  let dateRangeMode = DATE_RANGE_MODE.NONE;

  switch (params.mode) {
    case 'date': {
      // do nothing here. Keep defaults above.
      break;
    }
    case 'dateRange': {
      dateRangeMode = !params.dateRangeMode ? DATE_RANGE_MODE.NONE : DATE_RANGE_MODE[params.dateRangeMode.toUpperCase()];
      break;
    }
    case 'dateTime': {
      dialogMode = DIALOG_MODE.DATE_TIME;
      break;
    }
    case 'dateTimeRange': {
      dialogMode = DIALOG_MODE.DATE_TIME;
      dateRangeMode = DATE_RANGE_MODE.START;
      break;
    }
  }

  return {
    dialogMode,
    dateRangeMode,
    startDate: !params.startDate ? nowDate.toISOString() : params.startDate.toISOString(),
    endDate: !params.endDate ? nowDate.toISOString() : params.endDate.toISOString(),
    callback: params.callback,
  };
};

export const NativeDatePicker: NativeDatePickerInterface = {
  present: (params: DatePickerNativeParameters) => {
    const frnDatePickerParams = buildNativeParams(params);
    FRNDatePicker.showDatePicker(
      frnDatePickerParams.dialogMode,
      frnDatePickerParams.dateRangeMode,
      frnDatePickerParams.startDate,
      frnDatePickerParams.endDate,
      frnDatePickerParams.callback,
    );
  },
  parseISOString: (dateString: string) => {
    return parseISOString(dateString);
  },
};
