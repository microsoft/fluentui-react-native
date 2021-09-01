import { tabsName, TabsTokens, TabsSlotProps, TabsProps } from './Tabs.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';

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
        },
      }),
      [],
    ),
    label: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        variant: 'subheaderSemibold',
        style: {
          ...fontStyles.from(tokens, theme),
        },
      }),
      [...fontStyles.keys],
    ),
    stack: buildProps(
      () => ({
        style: {
          flexDirection: 'row',
        },
      }),
      [],
    ),
  },
};
