import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles } from '@fluentui-react-native/tokens';

import { DrawerV1Name } from './DrawerV1.types';
import type { DrawerV1Tokens, DrawerV1SlotProps, DrawerV1Props } from './DrawerV1.types';
import { defaultDrawerV1Tokens } from './DrawerV1Tokens';

export const DrawerV1States: (keyof DrawerV1Tokens)[] = ['hasIcon'];

export const stylingSettings: UseStylingOptions<DrawerV1Props, DrawerV1SlotProps, DrawerV1Tokens> = {
  tokens: [defaultDrawerV1Tokens, DrawerV1Name],
  states: DrawerV1States,
  slotProps: {
    root: buildProps(
      (tokens: DrawerV1Tokens, theme: Theme) => ({
        scrollEnabled: false,
        contentContainerStyle: {
          display: 'flex',
          alignItems: 'flex-start',
          flexDirection: 'column',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          backgroundColor: tokens.backgroundColor,
          paddingHorizontal: tokens.paddingHorizontal,
          ...borderStyles.from(tokens, theme),
          ...layoutStyles.from(tokens, theme),
        },
      }),
      ['backgroundColor', 'paddingHorizontal', ...borderStyles.keys, ...layoutStyles.keys],
    ),
  },
};
