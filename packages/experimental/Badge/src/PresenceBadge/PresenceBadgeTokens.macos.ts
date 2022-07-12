import { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (): PresenceBadgeTokens =>
  ({
    borderWidth: 1,
    borderColor: globalTokens.color.white,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    paddingHorizontal: globalTokens.spacing.none,
    backgroundColor: globalTokens.color.white,
    smallest: {
      width: 6,
      height: 6,
    },
    smaller: {
      width: 10,
      height: 10,
    },
    small: {
      width: 12,
      height: 12,
    },
    medium: {
      width: 16,
      height: 16,
    },
    large: {
      width: 20,
      height: 20,
      borderWidth: 2,
    },
    largest: {
      width: 28,
      height: 28,
      borderWidth: 2,
    },
  } as PresenceBadgeTokens);
