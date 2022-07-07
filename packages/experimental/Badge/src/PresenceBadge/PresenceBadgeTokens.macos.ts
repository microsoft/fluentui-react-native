import { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (): PresenceBadgeTokens =>
  ({
    borderWidth: 2,
    borderColor: globalTokens.color.white,
    bottom: -globalTokens.spacing.xs,
    right: -globalTokens.spacing.xs,
    paddingHorizontal: globalTokens.spacing.none,
    backgroundColor: globalTokens.color.white,
    smallest: {
      width: 6,
      height: 6,
      borderWidth: 1,
      bottom: -globalTokens.spacing.xxs,
      right: -globalTokens.spacing.xxs,
    },
    smaller: {
      width: 10,
      height: 10,
      bottom: -globalTokens.spacing.xxs,
      right: -globalTokens.spacing.xxs,
    },
    small: {
      width: 12,
      height: 12,
      bottom: -globalTokens.spacing.xxs,
      right: -globalTokens.spacing.xxs,
    },
    medium: {
      width: 20,
      height: 20,
    },
    large: {
      width: 24,
      height: 24,
    },
    largest: {
      width: 28,
      height: 28,
    },
  } as PresenceBadgeTokens);
