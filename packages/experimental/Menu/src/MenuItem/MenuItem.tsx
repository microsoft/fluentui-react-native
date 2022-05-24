/** @jsx withSlots */
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { compose, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/experimental-text';
import { menuItemName, MenuItemProps, MenuItemType } from './MenuItem.types';
import { useMenuItem } from './useMenuItem';
import { stylingSettings } from './MenuItem.styling';

export const MenuItem = compose<MenuItemType>({
  displayName: menuItemName,
  ...stylingSettings,
  slots: {
    root: View,
    checkmark: View,
    content: Text,
    submenuIndicator: SvgXml,
  },
  useRender: (userProps: MenuItemProps, useSlots: UseSlots<MenuItemType>) => {
    const menuItem = useMenuItem(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer]);

    return (final: MenuItemProps) => {
      const mergedProps = mergeProps(menuItem.props, final);
      const chevronXml = `
      <svg>
        <path fill='currentColor' d='M4.64645 2.14645C4.45118 2.34171 4.45118 2.65829 4.64645 2.85355L7.79289 6L4.64645 9.14645C4.45118 9.34171 4.45118 9.65829 4.64645 9.85355C4.84171 10.0488 5.15829 10.0488 5.35355 9.85355L8.85355 6.35355C9.04882 6.15829 9.04882 5.84171 8.85355 5.64645L5.35355 2.14645C5.15829 1.95118 4.84171 1.95118 4.64645 2.14645Z' />
      </svg>`;

      return (
        <Slots.root {...mergedProps}>
          {menuItem.hasCheckmarks && <Slots.checkmark />}
          {mergedProps.content && <Slots.content>{mergedProps.content}</Slots.content>}
          {menuItem.hasSubmenu && <Slots.submenuIndicator xml={chevronXml} />}
        </Slots.root>
      );
    };
  },
});
