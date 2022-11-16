import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';

export const badgeFontTokens: TokenSettings<BadgeTokens, Theme> = (t: Theme) =>
  ({
    fontFamily: t.typography.families.primary,
    fontSize: globalTokens.font.size100,
    fontWeight: globalTokens.font.weight.regular,
    large: {
      fontSize: globalTokens.font.size200,
    },
    extraLarge: {
      fontSize: globalTokens.font.size200,
    },
  } as BadgeTokens);
