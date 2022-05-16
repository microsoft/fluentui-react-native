/** @jsx withSlots */
import { View } from 'react-native';
import { compose, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/experimental-text';
import { menuItemCheckboxName, MenuItemCheckboxProps, MenuItemCheckboxType } from './MenuItemCheckbox.types';
import { useMenuItemCheckbox } from './useMenuItemCheckbox';
import { stylingSettings } from './MenuItemCheckbox.styling';

export const MenuItemCheckbox = compose<MenuItemCheckboxType>({
  displayName: menuItemCheckboxName,
  ...stylingSettings,
  slots: {
    root: View,
    content: Text,
  },
  useRender: (userProps: MenuItemCheckboxProps, useSlots: UseSlots<MenuItemCheckboxType>) => {
    const menuItem = useMenuItemCheckbox(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer]);

    return (final: MenuItemCheckboxProps) => {
      const mergedProps = mergeProps(menuItem.props, final);

      return <Slots.root {...mergedProps}>{mergedProps.content && <Slots.content>{mergedProps.content}</Slots.content>}</Slots.root>;
    };
  },
});
