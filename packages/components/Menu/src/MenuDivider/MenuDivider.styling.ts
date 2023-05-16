import { Platform } from 'react-native';

import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import type { MenuDividerProps, MenuDividerTokens, MenuDividerSlotProps } from './MenuDivider.types';
import { menuDividerName } from './MenuDivider.types';
import { defaultMenuDividerTokens } from './MenuDividerTokens';

export const stylingSettings: UseStylingOptions<MenuDividerProps, MenuDividerSlotProps, MenuDividerTokens> = {
  tokens: [defaultMenuDividerTokens, menuDividerName],
  tokensThatAreAlsoProps: ['insetSize'],
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
          ...(Platform.OS === 'android' && { marginStart: tokens.insetSize }),
        },
      }),
      ['backgroundColor', 'height', 'margin', 'marginVertical', 'width'],
    ),
  },
};
