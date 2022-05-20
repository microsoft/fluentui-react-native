import { ThemeShadowDefinition } from '@fluentui-react-native/theme-types';
import { getCurrentAppearance } from '@fluentui-react-native/theming-utils';
import { Appearance } from 'react-native';
import { getIsHighContrast } from './appleHighContrast.macos';
import { createMacOSShadowAliasTokens } from './createMacOSAliasTokens';

export function fallbackAppleShadows(): ThemeShadowDefinition {
  const appearance = Appearance.getColorScheme();
  const mode = getCurrentAppearance(appearance, 'light');
  return createMacOSShadowAliasTokens(mode, getIsHighContrast());
}
