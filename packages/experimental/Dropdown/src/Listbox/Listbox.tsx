import { compose, UseSlots } from '@fluentui-react-native/framework';
import React from 'react';
import { View } from 'react-native';
import { listboxName, ListboxProps, ListboxType } from './Listbox.types';

export const Listbox = compose<ListboxType>({
  displayName: listboxName,
  slots: {
    root: View,
  },
  useRender: (_userProps: ListboxProps, _useSLots: UseSlots<ListboxType>) => {
    return (_final: ListboxProps, ..._children: React.ReactNode[]) => {
      return null;
    };
  },
});
