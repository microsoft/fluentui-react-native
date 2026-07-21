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
import { isHighContrast } from '@fluentui-react-native/design/theming';

import type { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (t: Theme): PresenceBadgeTokens =>
  ({
    borderWidth: 1,
    borderColor: isHighContrast(t) ? 'transparent' : colorWhite,
    bottom: -1,
    right: -1,
    paddingHorizontal: sizeNone,
    backgroundColor: t.colors.neutralBackground1,
    ...getBadgeColor(colorLightGreenPrimary, t),
    position: 'relative',
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
      borderWidth: 2,
      width: 20,
      height: 20,
      bottom: -size20,
      right: -size20,
    },
    extraLarge: {
      borderWidth: 2,
      width: 28,
      height: 28,
      bottom: -size20,
      right: -size20,
    },
    available: getBadgeColor(colorLightGreenPrimary, t),
    away: getBadgeColor(colorMarigoldPrimary, t, colorBerryPrimary),
    busy: getBadgeColor(colorRedPrimary, t),
    blocked: getBadgeColor(colorRedPrimary, t),
    unknown: getBadgeColor(colorRedPrimary, t),
    offline: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : colorGrey38,
    },
    outOfOffice: getBadgeColor(colorBerryPrimary, t),
  }) as PresenceBadgeTokens;

function getBadgeColor(nonHcColor: string, t: Theme, oofColor?: string): PresenceBadgeTokens {
  oofColor ??= nonHcColor;
  return {
    iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : nonHcColor,
    outOfOffice: {
      iconColor: isHighContrast(t) ? t.colors.neutralForeground3 : oofColor,
    },
  };
}
