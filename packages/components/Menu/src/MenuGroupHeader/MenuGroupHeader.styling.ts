import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { layoutStyles } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { menuGroupHeaderName } from './MenuGroupHeader.types';
import type { MenuGroupHeaderProps, MenuGroupHeaderTokens, MenuGroupHeaderSlotProps } from './MenuGroupHeader.types';
import { defaultMenuGroupHeaderTokens } from './MenuGroupHeaderTokens';

export const stylingSettings: UseStylingOptions<MenuGroupHeaderProps, MenuGroupHeaderSlotProps, MenuGroupHeaderTokens> = {
  tokens: [defaultMenuGroupHeaderTokens, menuGroupHeaderName],
  slotProps: {
    root: buildProps(
      (tokens: MenuGroupHeaderTokens, theme: Theme) => ({
        ...fontStyles.from(tokens, theme),
        ...layoutStyles.from(tokens, theme),
        color: tokens.color,
      }),
      [],
    ),
  },
};
