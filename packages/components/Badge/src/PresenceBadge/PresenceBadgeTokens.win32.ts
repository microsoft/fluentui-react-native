import type { TokenSettings, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { isHighContrast } from '@fluentui-react-native/theming-utils';

import type { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (t: Theme): PresenceBadgeTokens =>
  ({
    borderWidth: 1,
    borderColor: isHighContrast(t) ? 'transparent' : globalTokens.color.white,
    bottom: -1,
    right: -1,
    paddingHorizontal: globalTokens.sizeNone,
    backgroundColor: t.colors.neutralBackground1,
    position: 'relative',
    ...getBadgeColor('lightGreen', t),
    tiny: {
      width: 6,
      height: 6,
    },
    extraSmall: {
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
      bottom: -globalTokens.size20,
      right: -globalTokens.size20,
    },
    extraLarge: {
      width: 28,
      height: 28,
      borderWidth: 2,
      bottom: -globalTokens.size20,
      right: -globalTokens.size20,
    },
    available: getBadgeColor('lightGreen', t),
    away: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color['marigold'].primary,
      outOfOffice: {
        iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color['berry'].primary,
      },
    },
    busy: getBadgeColor('red', t),
    blocked: getBadgeColor('red', t),
    unknown: getBadgeColor('red', t),
    doNotDisturb: getBadgeColor('red', t),
    offline: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color.grey38,
    },
    outOfOffice: getBadgeColor('berry', t),
  } as PresenceBadgeTokens);

function getBadgeColor(color: string, t: Theme) {
  return {
    iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color[color].primary,
    outOfOffice: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : globalTokens.color[color].primary,
    },
  };
}
