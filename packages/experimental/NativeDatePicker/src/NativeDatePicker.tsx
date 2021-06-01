/** @jsx withSlots */
import { ensureNativeComponent } from '@fluentui-react-native/component-cache';
import { nativeDatePickerName, NativeDatePickerProps, NativeDatePickerViewProps, NativeDatePickerComponentType } from './types';
import { compose, mergeProps, withSlots, UseSlots, buildProps } from '@fluentui-react-native/framework';

const NativeDatePickerComponent = ensureNativeComponent('MSFDatePickerManager');

export const NativeDatePicker = compose<NativeDatePickerComponentType>({
  displayName: nativeDatePickerName,
  tokens: [{}, nativeDatePickerName],
  slotProps: {
    root: buildProps(
      (tokens) => ({
        ...tokens,
      }),
    ),
  },
  slots: { root: NativeDatePickerComponent },
  render: (userProps: NativeDatePickerProps, useSlots: UseSlots<NativeDatePickerComponentType>) => {
    const Root = useSlots(userProps).root;
    return (rest: NativeDatePickerViewProps, ...children: React.ReactNode[]) => <Root {...mergeProps(userProps, rest)}>{children}</Root>;
  },
});
