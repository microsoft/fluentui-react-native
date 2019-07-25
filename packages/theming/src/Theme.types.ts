import { IPalette, IPartialPalette } from './Color.types';
import { ITypography, IPartialTypography } from './Typography.types';
import { IComponentSettingsCollection } from './Settings.types';

/**
 * A fully specified theme.
 */
export interface ITheme {
  palette: IPalette;
  typography: ITypography;
  settings: IComponentSettingsCollection;
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
}
