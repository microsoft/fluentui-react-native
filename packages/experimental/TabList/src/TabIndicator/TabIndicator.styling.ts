import type { Theme, UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import { tabIndicatorName } from './TabIndicator.types';
import type { TabIndicatorTokens, TabIndicatorSlotProps, TabIndicatorProps } from './TabIndicator.types';
import { defaultTabIndicatorTokens } from './TabIndicatorTokens';

const tabIndicatorStates: (keyof TabIndicatorTokens)[] = ['vertical'];

export const stylingSettings: UseStylingOptions<TabIndicatorProps, TabIndicatorSlotProps, TabIndicatorTokens> = {
  tokens: [defaultTabIndicatorTokens, tabIndicatorName],
  tokensThatAreAlsoProps: ['color', 'inset', 'thickness', 'vertical'],
  states: tabIndicatorStates,
  slotProps: {
    root: buildProps(
      (tokens: TabIndicatorTokens, theme: Theme) => ({
        style: {
          backgroundColor: theme.colors.transparentBackground,
          ...(tokens.vertical
            ? {
                height: '100%',
                width: tokens.thickness,
                paddingVertical: tokens.inset,
              }
            : {
                width: '100%',
                height: tokens.thickness,
                paddingHorizontal: tokens.inset,
              }),
        },
      }),
      ['inset', 'thickness', 'vertical'],
    ),
    indicator: buildProps(
      (tokens: TabIndicatorTokens) => ({
        style: {
          flex: 1,
          backgroundColor: tokens.color,
          borderRadius: 99,
        },
      }),
      ['color'],
    ),
  },
};
