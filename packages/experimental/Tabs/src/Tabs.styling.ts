import { tabsName, TabsTokens, TabsSlotProps, TabsProps } from './Tabs.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { borderStyles, layoutStyles, fontStyles, shadowStyles } from '@fluentui-react-native/tokens';

import { defaultTabsItemTokens } from './TabsItemTokens';

export const stylingSettings: UseStylingOptions<TabsTokens, TabsSlotProps, TabsProps> = {
  tokens: [defaultTabsItemTokens, tabsName],
  slotProps: {
    root: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          // ...borderStyles.from(tokens, theme),
          // ...layoutStyles.from(tokens, theme),
          // ...shadowStyles.from(tokens, theme),
        },
      }),
      [],
    ),
    label: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          ...fontStyles.from(tokens, theme),
        },
      }),
      [...fontStyles.keys],
    ),
    stack: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
        },
      }),
      [],
    ),
  },
};
