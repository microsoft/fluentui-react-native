import { Theme } from '@fluentui-react-native/theme-types';
import { createAliasTokens } from './createAliasTokens';
import { getCurrentAppearance } from './getCurrentAppearance';

export function createThemeWithAliases(theme: Theme) {
  return {
    ...theme,
    colors: {
      ...theme.colors,
      ...createAliasTokens(getCurrentAppearance(theme.host.appearance, 'light')),
    },
  };
}
