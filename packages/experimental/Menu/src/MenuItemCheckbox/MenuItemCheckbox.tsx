/** @jsx withSlots */
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
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
    submenuIndicator: SvgXml,
  },
  useRender: (userProps: MenuItemCheckboxProps, useSlots: UseSlots<MenuItemCheckboxType>) => {
    const menuItem = useMenuItemCheckbox(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer]);

    return (final: MenuItemCheckboxProps) => {
      const mergedProps = mergeProps(menuItem.props, final);
      const chevronXml = `
      <svg width="12" height="16" viewBox="0 0 11 6">
        <path fill='currentColor' d='M0.646447 0.646447C0.841709 0.451184 1.15829 0.451184 1.35355 0.646447L5.5 4.79289L9.64645 0.646447C9.84171 0.451185 10.1583 0.451185 10.3536 0.646447C10.5488 0.841709 10.5488 1.15829 10.3536 1.35355L5.85355 5.85355C5.65829 6.04882 5.34171 6.04882 5.14645 5.85355L0.646447 1.35355C0.451184 1.15829 0.451184 0.841709 0.646447 0.646447Z' />
      </svg>`;

      return (
        <Slots.root {...mergedProps}>
          {mergedProps.content && <Slots.content>{mergedProps.content}</Slots.content>}
          {mergedProps.hasSubmenu && <Slots.submenuIndicator xml={chevronXml} />}
        </Slots.root>
      );
    };
  },
});
