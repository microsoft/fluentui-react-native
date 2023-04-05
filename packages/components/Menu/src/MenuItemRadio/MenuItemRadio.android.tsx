/** @jsx withSlots */
import React from 'react';
import { Image, Pressable, View } from 'react-native';

import type { Slots, UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps, withSlots } from '@fluentui-react-native/framework';
import { IconV1 as Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';

import { useMenuItemRadio } from './useMenuItemRadio';
import { getAccessibilityLabel, getTooltip } from '../MenuItem/MenuItem';
import { stylingSettings } from '../MenuItemRadio/MenuItemRadio.styling';
import type {
  MenuItemRadioProps,
  MenuItemRadioSlotProps,
  MenuItemRadioInfo,
  MenuItemRadioType,
} from '../MenuItemRadio/MenuItemRadio.types';

export const menuItemRadioName = 'MenuItemRadio';

export const MenuItemRadio = compose<MenuItemRadioType>({
  displayName: menuItemRadioName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    radioInnerCircle: View,
    radioButton: Pressable,
    content: Text,
    iconPlaceholder: View,
    imgIcon: Image,
    fontOrSvgIcon: Icon,
  },
  useRender: (userProps: MenuItemRadioProps, useSlots: UseSlots<MenuItemRadioType>) => {
    const menuItem = useMenuItemRadio(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer] || userProps[layer]);
    return menuItemRadioFinalRender(menuItem, Slots);
  },
});

export const menuItemRadioFinalRender = (
  menuItem: MenuItemRadioInfo,
  Slots: Slots<MenuItemRadioSlotProps>,
): React.FunctionComponent<MenuItemRadioProps> => {
  return (final: MenuItemRadioProps, children: React.ReactNode) => {
    const { accessibilityLabel, icon, tooltip, ...mergedProps } = mergeProps(menuItem.props, final);

    const label = getAccessibilityLabel(accessibilityLabel, children[0]);
    const tooltipResult = getTooltip(tooltip, menuItem.state.hasTooltips, children[0]);

    return (
      <Slots.root {...mergedProps} accessibilityLabel={label}>
        <Slots.radioButton onPress={mergedProps.onPress} accessible={false} focusable={false}>
          <Slots.radioInnerCircle />
        </Slots.radioButton>

        {(icon || menuItem.state.hasIcons) && (
          <Slots.iconPlaceholder accessible={false}>
            {icon && icon.source && <Slots.imgIcon accessible={false} {...icon} />}
            {icon && (icon.svgSource || icon.fontSource) && <Slots.fontOrSvgIcon accessible={false} {...icon} />}
          </Slots.iconPlaceholder>
        )}
        {children && (
          <Slots.content accessible={false} tooltip={tooltipResult}>
            {children}
          </Slots.content>
        )}
      </Slots.root>
    );
  };
};
