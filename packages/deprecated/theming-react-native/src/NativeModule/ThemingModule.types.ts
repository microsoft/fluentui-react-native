import type { PlatformDefaultsChangedCallback } from '@fluentui-react-native/win32-theme';
import type { IProcessTheme } from '@uifabricshared/theme-registry';
import type { ITheme, IPartialTheme, OfficePalette as IOfficePalette } from '@uifabricshared/theming-ramp';

/**
 * @deprecated
 */
export interface IEventEmitter {
  addListener: (event: string, PlatformDefaultsChangedCallback) => void;
}

/**
 * @deprecated
 */
export type IPlatformThemeDefinition = IPartialTheme | IProcessTheme<ITheme, IPartialTheme>;

/**
 * @deprecated
 */
export interface IThemingModuleHelper {
  /**
   * Gets a complete platform theme suitable for using with a Theme Registry
   */
  getPlatformDefaults: (themeId?: string) => ITheme;
  /**
   * Gets a theme definition to register with a Theme Registry & use with the theme context to create a subtree with the
   * look & feel of a platform theme.
   */
  getPlatformThemeDefinition: (themeId?: string) => IPlatformThemeDefinition;
  addListener: (listener: PlatformDefaultsChangedCallback) => void; // TODO: Should probably be able to remove
}

/**
 * @deprecated
 */
export type IHostSettingsWin32 = {
  palette: IOfficePalette;
};
