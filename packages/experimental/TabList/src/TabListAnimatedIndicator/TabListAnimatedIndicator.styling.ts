import type { UseStylingOptions } from '@fluentui-react-native/framework';
import { buildProps } from '@fluentui-react-native/framework';

import {
  type TabListAnimatedIndicatorTokens,
  type TabListAnimatedIndicatorSlotProps,
  type TabListAnimatedIndicatorProps,
  tablistAnimatedIndicatorName,
} from './TabListAnimatedIndicator.types';
import { defaultTabListAnimatedIndicatorTokens, tabListAnimatedIndicatorStates } from './TabListAnimatedIndicatorTokens';

export const stylingSettings: UseStylingOptions<
  TabListAnimatedIndicatorProps,
  TabListAnimatedIndicatorSlotProps,
  TabListAnimatedIndicatorTokens
> = {
  tokens: [defaultTabListAnimatedIndicatorTokens, tablistAnimatedIndicatorName],
  tokensThatAreAlsoProps: 'none',
  states: tabListAnimatedIndicatorStates,
  slotProps: {
    root: buildProps(
      (t) => ({
        style: {
          position: 'absolute',
          ...(t.bottom ? { top: '100%' } : {}),
          ...(t.start ? { start: t.start } : {}),
        },
      }),
      ['bottom', 'start'],
    ),
    indicator: buildProps(
      (t) => ({
        style: {
          backgroundColor: t.color,
          borderRadius: 99,
        },
      }),
      ['color'],
    ),
  },
};
