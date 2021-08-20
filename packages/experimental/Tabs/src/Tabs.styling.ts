import { tabsName, TabsTokens, TabsSlotProps, TabsProps } from './Tabs.types';
import { Theme, UseStylingOptions, buildProps } from '@fluentui-react-native/framework';
import { fontStyles } from '@fluentui-react-native/tokens';

import { defaultTabsTokens } from './TabsTokens';

export const stylingSettings: UseStylingOptions<TabsTokens, TabsSlotProps, TabsProps> = {
  tokens: [defaultTabsTokens, tabsName],
  slotProps: {
    root: buildProps(
      (tokens: TabsTokens, theme: Theme) => ({
        style: {
          display: 'flex',
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
