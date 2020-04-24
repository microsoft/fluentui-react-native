import { ViewStyle } from 'react-native';
import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { getPaletteFromTheme } from './ColorTokens';

export interface IBorderTokens {
  borderColor?: string;
  borderWidth?: number | string;
  borderRadius?: number | string;
  borderStyle?: ViewStyle['borderStyle'];
}

export const borderTokens: IOperationSet<IBorderTokens, ITheme> = [
  { source: 'borderColor', lookup: getPaletteFromTheme },
  { source: 'borderWidth' },
  { source: 'borderRadius' },
  { source: 'borderStyle' },
];
