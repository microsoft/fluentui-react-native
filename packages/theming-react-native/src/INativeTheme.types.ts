import { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';
import { IThemeRegistry } from '@uifabricshared/theme-registry';

export type INativeTheme = ITheme;

export type INativeThemeDefinition = IPartialTheme;

export type INativeThemeRegistry = IThemeRegistry<INativeTheme, INativeThemeDefinition>;
