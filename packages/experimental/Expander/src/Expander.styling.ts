import { expanderName, ExpanderTokens, ExpanderSlotProps, ExpanderProps, expanderStates, tokensThatAreAlsoProps } from './Expander.types';
import { UseStylingOptions, buildProps } from '@fluentui-react-native/framework';

export const stylingSettings: UseStylingOptions<ExpanderProps, ExpanderSlotProps, ExpanderTokens> = {
  tokens: [{}, expanderName],
  tokensThatAreAlsoProps: 'all',
  states: [...expanderStates],
  slotProps: {
    root: buildProps(
      (tokens) => ({
        height: tokens.collapsedHeight,
        expanded: {
          height: tokens.expandedHeight
        },
        ...tokens,
      })
    ),
  },
};
