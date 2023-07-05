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
          flexDirection: tokens.flexDirection,
          alignSelf: 'flex-start',
          justifyContent: 'center',
          padding: 1,
          backgroundColor: tokens.backgroundColor,
          ...borderStyles.from(tokens, theme),
        },
      }),
      ['flexDirection', 'backgroundColor', ...borderStyles.keys],
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
        size: tokens.iconSize,
        style: {
          marginRight: tokens.iconMargin,
        },
      }),
      ['iconColor', 'iconSize', 'iconMargin'],
    ),
    stack: buildProps(
      (tokens: TabTokens) => ({
        style: {
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'row',
          alignSelf: 'flex-start',
          justifyContent: 'center',
          opacity: tokens.tabsItemOpacity,
          marginHorizontal: tokens.stackMarginHorizontal,
          marginVertical: tokens.stackMarginVertical,
        },
      }),
      ['tabsItemOpacity', 'stackMarginHorizontal', 'stackMarginVertical'],
    ),
    indicator: buildProps(
      (tokens: TabTokens) => ({
        color: tokens.indicatorColor,
        inset: tokens.indicatorInset,
        thickness: tokens.indicatorThickness,
        vertical: tokens.indicatorOrientation === 'vertical',
      }),
      ['indicatorColor', 'indicatorInset', 'indicatorThickness'],
    ),
  },
};
