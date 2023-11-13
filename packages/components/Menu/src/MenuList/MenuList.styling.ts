import { Platform } from 'react-native';

import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { layoutStyles } from '@fluentui-react-native/tokens';

import type { MenuListProps, MenuListTokens, MenuListSlotProps } from './MenuList.types';
import { menuListName } from './MenuList.types';
import { defaultMenuListTokens } from './MenuListTokens';

export const menuListStates: (keyof MenuListTokens)[] = ['hasMaxHeight'];

export const stylingSettings: UseStylingOptions<MenuListProps, MenuListSlotProps, MenuListTokens> = {
  tokens: [defaultMenuListTokens, menuListName],
  states: menuListStates,
  slotProps: {
    root: buildProps(
      (tokens: MenuListTokens, theme: Theme) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          ...layoutStyles.from(tokens, theme),
          ...(Platform.OS === 'android' && { borderRadius: tokens.borderRadius }),
        },
        gap: tokens.gap,
      }),
      ['backgroundColor', 'gap', ...layoutStyles.keys],
    ),
  },
};
