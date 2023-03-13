import type { TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (): PresenceBadgeTokens =>
  ({
    borderWidth: 1,
    borderColor: globalTokens.color.white,
    bottom: globalTokens.sizeNone,
    right: globalTokens.sizeNone,
    paddingHorizontal: globalTokens.sizeNone,
    backgroundColor: globalTokens.color.white,
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
    },
    extraLarge: {
      width: 28,
      height: 28,
      borderWidth: 2,
    },
    available: getBadgeColor('lightGreen'),
    away: {
      iconColor: globalTokens.color['marigold'].primary,
      outOfOffice: {
        iconColor: globalTokens.color['berry'].primary,
      },
    },
    busy: getBadgeColor('red'),
    blocked: getBadgeColor('red'),
    unknown: getBadgeColor('red'),
    offline: {
      iconColor: globalTokens.color.grey38,
    },
    outOfOffice: getBadgeColor('berry'),
  } as PresenceBadgeTokens);

function getBadgeColor(color: string) {
  return {
    iconColor: globalTokens.color[color].primary,
    outOfOffice: {
      iconColor: globalTokens.color[color].primary,
    },
  };
}
