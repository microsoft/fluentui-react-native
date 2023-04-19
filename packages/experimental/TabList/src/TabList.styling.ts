import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { tabListName } from './TabList.types';
import type { TabListTokens, TabListSlotProps, TabListProps } from './TabList.types';
import { getRootMargins, getStackMargins } from './TabListMargins';
import { defaultTabListTokens } from './TabListTokens';

export const stylingSettings: UseStylingOptions<TabListProps, TabListSlotProps, TabListTokens> = {
  tokens: [defaultTabListTokens, tabListName],
  slotProps: {
    root: buildProps(
      () => ({
        style: {
          display: 'flex',
          minHeight: 32,
          minWidth: 80,
          ...getRootMargins(),
        },
      }),
      [],
    ),
    stack: buildProps(
      (tokens: TabListTokens) => ({
        style: {
          flexDirection: 'row',
          backgroundColor: tokens.backgroundColor,
          ...getStackMargins(),
        },
      }),
      ['backgroundColor'],
    ),
  },
};
