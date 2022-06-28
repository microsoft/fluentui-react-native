import { TokenSettings, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (t: Theme): PresenceBadgeTokens =>
  ({
    borderWidth: 2,
    borderColor: t.name === 'HighContrast' ? 'transparent' : globalTokens.color.white,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    paddingHorizontal: globalTokens.spacing.none,
    backgroundColor: t.name === 'HighContrast' ? globalTokens.color.black : globalTokens.color.white,
    smallest: {
      width: 6,
      height: 6,
    },
    smaller: {
      width: 10,
      height: 10,
    },
    small: {
      width: 16,
      height: 16,
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
      width: 32,
      height: 32,
    },
  } as PresenceBadgeTokens);
