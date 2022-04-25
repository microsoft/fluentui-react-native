/** @jsx withSlots */
import { View } from 'react-native';
import { compose, UseSlots } from '@fluentui-react-native/framework';
import { menuItemName, MenuItemProps, MenuItemType } from './MenuItem.types';

export const MenuItem = compose<MenuItemType>({
  displayName: menuItemName,
  slots: {
    root: View,
  },
  useRender: (_userProps: MenuItemProps, _useSlots: UseSlots<MenuItemType>) => {
    return null;
  },
});

export default MenuItem;
