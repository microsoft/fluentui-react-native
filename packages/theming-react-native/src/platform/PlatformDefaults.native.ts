import { ThemingModuleHelper, IThemingModuleHelper } from '../NativeModule';
import { createThemeRegistry } from '@uifabricshared/theme-registry';
import { resolvePartialTheme } from '@uifabricshared/theming-ramp';

export function createPlatformThemeRegistry(platformThemeId?: string, module: IThemingModuleHelper = ThemingModuleHelper) {
  const registry = createThemeRegistry(module.getPlatformDefaults(platformThemeId), resolvePartialTheme);
  module.addListener(() => {
    registry.updatePlatformDefaults(module.getPlatformDefaults(platformThemeId));
  });
  return registry;
}
