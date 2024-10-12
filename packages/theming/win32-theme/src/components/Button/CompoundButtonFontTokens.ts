import { globalTokensWin32 as globalTokens } from '@fluentui-react-native/theme-tokens';
import type { FontWeightValue, Theme } from '@fluentui-react-native/theme-types';

export const defaultCompoundButtonFontTokens = (t: Theme) => ({
  medium: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: globalTokens.font.size200,
      fontWeight: globalTokens.font.weight.semibold as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.secondary,
        fontSize: globalTokens.font.size100,
        fontWeight: globalTokens.font.weight.semibold as FontWeightValue,
      },
    },
  },
  small: {
    hasContent: {
      fontFamily: t.typography.families.primary,
      fontSize: globalTokens.font.size200,
      fontWeight: globalTokens.font.weight.regular as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.secondary,
        fontSize: globalTokens.font.size100,
        fontWeight: globalTokens.font.weight.semibold as FontWeightValue,
      },
    },
  },
  large: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: globalTokens.font.size400,
      fontWeight: globalTokens.font.weight.semibold as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.primary,
        fontSize: globalTokens.font.size200,
        fontWeight: globalTokens.font.weight.regular as FontWeightValue,
      },
    },
  },
});
