import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';

export const defaultBadgeTokens: TokenSettings<BadgeTokens, Theme> = (t: Theme) =>
  ({
    iconSize: 12,
    borderWidth: globalTokens.stroke.width.thin,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    fontSize: 10,
    textPadding: globalTokens.spacing.xxs,
    fontFamily: t.typography.families.primary,
    fontWeight: globalTokens.font.weight.semibold,
    tiny: {
      minWidth: 6,
      height: 6,
      fontSize: 4,
      rounded: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    extraSmall: {
      minWidth: 10,
      height: 10,
      iconSize: 10,
      fontSize: 6,
      rounded: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    small: {
      minWidth: 16,
      height: 16,
      iconSize: 12,
      paddingHorizontal: globalTokens.spacing.xxs,
      textPadding: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xxs,
      fontSize: 8,
      variant: 'captionStandard',
      rounded: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    medium: {
      minWidth: 20,
      height: 20,
      iconSize: 12,
      paddingHorizontal: globalTokens.spacing.xs,
      textPadding: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xxs,
      fontSize: 10,
      variant: 'secondaryStandard',
    },
    large: {
      minWidth: 24,
      height: 24,
      iconSize: 16,
      paddingHorizontal: globalTokens.spacing.xs,
      textPadding: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xxs,
      fontSize: 12,
      variant: 'secondaryStandard',
    },
    extraLarge: {
      minWidth: 32,
      height: 32,
      iconSize: 20,
      paddingHorizontal: globalTokens.spacing.sNudge,
      textPadding: globalTokens.spacing.xxs,
      flexGap: globalTokens.spacing.xs,
      fontSize: 12,
      variant: 'secondaryStandard',
    },
    rounded: {
      borderRadius: globalTokens.corner.radius.medium,
    },
    circular: {
      borderRadius: globalTokens.corner.radius.circle,
    },
    square: {
      borderRadius: globalTokens.corner.radius.none,
    },
  } as BadgeTokens);
