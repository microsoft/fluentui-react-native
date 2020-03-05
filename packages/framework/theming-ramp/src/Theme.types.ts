import { IThemeColorDefinition } from './Color.types';
import { ITypography, IPartialTypography } from './Typography.types';
import { IComponentSettingsCollection } from '@uifabricshared/foundation-settings';

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
  name?: string;
  colors: IThemeColorDefinition;
  typography: ITypography;
  components: IComponentSettingsCollection;
  spacing: ISpacing;
}

/**
 * A partially specified theme.
 *
 * Useful for overriding specific visual elements in a fully specified theme.
 */
export interface IPartialTheme {
  name?: string;
  colors?: Partial<IThemeColorDefinition>;
  typography?: IPartialTypography;
  components?: IComponentSettingsCollection;
  spacing?: ISpacing;
}
