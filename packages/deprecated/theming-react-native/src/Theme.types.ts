import { IThemeRegistry, IProcessTheme } from '@uifabricshared/theme-registry';
import { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';

export { ITheme, IPartialTheme } from '@uifabricshared/theming-ramp';
export type IThemeDefinition = IPartialTheme | IProcessTheme<ITheme, IPartialTheme>;
export type ThemeRegistry = IThemeRegistry<ITheme, IPartialTheme>;
