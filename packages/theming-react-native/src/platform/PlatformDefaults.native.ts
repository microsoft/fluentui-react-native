import { ThemingModuleHelper } from '../NativeModule';
import { INativeTheme, INativeThemeRegistry } from '../INativeTheme.types';

export function getPlatformDefaults(): INativeTheme {
  return ThemingModuleHelper.getPlatformDefaults();
}

export function attachToRegistry(registry: INativeThemeRegistry) {
  ThemingModuleHelper.addListener(() => {
    registry.updatePlatformDefaults(getPlatformDefaults());
  });
}
