import { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = () =>
  ({
    borderWidth: 0,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    paddingHorizontal: globalTokens.spacing.none,
    backgroundColor: globalTokens.color.white,
    smallest: {
      width: 6,
    },
    smaller: {
      width: 10,
    },
    small: {
      width: 16,
    },
    medium: {
      width: 20,
    },
    large: {
      width: 24,
    },
    largest: {
      width: 32,
    },
  } as PresenceBadgeTokens);
