import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';

export const defaultBadgeTokens: TokenSettings<BadgeTokens, Theme> = () =>
  ({
    iconSize: 12,
    borderWidth: globalTokens.stroke.width10,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    textMargin: globalTokens.spacing.xxs,
    position: 'relative',
    shadowToken: undefined,
    tiny: {
      minWidth: 6,
      minHeight: 6,
      rounded: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    extraSmall: {
      minWidth: 10,
      minHeight: 10,
      iconSize: 10,
      rounded: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    small: {
      minWidth: 16,
      minHeight: 16,
      iconSize: 12,
      paddingHorizontal: globalTokens.spacing.xxs,
      textMargin: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xxs,
      rounded: {
        borderRadius: globalTokens.corner.radius20,
      },
    },
    medium: {
      minWidth: 20,
      minHeight: 20,
      iconSize: 12,
      paddingHorizontal: globalTokens.spacing.xs,
      textMargin: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xxs,
    },
    large: {
      minWidth: 24,
      minHeight: 24,
      iconSize: 16,
      paddingHorizontal: globalTokens.spacing.xs,
      textMargin: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xxs,
    },
    extraLarge: {
      minWidth: 32,
      minHeight: 32,
      iconSize: 20,
      paddingHorizontal: globalTokens.spacing.sNudge,
      textMargin: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xs,
    },
    rounded: {
      borderRadius: globalTokens.corner.radius40,
    },
    circular: {
      borderRadius: globalTokens.corner.radiusCircular,
    },
    square: {
      borderRadius: globalTokens.corner.radiusNone,
    },
    rtl: {
      left: globalTokens.spacing.none,
      right: undefined,
    },
  } as BadgeTokens);
