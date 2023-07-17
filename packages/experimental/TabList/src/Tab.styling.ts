import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { borderStyles, buildProps, fontStyles } from '@fluentui-react-native/framework';

import { tabName } from './Tab.types';
import type { TabSlotProps, TabTokens, TabProps } from './Tab.types';
import { tabStates, defaultTabTokens } from './TabTokens';

export const stylingSettings: UseStylingOptions<TabProps, TabSlotProps, TabTokens> = {
  tokens: [defaultTabTokens, tabName],
  states: tabStates,
  slotProps: {
    root: buildProps(
      (tokens: TabTokens, theme: Theme) => ({
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
      (tokens: TabTokens, theme: Theme) => ({
        style: {
          color: tokens.color,
          ...fontStyles.from(tokens, theme),
        },
      }),
      ['color', ...fontStyles.keys],
    ),
    icon: buildProps(
      (tokens: TabTokens) => ({
        color: tokens.iconColor,
      }),
      ['iconColor'],
    ),
    stack: buildProps(
      (tokens: TabTokens) => ({
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
      (tokens: TabTokens) => ({
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
