import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';

import type { MenuItemCheckboxProps, MenuItemCheckboxTokens, MenuItemCheckboxSlotProps } from './MenuItemCheckbox.types';
import { menuItemCheckboxName } from './MenuItemCheckbox.types';
import { defaultMenuItemCheckboxTokens } from './MenuItemCheckboxTokens';

export const menuItemCheckboxStates: (keyof MenuItemCheckboxTokens)[] = ['hovered', 'focused', 'pressed', 'disabled', 'checked'];

export const stylingSettings: UseStylingOptions<MenuItemCheckboxProps, MenuItemCheckboxSlotProps, MenuItemCheckboxTokens> = {
  tokens: [defaultMenuItemCheckboxTokens, menuItemCheckboxName],
  states: menuItemCheckboxStates,
  slotProps: {
    root: buildProps(
      (tokens: MenuItemCheckboxTokens, theme: Theme) => ({
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
      (tokens: MenuItemCheckboxTokens) => ({
        opacity: tokens.checkmarkVisibility,
        color: tokens.color,
        height: tokens.checkmarkSize,
        width: tokens.checkmarkSize,
        viewBox: '0 0 ' + (tokens.checkmarkSize - tokens.checkmarkPadding * 2) + ' ' + (tokens.checkmarkSize - tokens.checkmarkPadding * 2),
        style: { marginEnd: tokens.gap },
      }),
      ['checkmarkPadding', 'checkmarkSize', 'checkmarkVisibility', 'color', 'gap'],
    ),
    content: buildProps(
      (tokens: MenuItemCheckboxTokens, theme: Theme) => ({
        style: {
          flexGrow: 1,
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    iconPlaceholder: buildProps(
      (tokens: MenuItemCheckboxTokens) => ({
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
      (tokens: MenuItemCheckboxTokens) => ({
        style: { tintColor: tokens.iconColor, height: tokens.iconSize, width: tokens.iconSize },
      }),
      ['gap', 'iconColor', 'iconSize'],
    ),
    fontOrSvgIcon: buildProps(
      (tokens: MenuItemCheckboxTokens) => ({ color: tokens.iconColor, size: tokens.iconSize }),
      ['gap', 'iconColor', 'iconSize'],
    ),
  },
};
