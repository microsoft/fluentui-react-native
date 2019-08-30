import { ITokenOperation } from '@uifabric/foundation-tokens';
import { ITheme } from '@uifabric/theming';
import { getPaletteFromTheme } from './ColorTokens';

export interface IBorderTokens {
  borderColor?: string;
  borderWidth?: number | string;
  borderRadius?: number | string;
}

export const borderTokens: ITokenOperation<IBorderTokens, ITheme>[] = [
  { source: 'borderColor', lookup: getPaletteFromTheme },
  { source: 'borderWidth' },
  { source: 'borderRadius' }
];
