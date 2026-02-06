import type { AnimatableNumericValue, ColorValue, ViewStyle } from 'react-native';

import type { Theme } from '@fluentui-react-native/theme-types';

import type { OperationSet } from './token.types';
import { tokenBuilder } from './tokenBuilder';

export interface IShadowTokens {
  shadowColor?: ColorValue;
  shadowOffset?: {
    width: number;
    height: number;
  };
  shadowOpacity?: number;
  shadowRadius?: AnimatableNumericValue | string;
  elevation?: number;
}

export const shadowTokens: OperationSet<IShadowTokens, Theme> = [
  { source: 'shadowColor' },
  { source: 'shadowOffset' },
  { source: 'shadowOpacity' },
  { source: 'shadowRadius' },
  { source: 'elevation' },
];

export const shadowStyles = tokenBuilder<IShadowTokens, ViewStyle>(
  'shadowColor',
  'shadowOffset',
  'shadowOpacity',
  'shadowRadius',
  'elevation',
);
