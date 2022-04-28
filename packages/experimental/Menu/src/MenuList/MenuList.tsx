import React from 'react';
import { View } from 'react-native';
import { stagedComponent } from '@fluentui-react-native/framework';
import { menuListName, MenuListProps } from './MenuList.types';

export const MenuList = stagedComponent((_props: MenuListProps) => {
  return (_rest: MenuListProps, children: React.ReactNode) => {
    return <View>{children}</View>;
  };
});
MenuList.displayName = menuListName;

export default MenuList;
