import { ThemingModuleHelper } from '../NativeModule';
import { createThemeRegistry } from '@uifabricshared/theme-registry';
import { resolvePartialTheme } from '@uifabricshared/theming-ramp';

export function createPlatformThemeRegistry(platformThemeId?: string) {
  const registry = createThemeRegistry(ThemingModuleHelper.getPlatformDefaults(platformThemeId), resolvePartialTheme);
  ThemingModuleHelper.addListener(() => {
    registry.updatePlatformDefaults(ThemingModuleHelper.getPlatformDefaults(platformThemeId));
  });
  return registry;
}
