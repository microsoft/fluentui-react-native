import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming-ramp';
import { getPaletteFromTheme } from './color-tokens';
import { tokenBuilder } from './tokenBuilder';
import { BorderTokenSet } from '@fluentui-react-native/theme-types';

export type IBorderTokens = BorderTokenSet;

export const borderTokens: IOperationSet<IBorderTokens, ITheme> = [
  { source: 'borderColor', lookup: getPaletteFromTheme },
  { source: 'borderWidth' },
  { source: 'borderRadius' },
  { source: 'borderStyle' },
];

export const borderStyles = tokenBuilder<IBorderTokens>('borderColor', 'borderRadius', 'borderStyle', 'borderWidth');
