import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { layoutStyles } from '@fluentui-react-native/tokens';
import { defaultMenuListTokens } from './MenuListTokens';
import { menuListName, MenuListProps, MenuListTokens, MenuListSlotProps } from './MenuList.types';

export const stylingSettings: UseStylingOptions<MenuListProps, MenuListSlotProps, MenuListTokens> = {
  tokens: [defaultMenuListTokens, menuListName],
  slotProps: {
    root: buildProps(
      (tokens: MenuListTokens, theme: Theme) => ({
        style: {
          backgroundColor: tokens.backgroundColor,
          display: 'flex',
          ...layoutStyles.from(tokens, theme),
        },
        gap: tokens.gap,
      }),
      ['backgroundColor', 'gap', ...layoutStyles.keys],
    ),
  },
};
