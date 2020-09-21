import { IThemeColorDefinition } from './Color.types';
import { ITypography, IPartialTypography } from './Typography.types';

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
export interface Theme {
  name?: string;
  colors: IThemeColorDefinition;
  typography: ITypography;
  components: { [key: string]: object };
  componentTokens?: object;
  spacing: ISpacing;
  host: object; // platform specific host settings
}

/**
 * A partially specified theme.
 *
 * Useful for overriding specific visual elements in a fully specified theme.
 */
export interface PartialTheme {
  name?: string;
  colors?: Partial<IThemeColorDefinition>;
  typography?: IPartialTypography;
  components?: { [key: string]: object };
  componentTokens?: object;
  spacing?: ISpacing;
  host?: object;
}
