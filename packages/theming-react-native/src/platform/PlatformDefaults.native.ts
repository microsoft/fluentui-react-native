import { ThemingModuleHelper } from '../NativeModule';
import { INativeTheme } from '../INativeTheme';

export function getPlatformDefaults(): INativeTheme {
  return ThemingModuleHelper.getPlatformDefaults();
}
