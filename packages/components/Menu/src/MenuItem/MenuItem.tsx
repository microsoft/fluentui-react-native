/** @jsxImportSource @fluentui-react-native/framework-base */
import React from 'react';
import { I18nManager, Image, Pressable, View } from 'react-native';

import type { UseSlots } from '@fluentui-react-native/framework';
import { compose, memoize, mergeProps } from '@fluentui-react-native/framework';
import { IconV1 as Icon } from '@fluentui-react-native/icon';
import { TextV1 as Text } from '@fluentui-react-native/text';
import { SvgXml } from 'react-native-svg';

import { stylingSettings } from './MenuItem.styling';
import type { MenuItemProps, MenuItemType } from './MenuItem.types';
import { menuItemName } from './MenuItem.types';
import { useMenuItem } from './useMenuItem';

export const MenuItem = compose<MenuItemType>({
  displayName: menuItemName,
  ...stylingSettings,
  slots: {
    root: Pressable,
    checkmark: View,
    content: Text,
    iconPlaceholder: View,
    imgIcon: Image,
    fontOrSvgIcon: Icon,
    submenuIndicator: SvgXml,
  },
  useRender: (userProps: MenuItemProps, useSlots: UseSlots<MenuItemType>) => {
    const menuItem = useMenuItem(userProps);
    const Slots = useSlots(userProps, (layer): boolean => menuItem.state[layer] || userProps[layer]);

    return (final: MenuItemProps, children: React.ReactNode) => {
      const { accessibilityLabel, icon, tooltip, ...mergedProps } = mergeProps(menuItem.props, final);
      const chevronXml = I18nManager.isRTL
        ? `
          <svg>
          <path fill='currentColor' d="M10.2603 3.20041C10.5639 3.48226 10.5814 3.95681 10.2996 4.26034L6.77348 8L10.2996 11.7397C10.5814 12.0432 10.5639 12.5177 10.2603 12.7996C9.9568 13.0815 9.48226 13.0639 9.2004 12.7603L5.2004 8.51034C4.9332 8.22258 4.9332 7.77743 5.2004 7.48966L9.20041 3.23966C9.48226 2.93613 9.95681 2.91856 10.2603 3.20041Z"/>
          </svg>`
        : `
          <svg>
          <path fill='currentColor' d="M5.73966 3.20041C5.43613 3.48226 5.41856 3.95681 5.70041 4.26034L9.22652 8L5.70041 11.7397C5.41856 12.0432 5.43613 12.5177 5.73967 12.7996C6.0432 13.0815 6.51775 13.0639 6.7996 12.7603L10.7996 8.51034C11.0668 8.22258 11.0668 7.77743 10.7996 7.48966L6.7996 3.23966C6.51775 2.93613 6.0432 2.91856 5.73966 3.20041Z"/>
          </svg>`;

      // We only automatically support the one child string.
      const label = getAccessibilityLabel(accessibilityLabel, children[0]);
      const tooltipResult = getTooltip(tooltip, menuItem.state.hasTooltips, children[0]);

      return (
        <Slots.root {...mergedProps} accessibilityLabel={label}>
          {menuItem.state.hasCheckmarks && <Slots.checkmark accessible={false} />}
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
          {menuItem.state.hasSubmenu && <Slots.submenuIndicator accessible={false} xml={chevronXml} />}
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

  return undefined;
};
export const getAccessibilityLabel = memoize(getAccessibilityLabelWorker);

const getTooltipWorker = (tooltip: string, hasTooltips: boolean, child: React.ReactNode) => {
  if (tooltip !== undefined) {
    return tooltip;
  }

  if (hasTooltips && typeof child === 'string') {
    return child;
  }

  return undefined;
};
export const getTooltip = memoize(getTooltipWorker);
