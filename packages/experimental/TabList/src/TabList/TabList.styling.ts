import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps, layoutStyles } from '@fluentui-react-native/framework';

import { tabListName } from './TabList.types';
import type { TabListTokens, TabListSlotProps, TabListProps } from './TabList.types';
import { defaultTabListTokens } from './TabListTokens';

export const stylingSettings: UseStylingOptions<TabListProps, TabListSlotProps, TabListTokens> = {
  tokens: [defaultTabListTokens, tabListName],
  states: ['vertical'],
  slotProps: {
    root: buildProps(
      (tokens: TabListTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          ...layoutStyles.from(tokens, theme),
        },
      }),
      [...layoutStyles.keys],
    ),
    stack: buildProps(
      (tokens) => ({
        style: {
          flexDirection: tokens.direction,
        },
      }),
      ['direction'],
    ),
  },
};
