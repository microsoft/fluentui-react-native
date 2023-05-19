import type { Theme, TokenSettings } from '@fluentui-react-native/framework';

import type { BadgeTokens } from './Badge.types';

export const defaultBadgeColorTokens: TokenSettings<BadgeTokens> = (t: Theme) =>
  ({
    // neutral is default appearance on Android.
    // 'important', 'informative', 'subtle' are not supported on Android.
    backgroundColor: t.colors.neutralBackground5,
    color: t.colors.neutralForeground2,
    selected: {
      backgroundColor: t.colors.neutralBackground5Selected,
      color: t.colors.neutralForeground1,
    },
    disabled: {
      backgroundColor: t.colors.neutralBackground5,
      color: t.colors.neutralForegroundDisabled1,
    },
    brand: {
      backgroundColor: t.colors.brandBackgroundTint,
      color: t.colors.brandForegroundTint,
      selected: {
        backgroundColor: t.colors.brandBackground,
        color: t.colors.neutralForegroundOnColor,
      },
      disabled: {
        backgroundColor: t.colors.neutralBackground5,
        color: t.colors.neutralForegroundDisabled1,
      },
    },
    danger: {
      backgroundColor: t.colors.dangerBackground1,
      color: t.colors.dangerForeground1,
      selected: {
        backgroundColor: t.colors.dangerBackground2,
        color: t.colors.neutralForegroundLightStatic,
      },
    },
    severe: {
      backgroundColor: t.colors.severeBackground1,
      color: t.colors.severeForeground1,
      selected: {
        backgroundColor: t.colors.severeBackground2,
        color: t.colors.neutralForegroundLightStatic,
      },
    },
    warning: {
      backgroundColor: t.colors.warningBackground1,
      color: t.colors.warningForeground1,
      selected: {
        backgroundColor: t.colors.warningBackground2,
        color: t.colors.neutralForegroundDarkStatic,
      },
    },
    success: {
      backgroundColor: t.colors.successBackground1,
      color: t.colors.successForeground1,
      selected: {
        backgroundColor: t.colors.successBackground2,
        color: t.colors.neutralForegroundLightStatic,
      },
    },
  } as BadgeTokens);
