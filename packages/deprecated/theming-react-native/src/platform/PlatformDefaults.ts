import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { createThemeRegistry } from '@uifabricshared/theme-registry';
import { resolvePartialTheme } from '@uifabricshared/theming-ramp';
import type { IThemingModuleHelper } from '../NativeModule';

/**
 * @deprecated
 */
export function createPlatformThemeRegistry(_themeId?: string, _module?: IThemingModuleHelper) {
  return createThemeRegistry(getBaselinePlatformTheme(), resolvePartialTheme);
}
