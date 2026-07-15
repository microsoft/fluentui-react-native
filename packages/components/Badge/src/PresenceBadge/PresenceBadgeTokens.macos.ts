import type { TokenSettings } from '@fluentui-react-native/framework';
import {
  colorBerryPrimary,
  colorGrey38,
  colorMarigoldPrimary,
  colorWhite,
  sizeNone,
  colorLightGreenPrimary,
  colorRedPrimary,
} from '@fluentui-react-native/design/tokens/global';
import { getBadgeColor } from './PresenceBadge.helpers';

import type { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (): PresenceBadgeTokens =>
  ({
    borderWidth: 1,
    borderColor: colorWhite,
    bottom: sizeNone,
    right: sizeNone,
    paddingHorizontal: sizeNone,
    backgroundColor: colorWhite,
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
    available: getBadgeColor(colorLightGreenPrimary),
    away: {
      iconColor: colorMarigoldPrimary,
      outOfOffice: {
        iconColor: colorBerryPrimary,
      },
    },
    busy: getBadgeColor(colorRedPrimary),
    blocked: getBadgeColor(colorRedPrimary),
    unknown: getBadgeColor(colorRedPrimary),
    offline: {
      iconColor: colorGrey38,
    },
    outOfOffice: getBadgeColor(colorBerryPrimary),
  }) as PresenceBadgeTokens;
