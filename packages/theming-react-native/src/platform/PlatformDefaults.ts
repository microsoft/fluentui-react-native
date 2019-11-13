import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { createThemeRegistry } from '@uifabricshared/theme-registry';
import { resolvePartialTheme } from '@uifabricshared/theming-ramp';

export function createPlatformThemeRegistry(_themeId?: string) {
  return createThemeRegistry(getBaselinePlatformTheme(), resolvePartialTheme);
}
