import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';
import { borderStyles, fontStyles } from '@fluentui-react-native/tokens';

import { tabsItemName } from './TabsItem.types';
import type { TabsItemSlotProps, TabsItemTokens, TabsItemProps } from './TabsItem.types';
import { tabsItemStates, defaultTabsItemTokens } from './TabsItemTokens';

export const stylingSettings: UseStylingOptions<TabsItemProps, TabsItemSlotProps, TabsItemTokens> = {
  tokens: [defaultTabsItemTokens, tabsItemName],
  states: tabsItemStates,
  slotProps: {
    root: buildProps(
      (tokens: TabsItemTokens, theme: Theme) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          ...borderStyles.from(tokens, theme),
        },
      }),
      [...borderStyles.keys],
    ),
    content: buildProps(
      (tokens: TabsItemTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: TabsItemTokens) => ({
        style: {
          tintColor: tokens.iconColor,
        },
      }),
      ['iconColor'],
    ),
    stack: buildProps(
      (tokens: TabsItemTokens) => ({
        style: {
          display: 'flex',
          marginHorizontal: 10,
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          minHeight: 32,
          minWidth: 32,
          justifyContent: 'center',
          opacity: tokens.tabsItemOpacity,
        },
      }),
      ['tabsItemOpacity'],
    ),
    indicator: buildProps(
      (tokens: TabsItemTokens) => ({
        style: {
          minHeight: 2,
          borderRadius: 2,
          marginBottom: 2,
          alignSelf: 'stretch',
          marginHorizontal: tokens.indicatorMarginHorizontal,
          backgroundColor: tokens.indicatorColor,
        },
      }),
      ['indicatorColor', 'indicatorMarginHorizontal'],
    ),
  },
};
