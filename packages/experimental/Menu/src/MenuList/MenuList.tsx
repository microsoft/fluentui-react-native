/** @jsx withSlots */
import React from 'react';
import { View } from 'react-native';
import { compose, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { menuListName, MenuListProps, MenuListType } from './MenuList.types';
import { stylingSettings } from './MenuList.styling';
import { MenuListProvider } from '../context/menuListContext';
import { useMenuList } from './useMenuList';
import { useMenuListContextValue } from './useMenuContextValue';

export const MenuList = compose<MenuListType>({
  displayName: menuListName,
  ...stylingSettings,
  slots: {
    root: View,
  },
  useRender: (userProps: MenuListProps, useSlots: UseSlots<MenuListType>) => {
    const menuList = useMenuList(userProps);
    const contextValue = useMenuListContextValue(menuList);
    const Slots = useSlots(menuList);

    return (_final: MenuListProps, children: React.ReactNode) => {
      return (
        <MenuListProvider value={contextValue}>
          <Slots.root>{children}</Slots.root>
        </MenuListProvider>
      );
    };
  },
});

export default MenuList;
