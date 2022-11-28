import { ViewStyle } from 'react-native';
import { OperationSet } from './token.types';
import { Theme } from '@fluentui-react-native/theme-types';
import { tokenBuilder } from './tokenBuilder';

export interface LayoutTokens {
  minWidth?: ViewStyle['minWidth'];
  maxWidth?: ViewStyle['maxWidth'];
  minHeight?: ViewStyle['minHeight'];
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
  'padding',
  'paddingHorizontal',
  'paddingVertical',
  'paddingStart',
  'paddingEnd',
);
