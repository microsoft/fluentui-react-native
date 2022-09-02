import { compose, UseSlots } from '@fluentui-react-native/framework';
import React from 'react';
import { View } from 'react-native';
import { optionName, OptionProps, OptionType } from './Option.types';

export const Option = compose<OptionType>({
  displayName: optionName,
  slots: {
    root: View,
  },
  useRender: (_userProps: OptionProps, _useSLots: UseSlots<OptionType>) => {
    return (_final: OptionProps, ..._children: React.ReactNode[]) => {
      return null;
    };
  },
});
