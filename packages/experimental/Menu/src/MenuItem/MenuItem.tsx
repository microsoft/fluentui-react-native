/** @jsx withSlots */
import { I18nManager, View } from 'react-native';
import { SvgXml } from 'react-native-svg';
import { compose, memoize, mergeProps, UseSlots, withSlots } from '@fluentui-react-native/framework';
import { Text } from '@fluentui-react-native/experimental-text';
import { menuItemName, MenuItemProps, MenuItemType } from './MenuItem.types';
import { useMenuItem } from './useMenuItem';
import { stylingSettings } from './MenuItem.styling';
import React from 'react';

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
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer] || userProps[layer]);

    return (final: MenuItemProps, children: React.ReactNode) => {
      const { accessibilityLabel, ...mergedProps } = mergeProps(menuItem.props, final);
      const chevronXml = I18nManager.isRTL
        ? `
          <svg>
            <path fill='currentColor' d='M7.35355 2.14645C7.54882 2.34171 7.54882 2.65829 7.35355 2.85355L4.20711 6L7.35355 9.14645C7.54882 9.34171 7.54882 9.65829 7.35355 9.85355C7.15829 10.0488 6.84171 10.0488 6.64645 9.85355L3.14645 6.35355C2.95118 6.15829 2.95118 5.84171 3.14645 5.64645L6.64645 2.14645C6.84171 1.95118 7.15829 1.95118 7.35355 2.14645Z' />
          </svg>`
        : `
          <svg>
            <path fill='currentColor' d='M4.64645 2.14645C4.45118 2.34171 4.45118 2.65829 4.64645 2.85355L7.79289 6L4.64645 9.14645C4.45118 9.34171 4.45118 9.65829 4.64645 9.85355C4.84171 10.0488 5.15829 10.0488 5.35355 9.85355L8.85355 6.35355C9.04882 6.15829 9.04882 5.84171 8.85355 5.64645L5.35355 2.14645C5.15829 1.95118 4.84171 1.95118 4.64645 2.14645Z' />
          </svg>`;

      // We only automatically support the one child string.
      const label = getAccessibilityLabel(accessibilityLabel, children[0]);

      return (
        <Slots.root {...mergedProps} accessibilityLabel={label}>
          {menuItem.hasCheckmarks && <Slots.checkmark />}
          {children && <Slots.content>{children}</Slots.content>}
          {menuItem.hasSubmenu && <Slots.submenuIndicator xml={chevronXml} />}
        </Slots.root>
      );
    };
  },
});

const getAccessibilityLabelWorker = (accessibilityLabel: string, child: React.ReactNode) => {
  if (accessibilityLabel !== undefined) {
    return accessibilityLabel;
  }

  if (typeof child === 'string') {
    return child;
  }

  return '';
};
export const getAccessibilityLabel = memoize(getAccessibilityLabelWorker);
