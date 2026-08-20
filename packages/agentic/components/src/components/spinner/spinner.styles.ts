import { StyleSheet } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import type { SpinnerSize, SpinnerState } from './spinner.types';

export const spinnerStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  svg: {
    flexShrink: 0,
  },
});

const spinnerMetrics = {
  'x-tiny': { diameter: 16, strokeWidth: 'thin' },
  tiny: { diameter: 20, strokeWidth: 'thin' },
  'x-small': { diameter: 24, strokeWidth: 'thin' },
  small: { diameter: 28, strokeWidth: 'thick' },
  medium: { diameter: 32, strokeWidth: 'thick' },
  large: { diameter: 36, strokeWidth: 'thicker' },
  'x-large': { diameter: 40, strokeWidth: 'thicker' },
  huge: { diameter: 44, strokeWidth: 'thicker' },
} as const satisfies Record<SpinnerSize, { diameter: number; strokeWidth: keyof FlexTokens['strokeWidth'] }>;

export function getSpinnerMetrics(size: SpinnerSize, tokens: FlexTokens) {
  const { diameter, strokeWidth: tokenName } = spinnerMetrics[size];
  const strokeWidth = tokens.strokeWidth[tokenName] as number;
  const center = diameter / 2;
  const radius = center - strokeWidth / 2;

  return {
    center,
    diameter,
    radius,
    strokeWidth,
  };
}

export function getSpinnerRootStyle(state: SpinnerState) {
  return {
    height: state.diameter,
    width: state.diameter,
  };
}
