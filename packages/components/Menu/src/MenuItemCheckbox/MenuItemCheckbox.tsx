/** @jsx withSlots */
import { View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { compose, mergeProps, Slots, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/experimental-text';
import {
  menuItemCheckboxName,
  MenuItemCheckboxProps,
  MenuItemCheckboxSlotProps,
  MenuItemCheckboxState,
  MenuItemCheckboxType,
} from './MenuItemCheckbox.types';
import { useMenuItemCheckbox } from './useMenuItemCheckbox';
import { stylingSettings } from './MenuItemCheckbox.styling';
import { getAccessibilityLabel } from '../MenuItem/MenuItem';
import React from 'react';

export const MenuItemCheckbox = compose<MenuItemCheckboxType>({
  displayName: menuItemCheckboxName,
  ...stylingSettings,
  slots: {
    root: View,
    checkmark: SvgXml,
    content: Text,
  },
  useRender: (userProps: MenuItemCheckboxProps, useSlots: UseSlots<MenuItemCheckboxType>) => {
    const menuItem = useMenuItemCheckbox(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer] || userProps[layer]);

    return menuItemFinalRender(menuItem, Slots);
  },
});

export const menuItemFinalRender = (
  menuItem: MenuItemCheckboxState,
  Slots: Slots<MenuItemCheckboxSlotProps>,
): React.FunctionComponent<MenuItemCheckboxProps> => {
  return (final: MenuItemCheckboxProps, children: React.ReactNode) => {
    const { accessibilityLabel, ...mergedProps } = mergeProps(menuItem.props, final);
    const checkmarkXml = `
    <svg>
      <path fill='currentColor' d='M9.85355 3.14645C10.0488 3.34171 10.0488 3.65829 9.85355 3.85355L5.35355 8.35355C5.15829 8.54882 4.84171 8.54882 4.64645 8.35355L2.64645 6.35355C2.45118 6.15829 2.45118 5.84171 2.64645 5.64645C2.84171 5.45118 3.15829 5.45118 3.35355 5.64645L5 7.29289L9.14645 3.14645C9.34171 2.95118 9.65829 2.95118 9.85355 3.14645Z' />
    </svg>`;

    const label = getAccessibilityLabel(accessibilityLabel, children[0]);

    return (
      <Slots.root {...mergedProps} accessibilityLabel={label}>
        <Slots.checkmark xml={checkmarkXml} />
        {children && <Slots.content>{children}</Slots.content>}
      </Slots.root>
    );
  };
};
