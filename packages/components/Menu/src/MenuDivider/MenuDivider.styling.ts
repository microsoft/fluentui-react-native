import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { defaultMenuDividerTokens } from './MenuDividerTokens.win32';
import { menuDividerName, MenuDividerProps, MenuDividerTokens, MenuDividerSlotProps } from './MenuDivider.types';

export const stylingSettings: UseStylingOptions<MenuDividerProps, MenuDividerSlotProps, MenuDividerTokens> = {
  tokens: [defaultMenuDividerTokens, menuDividerName],
  slotProps: {
    root: buildProps(
      (tokens: MenuDividerTokens) => ({
        style: {
          height: tokens.height,
          width: tokens.width,
          backgroundColor: tokens.backgroundColor,
          margin: tokens.margin,
          marginVertical: tokens.marginVertical,
          display: 'flex',
        },
      }),
      ['backgroundColor', 'height', 'margin', 'marginVertical', 'width'],
    ),
  },
};
