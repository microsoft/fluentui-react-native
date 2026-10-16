import type { Theme } from '@fluentui-react-native/framework';
import { fontSize100, fontSize200, fontWeightRegular } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { BadgeTokens } from './Badge.types';

export const badgeFontTokens: TokenSettings<BadgeTokens, Theme> = (t: Theme) =>
  ({
    fontFamily: t.typography.families.primary,
    fontSize: fontSize100,
    fontWeight: fontWeightRegular,
    large: {
      fontSize: fontSize200,
    },
    extraLarge: {
      fontSize: fontSize200,
    },
  }) as BadgeTokens;
