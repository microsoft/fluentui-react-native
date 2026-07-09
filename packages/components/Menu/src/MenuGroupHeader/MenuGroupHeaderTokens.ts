import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { fontSize300, fontWeightRegular, size40, size60 } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { MenuGroupHeaderTokens } from './MenuGroupHeader.types';

export const defaultMenuGroupHeaderTokens: TokenSettings<MenuGroupHeaderTokens, Theme> = (t): MenuGroupHeaderTokens => ({
  color: t.colors.neutralForeground2,
  fontFamily: t.typography.families.primary,
  fontSize: fontSize300,
  fontWeight: fontWeightRegular as FontWeightValue,
  gap: size40,
  padding: size60,
});
