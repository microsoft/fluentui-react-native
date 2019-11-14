import { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';
import { IThemeRegistry } from '@uifabricshared/theme-registry';

/**
 * type for the context.  If the context is undefined this will be treated as a reference
 * to the default theme.
 */
export type IThemeContextType = INativeTheme | undefined;

export type INativeTheme = ITheme;

export type INativeThemeDefinition = IPartialTheme;

export type INativeThemeRegistry = IThemeRegistry<INativeTheme, INativeThemeDefinition>;
