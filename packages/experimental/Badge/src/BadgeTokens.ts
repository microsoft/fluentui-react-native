import { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';

export const defaultBadgeTokens: TokenSettings<BadgeTokens> = () =>
  ({
    iconSize: 5,
    borderWidth: globalTokens.stroke.width.thin,
    smallest: {
      minWidth: 6,
      height: 6,
    },
    smaller: {
      minWidth: 10,
      height: 10,
    },
    small: {
      minWidth: 16,
      height: 16,
      paddingHorizontal: globalTokens.spacing.xxs,
      variant: 'captionStandard',
      iconSize: 12,
    },
    medium: {
      minWidth: 20,
      height: 20,
      paddingHorizontal: globalTokens.spacing.xs,
      variant: 'secondaryStandard',
      iconSize: 12,
    },
    large: {
      minWidth: 24,
      height: 24,
      paddingHorizontal: globalTokens.spacing.xs,
      iconSize: 16,
    },
    largest: {
      minWidth: 32,
      height: 32,
      paddingHorizontal: globalTokens.spacing.sNudge,
      iconSize: 20,
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
