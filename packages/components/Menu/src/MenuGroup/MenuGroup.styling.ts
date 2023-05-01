import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { menuGroupName } from './MenuGroup.types';
import type { MenuGroupProps, MenuGroupTokens, MenuGroupSlotProps } from './MenuGroup.types';

export const stylingSettings: UseStylingOptions<MenuGroupProps, MenuGroupSlotProps, MenuGroupTokens> = {
  tokens: [menuGroupName],
  slotProps: {
    root: buildProps(
      (_tokens: MenuGroupTokens) => ({
        style: {
          display: 'flex',
        },
      }),
      [],
    ),
  },
};
