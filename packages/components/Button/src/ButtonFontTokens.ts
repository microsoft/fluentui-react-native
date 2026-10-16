import type { Theme } from '@fluentui-react-native/framework';
import { fontSize200, fontSize300, fontSize400, fontWeightRegular, fontWeightSemibold } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

export const defaultButtonFontTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    medium: {
      hasContent: {
        fontFamily: t.typography.families.secondary,
        fontSize: fontSize300,
        fontWeight: fontWeightSemibold,
      },
    },
    small: {
      hasContent: {
        fontFamily: t.typography.families.primary,
        fontSize: fontSize200,
        fontWeight: fontWeightRegular,
      },
    },
    large: {
      hasContent: {
        fontFamily: t.typography.families.secondary,
        fontSize: fontSize400,
        fontWeight: fontWeightSemibold,
      },
    },
  }) as ButtonTokens;
