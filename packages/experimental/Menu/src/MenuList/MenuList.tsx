/** @jsx withSlots */
import React from 'react';
import { View } from 'react-native';
import { compose, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { menuListName, MenuListProps, MenuListType } from './MenuList.types';
import { stylingSettings } from './MenuList.styling';

export const MenuList = compose<MenuListType>({
  displayName: menuListName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: MenuListProps, useSlots: UseSlots<MenuListType>) => {
    const Slots = useSlots(userProps);

    return (_final: MenuListProps, children: React.ReactNode) => {
      return <Slots.root>{children}</Slots.root>;
    };
  },
});

export default MenuList;
