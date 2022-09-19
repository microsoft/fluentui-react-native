import { compose, UseSlots } from '@fluentui-react-native/framework';
import React from 'react';
import { View } from 'react-native';
import { dropdownName, DropdownProps, DropdownType } from './Dropdown.types';

export const Dropdown = compose<DropdownType>({
  displayName: dropdownName,
  slots: {
    root: View,
  },
  useRender: (_userProps: DropdownProps, _useSLots: UseSlots<DropdownType>) => {
    return (_final: DropdownProps, ..._children: React.ReactNode[]) => {
      return null;
    };
  },
});
