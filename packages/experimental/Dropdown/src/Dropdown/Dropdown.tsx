import { ButtonV1 as Button } from '@fluentui-react-native/button';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { Icon } from '@fluentui-react-native/icon';
import React from 'react';
import { View } from 'react-native';
import { dropdownName, DropdownProps, DropdownType } from './Dropdown.types';

export const Dropdown = compose<DropdownType>({
  displayName: dropdownName,
  slots: {
    root: View,
    button: Button,
    expandIcon: Icon,
  },
  useRender: (_userProps: DropdownProps, _useSLots: UseSlots<DropdownType>) => {
    return (_final: DropdownProps, ..._children: React.ReactNode[]) => {
      return null;
    };
  },
});
