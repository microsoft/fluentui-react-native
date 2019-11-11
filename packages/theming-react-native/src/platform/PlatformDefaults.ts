import { INativeThemeRegistry, INativeTheme } from '../INativeTheme';
import { getBaselinePlatformTheme } from './PlatformTheme';

export function attachToRegistry(_registry: INativeThemeRegistry) {
  // empty
}

export function getPlatformDefaults(): INativeTheme {
  return getBaselinePlatformTheme();
}
