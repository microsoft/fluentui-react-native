/** @jsx withSlots */
import { View } from 'react-native';
import { Text } from '@fluentui-react-native/text';
import { switchName, SwitchType, SwitchProps } from './Switch.types';
import { compose } from '@fluentui-react-native/framework';

export const Switch = compose<SwitchType>({
  displayName: switchName,
  slots: {
    root: View,
    label: Text,
    track: View,
    thumb: View,
    toggleContainer: View,
    dummyOnText: Text,
    dummyOffText: Text,
    onOffText: Text,
    onOffTextContainer: View,
  },
  useRender: (_userProps: SwitchProps) => {
    return (_final: SwitchProps) => {
      return null; // Only implemented for Win32
    };
  },
});
