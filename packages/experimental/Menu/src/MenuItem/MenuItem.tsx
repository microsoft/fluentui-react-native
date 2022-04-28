/** @jsx withSlots */
import { View } from 'react-native';
import { compose, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/experimental-text';
import { menuItemName, MenuItemProps, MenuItemType } from './MenuItem.types';
import { useMenuItem } from './useMenuItem';

export const MenuItem = compose<MenuItemType>({
  displayName: menuItemName,
  tokens: [],
  slotProps: {
    root: {
      style: { height: 48, width: 200, flexDirection: 'row', alignItems: 'center', backgroundColor: 'transparent' },
    },
    content: {
      color: 'white',
    },
  },
  slots: {
    root: View,
    content: Text,
  },
  useRender: (userProps: MenuItemProps, useSlots: UseSlots<MenuItemType>) => {
    const menuItem = useMenuItem(userProps);
    // grab the styled slots
    const Slots = useSlots(userProps);

    return (final: MenuItemProps) => {
      const mergedProps = mergeProps(menuItem.props, final);

      return <Slots.root {...mergedProps}>{mergedProps.content && <Slots.content>{mergedProps.content}</Slots.content>}</Slots.root>;
    };
  },
});
