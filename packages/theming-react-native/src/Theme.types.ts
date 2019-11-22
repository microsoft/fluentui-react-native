import { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';
import { IThemeRegistry, IProcessTheme } from '@uifabricshared/theme-registry';

export type ITheme = ITheme;

export type IPartialTheme = IPartialTheme;

export type IThemeDefinition = IPartialTheme | IProcessTheme<ITheme, IPartialTheme>;

export type ThemeRegistry = IThemeRegistry<ITheme, IPartialTheme>;
