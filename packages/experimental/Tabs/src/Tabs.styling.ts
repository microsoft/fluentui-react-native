import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';

import { tabsName } from './Tabs.types';
import type { TabsTokens, TabsSlotProps, TabsProps } from './Tabs.types';
import { getRootMargins, getLabelMargins, getStackMargins } from './TabsMargins';
import { defaultTabsTokens } from './TabsTokens';

export const stylingSettings: UseStylingOptions<TabsProps, TabsSlotProps, TabsTokens> = {
  tokens: [defaultTabsTokens, tabsName],
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
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...getLabelMargins(),
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    stack: buildProps(
      (tokens: TabsTokens) => ({
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
