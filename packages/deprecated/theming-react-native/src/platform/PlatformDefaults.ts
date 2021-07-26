import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { createThemeRegistry } from '@uifabricshared/theme-registry';
import { resolvePartialTheme } from '@uifabricshared/theming-ramp';
import { IThemingModuleHelper } from '../NativeModule';

export function createPlatformThemeRegistry(_themeId?: string, _module?: IThemingModuleHelper) {
  return createThemeRegistry(getBaselinePlatformTheme(), resolvePartialTheme);
}
