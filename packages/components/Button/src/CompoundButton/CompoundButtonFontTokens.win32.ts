import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { fontWeightRegular, fontWeightSemibold } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonFontTokens: TokenSettings<CompoundButtonTokens, Theme> = (t: Theme): CompoundButtonTokens => ({
  medium: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: globalTokens.font.size200,
      fontWeight: fontWeightSemibold as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.secondary,
        fontSize: globalTokens.font.size100,
        fontWeight: fontWeightSemibold as FontWeightValue,
      },
    },
  },
  small: {
    hasContent: {
      fontFamily: t.typography.families.primary,
      fontSize: globalTokens.font.size200,
      fontWeight: fontWeightRegular as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.secondary,
        fontSize: globalTokens.font.size100,
        fontWeight: fontWeightSemibold as FontWeightValue,
      },
    },
  },
  large: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: globalTokens.font.size400,
      fontWeight: fontWeightSemibold as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.primary,
        fontSize: globalTokens.font.size200,
        fontWeight: fontWeightRegular as FontWeightValue,
      },
    },
  },
});
