import { compose, UseSlots } from '@fluentui-react-native/framework';
import { TextV1 as Text } from '@fluentui-react-native/text';
import React from 'react';
import { View } from 'react-native';
import { Svg } from 'react-native-svg';
import { optionName, OptionProps, OptionType } from './Option.types';

export const Option = compose<OptionType>({
  displayName: optionName,
  slots: {
    root: View,
    checkIcon: Svg,
    label: Text,
  },
  useRender: (_userProps: OptionProps, _useSlots: UseSlots<OptionType>) => {
    return (_final: OptionProps, ..._children: React.ReactNode[]) => {
      return null;
    };
  },
});
