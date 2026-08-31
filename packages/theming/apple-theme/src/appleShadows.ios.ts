import type { AppearanceOptions, ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

import { createiOSShadowAliasTokens } from './createiOSAliasTokens';

export function iOSShadows(mode: AppearanceOptions): ThemeShadowDefinition {
  return createiOSShadowAliasTokens(mode);
}
