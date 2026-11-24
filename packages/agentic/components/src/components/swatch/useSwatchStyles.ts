import { StyleSheet } from 'react-native';
import { getComponentTokens, resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { swatchStyles, swatchTokens } from './swatch.styles';
import type { SwatchState } from './swatch.types';

export function useSwatchStyles_unstable(state: SwatchState) {
  const tokens = getComponentTokens(state, swatchTokens);
  const sample = resolveTokenStates(tokens.sample, state).style;
  const borderRadius = sample.borderRadius;
  const rootStyle = [swatchStyles.root, resolveTokenStates(tokens.root, state).style, { borderRadius }, state.userStyle];
  attachSlotProps(state.root, { style: rootStyle });
  applyFocusRingStyles(state.FocusRing, state, StyleSheet.flatten(rootStyle).borderRadius);
  attachSlotDefaults(state.sample, { style: [swatchStyles.sample, sample, resolveTokenStates(tokens.boundary, state).style] });
  if (state.image) attachSlotProps(state.image, { style: swatchStyles.image });
  if (state.indicator && state.mark) {
    const indicator = resolveTokenStates(tokens.indicator, state);
    attachSlotProps(state.indicator, {
      style: [swatchStyles.indicator, indicator.style, { width: indicator.props.width, height: indicator.props.height }],
    });
    attachSlotProps(state.mark, indicator.props);
  }
}
