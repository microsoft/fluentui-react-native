import { ViewStyle, ColorValue } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { getPaletteFromTheme } from './color-tokens';
import { tokenBuilder } from './tokenBuilder';

export interface IBorderTokens {
  borderColor?: ColorValue;
  borderWidth?: number;
  borderRadius?: number;
  borderStyle?: ViewStyle['borderStyle'];
}

export const borderTokens: IOperationSet<IBorderTokens, ITheme> = [
  { source: 'borderColor', lookup: getPaletteFromTheme },
  { source: 'borderWidth' },
  { source: 'borderRadius' },
  { source: 'borderStyle' },
];

export const borderStyles = tokenBuilder<IBorderTokens>('borderColor', 'borderRadius', 'borderStyle', 'borderWidth');
