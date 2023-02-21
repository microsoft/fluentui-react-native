import type { ITheme } from '@uifabricshared/theming-ramp';
import { defaultFluentTheme } from '@fluentui-react-native/default-theme';

/**
 * @deprecated
 */
export function getBaselinePlatformTheme(): ITheme {
  return defaultFluentTheme;
}
