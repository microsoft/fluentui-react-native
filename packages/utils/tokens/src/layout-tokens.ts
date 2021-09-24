import { ViewStyle } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { Theme } from '@fluentui-react-native/theme-types';
import { tokenBuilder } from './tokenBuilder';

export interface LayoutTokens {
  minWidth?: ViewStyle['minWidth'];
  minHeight?: ViewStyle['minHeight'];
  padding?: ViewStyle['padding'];
  paddingHorizontal?: ViewStyle['paddingHorizontal'];
}

export const layoutTokens: IOperationSet<LayoutTokens, Theme> = [
  { source: 'minWidth' },
  { source: 'minHeight' },
  { source: 'padding' },
  { source: 'paddingHorizontal' },
];

export const layoutStyles = tokenBuilder<LayoutTokens>('minWidth', 'minHeight', 'padding', 'paddingHorizontal');
