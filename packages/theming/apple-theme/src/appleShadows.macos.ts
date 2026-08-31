import type { ThemeShadowDefinition, AppearanceOptions } from '@fluentui-react-native/design/theming';

import { createMacOSShadowAliasTokens } from './createMacOSAliasTokens';

export function fallbackAppleShadows(mode: AppearanceOptions, highContrast: boolean): ThemeShadowDefinition {
  return createMacOSShadowAliasTokens(mode, highContrast);
}
