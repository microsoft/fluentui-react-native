import { Platform } from 'react-native';

import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';

import type { MenuItemProps, MenuItemTokens, MenuItemSlotProps } from './MenuItem.types';
import { menuItemName } from './MenuItem.types';
import { defaultMenuItemTokens } from './MenuItemTokens';

export const menuItemStates: (keyof MenuItemTokens)[] = ['hovered', 'focused', 'highlighted', 'pressed', 'disabled'];

export const stylingSettings: UseStylingOptions<MenuItemProps, MenuItemSlotProps, MenuItemTokens> = {
  tokens: [defaultMenuItemTokens, menuItemName],
  states: menuItemStates,
  slotProps: {
    root: buildProps(
      (tokens: MenuItemTokens, theme: Theme) => ({
        style: {
          alignItems: 'center',
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          flexDirection: 'row',
          ...layoutStyles.from(tokens, theme),
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', ...borderStyles.keys, ...layoutStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: MenuItemTokens) => ({
        style: {
          height: tokens.checkmarkSize,
          width: tokens.checkmarkSize,
          marginEnd: Platform.OS === 'android' ? tokens.marginEndForCheckedAndroid : tokens.gap,
        },
      }),
      ['checkmarkSize', 'gap'],
    ),
    content: buildProps(
      (tokens: MenuItemTokens, theme: Theme) => {
        return {
          color: tokens.color,
          style: {
            flexGrow: 1,
            ...fontStyles.from(tokens, theme),
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
    iconPlaceholder: buildProps(
      (tokens: MenuItemTokens) => ({
        style: {
          minHeight: tokens.iconSize,
          minWidth: tokens.iconSize,
          alignItems: 'center',
          justifyContent: 'center',
          marginEnd: tokens.gap,
        },
      }),
      ['checkmarkSize', 'gap'],
    ),
    imgIcon: buildProps(
      (tokens: MenuItemTokens) => ({
        style: { tintColor: tokens.iconColor, height: tokens.iconSize, width: tokens.iconSize },
      }),
      ['gap', 'iconColor', 'iconSize'],
    ),
    fontOrSvgIcon: buildProps(
      (tokens: MenuItemTokens) => ({ color: tokens.iconColor, size: tokens.iconSize }),
      ['gap', 'iconColor', 'iconSize'],
    ),
    submenuIndicator: buildProps(
      (tokens: MenuItemTokens) => {
        return {
          color: tokens.submenuIndicatorColor,
          height: tokens.submenuIndicatorSize,
          width: tokens.submenuIndicatorSize,
          viewBox: `0 0 ${tokens.submenuIndicatorSize} ${tokens.submenuIndicatorSize}`,
        };
      },
      ['submenuIndicatorColor', 'submenuIndicatorPadding', 'submenuIndicatorSize'],
    ),
  },
};
