import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { tabListName } from './TabList.types';
import type { TabListTokens, TabListSlotProps, TabListProps } from './TabList.types';
import { defaultTabListTokens } from './TabListTokens';

export const stylingSettings: UseStylingOptions<TabListProps, TabListSlotProps, TabListTokens> = {
  tokens: [defaultTabListTokens, tabListName],
  states: ['vertical'],
  slotProps: {
    root: buildProps(
      () => ({
        style: {
          display: 'flex',
        },
      }),
      [],
    ),
    stack: buildProps(
      (tokens: TabListTokens) => ({
        style: {
          flexDirection: tokens.flexDirection,
        },
      }),
      ['vertical'],
    ),
  },
};
