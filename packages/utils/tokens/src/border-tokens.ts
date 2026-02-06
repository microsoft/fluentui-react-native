import type { ViewStyle, ColorValue, AnimatableNumericValue } from 'react-native';

import type { Theme } from '@fluentui-react-native/theme-types';

import { getPaletteFromTheme } from './color-tokens';
import type { OperationSet } from './token.types';
import { tokenBuilder } from './tokenBuilder';

export interface IBorderTokens {
  borderColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: AnimatableNumericValue | string;
  borderStyle?: ViewStyle['borderStyle'];
}

export const borderTokens: OperationSet<IBorderTokens, Theme> = [
  { source: 'borderColor', lookup: getPaletteFromTheme },
  { source: 'borderWidth' },
  { source: 'borderRadius' },
  { source: 'borderStyle' },
];

export const borderStyles = tokenBuilder<IBorderTokens, ViewStyle>('borderColor', 'borderRadius', 'borderStyle', 'borderWidth');
