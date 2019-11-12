import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { INativeTheme, INativeThemeRegistry } from '../INativeTheme.types';

export function getPlatformDefaults(): INativeTheme {
  return getBaselinePlatformTheme();
}

export function attachToRegistry(_registry: INativeThemeRegistry) {
  // empty
}
