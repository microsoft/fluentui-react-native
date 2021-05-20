/** @jsx withSlots */
// import * as React from 'react';
import { NativeModules } from 'react-native';
// import { nativeDatePickerName, NativeDatePickerType, NativeDatePickerProps, NativeDatePickerViewProps } from './NativeDatePicker.types';
// import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';

export const { MSFDatePickerManager } = NativeModules;

// const NativeDatePickerComponent = NativeModules.MSFDatePickerManager;

// export const NativeDatePicker = compose<NativeDatePickerType>({
//   displayName: nativeDatePickerName,
//   tokens: [{}, nativeDatePickerName],
//   slotProps: {
//     root: buildProps(
//       () => ({}),
//     ),
//   },
//   slots: { root: NativeDatePickerComponent },
//   render: (userProps: NativeDatePickerProps, useSlots: UseSlots<NativeDatePickerType>) => {
//     const Root = useSlots(userProps).root;
//     return (rest: NativeDatePickerViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(userProps, rest)}>{children}</Root>;
//   },
// });
