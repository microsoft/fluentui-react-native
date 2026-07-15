import type { ThemeShadowDefinition, AppearanceOptions } from '@fluentui-react-native/design/theming';

import { getIsHighContrast } from './appleHighContrast.macos';
import { createMacOSShadowAliasTokens } from './createMacOSAliasTokens';

export function fallbackAppleShadows(mode: AppearanceOptions): ThemeShadowDefinition {
  return createMacOSShadowAliasTokens(mode, getIsHighContrast());
}
