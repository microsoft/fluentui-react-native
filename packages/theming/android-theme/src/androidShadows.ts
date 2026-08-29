import type { ThemeShadowDefinition } from '@fluentui-react-native/design/theming';

import { createShadowAliasTokens } from './createAliasTokens';

export function androidShadows(mode: 'light' | 'dark'): ThemeShadowDefinition {
  return createShadowAliasTokens(mode);
}
