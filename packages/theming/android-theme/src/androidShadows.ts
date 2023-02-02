import type { ThemeShadowDefinition } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { Appearance } from 'react-native';
import { createShadowAliasTokens } from './createAliasTokens';

export function androidShadows(): ThemeShadowDefinition {
  const appearance = Appearance.getColorScheme();
  const mode = getCurrentAppearance(appearance, 'light');
  return createShadowAliasTokens(mode);
}
