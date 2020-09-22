import { ThemeColorDefinition } from './Color.types';
import { Typography, PartialTypography } from './Typography.types';

export interface Spacing {
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
  colors: ThemeColorDefinition;
  typography: Typography;
  components: { [key: string]: object };
  componentTokens?: object;
  spacing: Spacing;
  host: object; // platform specific host settings
}

/**
 * A partially specified theme.
 *
 * Useful for overriding specific visual elements in a fully specified theme.
 */
export interface PartialTheme {
  name?: string;
  colors?: Partial<ThemeColorDefinition>;
  typography?: PartialTypography;
  components?: { [key: string]: object };
  componentTokens?: object;
  spacing?: Spacing;
  host?: object;
}
