import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { fontWeightRegular, size40 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuGroupHeaderTokens } from './MenuGroupHeader.types';

export const defaultMenuGroupHeaderTokens: TokenSettings<MenuGroupHeaderTokens, Theme> = (t): MenuGroupHeaderTokens => ({
  color: t.colors.disabledText,
  fontFamily: t.typography.families.primary,
  fontSize: 13,
  fontWeight: fontWeightRegular as FontWeightValue,
  gap: size40,
  paddingHorizontal: 5,
  paddingVertical: 3,
});
