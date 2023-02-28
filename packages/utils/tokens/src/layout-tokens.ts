import type { ViewStyle } from 'react-native';

import type { Theme } from '@fluentui-react-native/theme-types';

import type { OperationSet } from './token.types';
import { tokenBuilder } from './tokenBuilder';

export interface LayoutTokens {
  minWidth?: ViewStyle['minWidth'];
  maxWidth?: ViewStyle['maxWidth'];
  minHeight?: ViewStyle['minHeight'];
  maxHeight?: ViewStyle['maxHeight'];
  padding?: ViewStyle['padding'];
  paddingHorizontal?: ViewStyle['paddingHorizontal'];
  paddingVertical?: ViewStyle['paddingVertical'];
  paddingStart?: ViewStyle['paddingStart'];
  paddingEnd?: ViewStyle['paddingEnd'];
}

export const layoutTokens: OperationSet<LayoutTokens, Theme> = [
  { source: 'minWidth' },
  { source: 'maxWidth' },
  { source: 'minHeight' },
  { source: 'maxHeight' },
  { source: 'padding' },
  { source: 'paddingHorizontal' },
  { source: 'paddingVertical' },
  { source: 'paddingStart' },
  { source: 'paddingEnd' },
];

export const layoutStyles = tokenBuilder<LayoutTokens>(
  'minWidth',
  'maxWidth',
  'minHeight',
  'maxHeight',
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
);
