import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuGroupHeaderTokens } from './MenuGroupHeader.types';

export const defaultMenuGroupHeaderTokens: TokenSettings<MenuGroupHeaderTokens, Theme> = (t): MenuGroupHeaderTokens => ({
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: globalTokens.font.size300,
  fontWeight: globalTokens.font.weight.regular as FontWeightValue,
  gap: globalTokens.size40,
  padding: globalTokens.size60,
});
