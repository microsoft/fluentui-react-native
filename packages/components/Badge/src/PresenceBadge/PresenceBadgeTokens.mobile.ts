import type { TokenSettings, Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';

import type { PresenceBadgeTokens } from './PresenceBadge.types';

export const defaultPresenceBadgeTokens: TokenSettings<PresenceBadgeTokens> = (t: Theme): PresenceBadgeTokens =>
  ({
    borderWidth: globalTokens.stroke.width20,
    borderColor: t.colors.neutralBackground1,
    paddingHorizontal: globalTokens.sizeNone,
    backgroundColor: t.colors.neutralBackground1,
    // position is overriden through Avatar Tokens for Android since same badge size requires different positioning for different Avatar sizes.
    position: 'relative',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,

    // 'tiny', 'extraSmall', 'extraLarge' are not supported on Android.
    small: {
      width: 10,
      height: 10,
    },
    medium: {
      width: 12,
      height: 12,
    },
    large: {
      width: 16,
      height: 16,
    },
    outOfOffice: {
      iconColor: t.colors.presenceOof,
      outOfOffice: {
        iconColor: t.colors.presenceOof,
      },
    },
    available: {
      iconColor: t.colors.presenceAvailable,
      outOfOffice: {
        iconColor: t.colors.presenceAvailable,
      },
    },
    away: {
      iconColor: t.colors.presenceAway,
      outOfOffice: {
        iconColor: t.colors.presenceOof,
      },
    },
    busy: {
      iconColor: t.colors.presenceDnd,
      outOfOffice: {
        iconColor: t.colors.presenceDnd,
      },
    },
    blocked: {
      iconColor: t.colors.presenceDnd,
      outOfOffice: {
        iconColor: t.colors.presenceDnd,
      },
    },
    doNotDisturb: {
      iconColor: t.colors.presenceDnd,
      outOfOffice: {
        iconColor: t.colors.presenceDnd,
      },
    },
    offline: {
      iconColor: t.colors.neutralForeground3,
      outOfOffice: {
        iconColor: t.colors.neutralForeground3,
      },
    },
    unknown: {
      iconColor: t.colors.neutralForeground3,
      outOfOffice: {
        iconColor: t.colors.neutralForeground3,
      },
    },
  }) as PresenceBadgeTokens;
