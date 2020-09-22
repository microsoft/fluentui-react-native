import { ThemeColorDefinition } from './color.types';
import { OfficePalette } from './palette.types';
import { Typography, PartialTypography } from './typography.types';

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
  host: {
    // Office palette, if running in Office with the native module connected in the theme
    palette?: OfficePalette;
  };
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
