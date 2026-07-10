import type { TokenSettings, Theme } from '@fluentui-react-native/framework';
import {
  colorBerryPrimary,
  colorGrey38,
  colorLightGreenPrimary,
  colorMarigoldPrimary,
  colorRedPrimary,
  colorWhite,
  size20,
  sizeNone,
} from '@fluentui-react-native/design/tokens/global';
import { isHighContrast } from '@fluentui-react-native/theming-utils';
import { getBadgeColor } from './PresenceBadge.helpers';

import type { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (t: Theme): PresenceBadgeTokens =>
  ({
    borderWidth: 1,
    borderColor: isHighContrast(t) ? 'transparent' : colorWhite,
    bottom: -1,
    right: -1,
    paddingHorizontal: sizeNone,
    backgroundColor: t.colors.neutralBackground1,
    position: 'relative',
    ...getBadgeColor(colorLightGreenPrimary, t),
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
      bottom: -size20,
      right: -size20,
    },
    extraLarge: {
      width: 28,
      height: 28,
      borderWidth: 2,
      bottom: -size20,
      right: -size20,
    },
    available: getBadgeColor(colorLightGreenPrimary, t),
    away: getBadgeColor(colorMarigoldPrimary, t, colorBerryPrimary),
    busy: getBadgeColor(colorRedPrimary, t),
    blocked: getBadgeColor(colorRedPrimary, t),
    unknown: getBadgeColor(colorRedPrimary, t),
    doNotDisturb: getBadgeColor(colorRedPrimary, t),
    offline: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : colorGrey38,
    },
    outOfOffice: getBadgeColor(colorBerryPrimary, t),
  }) as PresenceBadgeTokens;
