import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuGroupHeaderTokens } from './MenuGroupHeader.types';

export const defaultMenuGroupHeaderTokens: TokenSettings<MenuGroupHeaderTokens, Theme> = (t): MenuGroupHeaderTokens => ({
  fontFamily: t.typography.families.primary,
});
