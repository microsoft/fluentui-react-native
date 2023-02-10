import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles, layoutStyles } from '@fluentui-react-native/tokens';
import { defaultMenuItemTokens } from './MenuItemTokens';
import type { MenuItemProps, MenuItemTokens, MenuItemSlotProps } from './MenuItem.types';
import { menuItemName } from './MenuItem.types';

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
          marginEnd: tokens.gap,
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
