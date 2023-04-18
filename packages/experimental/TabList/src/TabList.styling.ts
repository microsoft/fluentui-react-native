import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';

import { tabListName } from './TabList.types';
import type { TabListTokens, TabListSlotProps, TabListProps } from './TabList.types';
import { getRootMargins, getLabelMargins, getStackMargins } from './TabListMargins';
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
    label: buildProps(
      (tokens: TabListTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...getLabelMargins(),
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
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
