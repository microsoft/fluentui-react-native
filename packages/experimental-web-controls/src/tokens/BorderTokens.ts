import { IOperationSet } from '@uifabricshared/foundation-tokens';
import { ITheme } from '@uifabricshared/theming';
import { getPaletteFromTheme } from './ColorTokens';

export interface IBorderTokens {
  borderColor?: string;
  borderWidth?: number | string;
  borderRadius?: number | string;
}

export const borderTokens: IOperationSet<IBorderTokens, ITheme> = [
  { source: 'borderColor', lookup: getPaletteFromTheme },
  { source: 'borderWidth' },
  { source: 'borderRadius' }
];
