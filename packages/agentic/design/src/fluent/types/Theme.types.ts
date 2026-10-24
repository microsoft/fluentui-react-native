import type { ColorValue } from 'react-native';

import type { ThemeColorDefinition } from './Color.types';
import type { OfficePalette } from './palette.types';
import type { PartialShadowDefinition, ThemeShadowDefinition } from './Shadow.types';
import type { Typography, PartialTypography } from './Typography.types';

type TwoLevelPartial<T> = { [K in keyof T]?: Partial<T[K]> };

export interface Spacing {
  s2: `${number}px`;
  s1: `${number}px`;
  m?: `${number}px`;
  // m is now defined as a v2 type
  l1: `${number}px`;
  l2: `${number}px`;
}

/**
 * A fully specified theme.
 */
export interface Theme {
  name?: string;
  colors: ThemeColorDefinition;
  typography: Typography;
  components: {
    [key: string]: Record<string, unknown>;
  };
  shadows: ThemeShadowDefinition;
  readonly spacing: Spacing;
  host: {
    // appearance of the theme, this corresponds to the react-native Appearance library values, though can be overwritten
    // dynamic refers to a theme that handles it's own appearance switching, such as one that uses the PlatformColor API
    appearance: AppearanceOptions | 'dynamic';

    // Office palette, if running in Office with the native module connected in the theme
    palette?: OfficePalette;
    colors?: { [key: string]: ColorValue };
  };
}

/**
 * Generally a partial theme is comprised of partial versions of the objects within the theme, with the exception of shadow and typography
 * which has additional levels of hierarchy
 */
export type PartialTheme = Omit<TwoLevelPartial<Theme>, 'shadows' | 'typography' | 'host'> & {
  shadows?: PartialShadowDefinition;
  typography?: PartialTypography;
  host?: TwoLevelPartial<Theme['host']>;
};

export type AppearanceOptions = 'light' | 'dark' | 'darkElevated' | 'highContrast';

export interface ThemeOptions {
  /**
   * Should the baseline colors be light, dark, or use the values from the Appearance API from react-native.
   */
  appearance?: AppearanceOptions | 'dynamic';

  /**
   * Default appearance should the library to request this from native not be available
   */
  defaultAppearance?: AppearanceOptions;

  /**
   * If in a host that supports multiple areas within the app that use different palettes, this specifies the palette name to
   * load.
   *
   * In Office this corresponds to regions like taskpanes, the ribbon, left navigation, and so on, but that concept could be extended
   * to any host that wants to support this.
   */
  paletteName?: string;
}
