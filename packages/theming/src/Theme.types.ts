import { IPalette, IPartialPalette } from './Color.types';
import { ITypography, IPartialTypography } from './Typography.types';
import { IComponentSettingsCollection } from '@uifabric/theme-settings';

export interface ISpacing {
  s2: string;
  s1: string;
  m: string;
  l1: string;
  l2: string;
}

/**
 * A fully specified theme.
 */
export interface ITheme {
  palette: IPalette;
  typography: ITypography;
  settings: IComponentSettingsCollection;
  spacing: ISpacing;
}

/**
 * A partially specified theme.
 *
 * Useful for overriding specific visual elements in a fully specified theme.
 */
export interface IPartialTheme {
  palette?: IPartialPalette;
  typography?: IPartialTypography;
  settings?: IComponentSettingsCollection;
  spacing?: ISpacing;
}
