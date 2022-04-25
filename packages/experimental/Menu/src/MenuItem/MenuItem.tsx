import React from 'react';
import { stagedComponent } from '@fluentui-react-native/framework';
import { menuItemName, MenuItemProps } from './MenuItem.types';

export const MenuItem = stagedComponent((_props: MenuItemProps) => {
  return (_rest: MenuItemProps, _children: React.ReactNode) => {
    return null;
  };
});
MenuItem.displayName = menuItemName;

export default MenuItem;
