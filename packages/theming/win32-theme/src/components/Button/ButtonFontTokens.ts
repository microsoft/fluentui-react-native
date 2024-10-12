import { globalTokensWin32 as globalTokens } from '@fluentui-react-native/theme-tokens';
import type { Theme } from '@fluentui-react-native/theme-types';
import type { FontWeight } from '@fluentui-react-native/theme-types';

export const defaultButtonFontTokens = (t: Theme) => ({
  medium: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: globalTokens.font.size300,
      fontWeight: globalTokens.font.weight.semibold as FontWeight,
    },
  },
  small: {
    hasContent: {
      fontFamily: t.typography.families.primary,
      fontSize: globalTokens.font.size200,
      fontWeight: globalTokens.font.weight.regular as FontWeight,
    },
  },
  large: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: globalTokens.font.size400,
      fontWeight: globalTokens.font.weight.semibold as FontWeight,
    },
  },
});
