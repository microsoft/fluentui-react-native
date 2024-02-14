import { buildProps, layoutStyles } from '@fluentui-react-native/framework';
import type { UseStylingOptions, TokenSettings, Theme } from '@fluentui-react-native/framework';

import type { OverflowProps, OverflowSlotProps, OverflowTokens } from './Overflow.types';
import { overflowName } from './Overflow.types';

const overflowStates: (keyof OverflowTokens)[] = ['hidden'];

export const defaultOverflowTokens: TokenSettings<OverflowTokens> = () => ({
  axis: 'horizontal',
  opacity: 1,

  hidden: {
    opacity: 0,
  },
});

export const stylingSettings: UseStylingOptions<OverflowProps, OverflowSlotProps, OverflowTokens> = {
  tokens: [defaultOverflowTokens, overflowName],
  tokensThatAreAlsoProps: ['padding'],
  states: overflowStates,
  slotProps: {
    root: buildProps(
      (tokens: OverflowTokens, theme: Theme) => ({
        style: {
          flexDirection: tokens.axis === 'horizontal' ? 'row' : 'column',
          flexWrap: 'wrap',
          opacity: tokens.opacity,
          ...layoutStyles.from(tokens, theme),
        },
      }),
      [],
    ),
  },
};
