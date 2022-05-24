import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultMenuItemTokens } from './MenuItemTokens';
import { menuItemName, MenuItemProps, MenuItemTokens, MenuItemSlotProps } from './MenuItem.types';
import { I18nManager } from 'react-native';

export const menuItemStates: (keyof MenuItemTokens)[] = ['hovered', 'focused', 'pressed', 'disabled'];

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
        },
      }),
      ['backgroundColor', ...layoutStyles.keys],
    ),
    checkmark: buildProps(
      (tokens: MenuItemTokens) => ({
        style: {
          height: tokens.checkmarkSize,
          width: tokens.checkmarkSize,
          marginEnd: tokens.gap,
        },
      }),
      ['checkmarkSize', 'gap'],
    ),
    content: buildProps(
      (tokens: MenuItemTokens, theme: Theme) => {
        return {
          style: {
            flexGrow: 1,
            color: tokens.color,
            ...fontStyles.from(tokens, theme),
          },
        };
      },
      ['color', ...fontStyles.keys],
    ),
    submenuIndicator: buildProps(
      (tokens: MenuItemTokens) => {
        return {
          color: tokens.color,
          height: 16,
          width: 16,
          viewBox: '0 0 ' + (16 - 2 * 2) + ' ' + (16 - 2 * 2),
          transform: I18nManager.isRTL && 'translate(2048, 0) scale(-1, 1)',
        };
      },
      ['color'],
    ),
  },
};
