/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { Image, Platform, Pressable, View } from 'react-native';

import type { Slots, UseSlots } from '@fluentui-react-native/framework';
import { compose, mergeProps } from '@fluentui-react-native/framework';
import { IconV1 as Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { SvgXml } from 'react-native-svg';

import { stylingSettings } from './MenuItemCheckbox.styling';
import type {
  MenuItemCheckboxProps,
  MenuItemCheckboxSlotProps,
  MenuItemCheckboxInfo,
  MenuItemCheckboxType,
} from './MenuItemCheckbox.types';
import { menuItemCheckboxName } from './MenuItemCheckbox.types';
import { useMenuItemCheckbox } from './useMenuItemCheckbox';
import { getAccessibilityLabel, getTooltip } from '../MenuItem/MenuItem';

export const MenuItemCheckbox = compose<MenuItemCheckboxType>({
  displayName: menuItemCheckboxName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    ...(Platform.OS === 'android' && { checkbox: Pressable }),
    checkmark: SvgXml,
    content: Text,
    iconPlaceholder: View,
    imgIcon: Image,
    fontOrSvgIcon: Icon,
  },
  useRender: (userProps: MenuItemCheckboxProps, useSlots: UseSlots<MenuItemCheckboxType>) => {
    const menuItem = useMenuItemCheckbox(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer] || userProps[layer]);

    return menuItemFinalRender(menuItem, Slots);
  },
});

export const menuItemFinalRender = (
  menuItem: MenuItemCheckboxInfo,
  Slots: Slots<MenuItemCheckboxSlotProps>,
): React.FunctionComponent<MenuItemCheckboxProps> => {
  return (final: MenuItemCheckboxProps, children: React.ReactNode) => {
    const { accessibilityLabel, icon, tooltip, ...mergedProps } = mergeProps(menuItem.props, final);

    const checkmarkXml = `
    <svg>
      <path fill='currentColor' d='M9.85355 3.14645C10.0488 3.34171 10.0488 3.65829 9.85355 3.85355L5.35355 8.35355C5.15829 8.54882 4.84171 8.54882 4.64645 8.35355L2.64645 6.35355C2.45118 6.15829 2.45118 5.84171 2.64645 5.64645C2.84171 5.45118 3.15829 5.45118 3.35355 5.64645L5 7.29289L9.14645 3.14645C9.34171 2.95118 9.65829 2.95118 9.85355 3.14645Z' />
    </svg>`;

    const androidCheckmarkPath = `
    <svg>
      <path fill='currentColor' d='M9.76497 3.20474C10.0661 3.48915 10.0797 3.96383 9.79526 4.26497L5.54526 8.76497C5.40613 8.91228 5.21332 8.99703 5.01071 8.99993C4.8081 9.00282 4.61295 8.92361 4.46967 8.78033L2.21967 6.53033C1.92678 6.23744 1.92678 5.76257 2.21967 5.46967C2.51256 5.17678 2.98744 5.17678 3.28033 5.46967L4.98463 7.17397L8.70474 3.23503C8.98915 2.9339 9.46383 2.92033 9.76497 3.20474Z' />
    </svg>`;

    const label = getAccessibilityLabel(accessibilityLabel, children[0]);
    const tooltipResult = getTooltip(tooltip, menuItem.state.hasTooltips, children[0]);

    return (
      <Slots.root {...mergedProps} accessibilityLabel={label}>
        {Platform.OS === 'android' ? (
          <Slots.checkbox onPress={mergedProps.onPress} accessible={false} focusable={false}>
            <Slots.checkmark xml={androidCheckmarkPath} />
          </Slots.checkbox>
        ) : (
          <Slots.checkmark accessible={false} xml={checkmarkXml} />
        )}
        {(icon || menuItem.state.hasIcons) && (
          <Slots.iconPlaceholder accessible={false}>
            {icon && icon.source && <Slots.imgIcon accessible={false} {...icon} />}
            {icon && (icon.svgSource || icon.fontSource) && <Slots.fontOrSvgIcon accessible={false} {...icon} />}
          </Slots.iconPlaceholder>
        )}
        {children && (
          <Slots.content accessible={false} tooltip={tooltipResult} {...(tooltipResult && { alwaysShowToolTip: true })}>
            {children}
          </Slots.content>
        )}
      </Slots.root>
    );
  };
};
