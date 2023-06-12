import type { IThemeRegistry, IProcessTheme } from '@uifabricshared/theme-registry';
import type { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';

/**
 * @deprecated
 */
export type { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';

/**
 * @deprecated
 */
export type IThemeDefinition = IPartialTheme | IProcessTheme<ITheme, IPartialTheme>;

/**
 * @deprecated
 */
export type ThemeRegistry = IThemeRegistry<ITheme, IPartialTheme>;
