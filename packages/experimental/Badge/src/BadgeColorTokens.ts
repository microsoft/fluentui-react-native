import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { BadgeTokens } from './Badge.types';

export const defaultBadgeColorTokens: TokenSettings<BadgeTokens, Theme> = (t: Theme) =>
  ({
    filled: {
      backgroundColor: t.colors.brandedBackground,
      color: t.colors.neutralForegroundInverted,
      iconColor: t.colors.neutralForegroundInverted,
      borderColor: 'transparent',
    },
    outline: {
      backgroundColor: t.colors.transparentBackground,
      color: t.colors.brandForeground1,
      borderColor: t.colors.brandForeground1,
      iconColor: t.colors.brandedBorder,
    },
    tint: {
      backgroundColor: t.colors.brandedBackground,
      color: t.colors.brandForeground2,
      borderColor: t.colors.brandForeground2,
      iconColor: t.colors.brandStroke2,
    },
  } as BadgeTokens);
