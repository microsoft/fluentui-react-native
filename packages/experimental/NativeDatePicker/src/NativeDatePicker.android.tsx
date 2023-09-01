import { NativeModules } from 'react-native';
const FRNDatePicker = NativeModules.FRNDatePicker;

interface NativeDatePickerAndroidInterface {
  present(params: any): void
}

export const NativeDatePicker: NativeDatePickerAndroidInterface = {
  present: (params: any) => {
    FRNDatePicker.consoleLog('Hello World ' + params);
  }
}