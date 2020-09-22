import { getBaselinePlatformTheme } from '../BaselinePlatformDefaults';
import { createMockThemingModuleHelper } from './MockThemingModule';

export const ThemingModuleHelper = createMockThemingModuleHelper(undefined, undefined, {
  getPlatformDefaults: getBaselinePlatformTheme,
});
