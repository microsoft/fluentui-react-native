import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { fontWeightRegular } from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { BadgeTokens } from './Badge.types';

export const badgeFontTokens: TokenSettings<BadgeTokens, Theme> = (t: Theme) =>
  ({
    fontFamily: t.typography.families.primary,
    fontSize: globalTokens.font.size100,
    fontWeight: fontWeightRegular,
    large: {
      fontSize: globalTokens.font.size200,
    },
    extraLarge: {
      fontSize: globalTokens.font.size200,
    },
  }) as BadgeTokens;
