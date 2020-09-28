import { ThemeColorDefinition } from './Color.types';
import { OfficePalette } from './palette.types';
import { Typography, PartialTypography } from './Typography.types';

type TwoLevelPartial<T> = {
  [K in keyof T]?: Partial<T[K]>;
};

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
    // appearance of the theme, this corresponds to the react-native Appearance library values, though can be overwritten
    appearance: 'light' | 'dark';

    // Office palette, if running in Office with the native module connected in the theme
    palette?: OfficePalette;
  };
}

/**
 * Generally a partial theme is comprised of partial versions of the objects within the theme, with the exception of typography
 * which has additional levels of hierarchy
 */
export type PartialTheme = Omit<TwoLevelPartial<Theme>, 'typography' | 'host'> & {
  typography?: PartialTypography;
  host?: TwoLevelPartial<Theme['host']>;
};

/**
 * A partially specified theme.
 *
 * Useful for overriding specific visual elements in a fully specified theme.
 */
export interface PartialTheme2 {
  name?: string;
  colors?: Partial<ThemeColorDefinition>;
  typography?: PartialTypography;
  components?: { [key: string]: object };
  componentTokens?: object;
  spacing?: Partial<Spacing>;
  host?: {
    // appearance of the theme, this corresponds to the react-native Appearance library values, though can be overwritten
    appearance?: 'light' | 'dark';

    palette?: Partial<OfficePalette>;
  };
}
