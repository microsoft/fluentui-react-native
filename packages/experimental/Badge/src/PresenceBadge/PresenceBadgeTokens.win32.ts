import { TokenSettings, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (t: Theme): PresenceBadgeTokens =>
  ({
    borderWidth: 2,
    borderColor: isHighContrast(t) ? 'transparent' : globalTokens.color.white,
    bottom: globalTokens.spacing.none,
    right: globalTokens.spacing.none,
    paddingHorizontal: globalTokens.spacing.none,
    backgroundColor: t.colors.neutralBackground1,
    ...getBadgeColor('lightGreen', t),
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
    available: getBadgeColor('lightGreen', t),
    away: getBadgeColor('marigold', t),
    awayOutOfOffice: getBadgeColor('berry', t),
    busy: getBadgeColor('red', t),
    blocked: getBadgeColor('red', t),
    unknown: getBadgeColor('red', t),
    doNotDisturb: getBadgeColor('red', t),
    offline: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color.grey[38],
    },
    outOfOffice: {
      ...getBadgeColor('berry', t),
    },
  } as PresenceBadgeTokens);

function getBadgeColor(color: string, t: Theme) {
  return {
    iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color[color].primary,
    outOfOffice: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color[color].primary,
    },
  };
}

function isHighContrast(t: Theme) {
  return t.name === 'HighContrast';
}
