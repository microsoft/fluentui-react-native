import type { FontWeightValue, Theme } from '@fluentui-react-native/framework';
import { fontSize100, fontSize200, fontSize400, fontWeightRegular, fontWeightSemibold } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CompoundButtonTokens } from './CompoundButton.types';

export const defaultCompoundButtonFontTokens: TokenSettings<CompoundButtonTokens, Theme> = (t: Theme): CompoundButtonTokens => ({
  medium: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: fontSize200,
      fontWeight: fontWeightSemibold as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.secondary,
        fontSize: fontSize100,
        fontWeight: fontWeightSemibold as FontWeightValue,
      },
    },
  },
  small: {
    hasContent: {
      fontFamily: t.typography.families.primary,
      fontSize: fontSize200,
      fontWeight: fontWeightRegular as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.secondary,
        fontSize: fontSize100,
        fontWeight: fontWeightSemibold as FontWeightValue,
      },
    },
  },
  large: {
    hasContent: {
      fontFamily: t.typography.families.secondary,
      fontSize: fontSize400,
      fontWeight: fontWeightSemibold as FontWeightValue,
      secondaryContentFont: {
        fontFamily: t.typography.families.primary,
        fontSize: fontSize200,
        fontWeight: fontWeightRegular as FontWeightValue,
      },
    },
  },
});
