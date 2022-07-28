import { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';

export const defaultBadgeTokens: TokenSettings<BadgeTokens> = () =>
  ({
    iconSize: 12,
    borderWidth: globalTokens.stroke.width.thin,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    tiny: {
      minWidth: 6,
      height: 6,
      rounded: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    extraSmall: {
      minWidth: 10,
      height: 10,
      iconSize: 10,
      rounded: {
        borderRadius: globalTokens.corner.radius.small,
      },
    },
    small: {
      minWidth: 16,
      height: 16,
      iconSize: 12,
      paddingHorizontal: globalTokens.spacing.xxs,
      flexGap: 2,
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
      flexGap: 2,
      variant: 'secondaryStandard',
    },
    large: {
      minWidth: 24,
      height: 24,
      iconSize: 16,
      paddingHorizontal: globalTokens.spacing.xs,
      flexGap: 2,
      variant: 'secondaryStandard',
    },
    extraLarge: {
      minWidth: 32,
      height: 32,
      iconSize: 20,
      paddingHorizontal: globalTokens.spacing.sNudge,
      flexGap: 4,
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
