import type { Theme, TokenSettings } from '@fluentui-react-native/framework';

import type { ChipTokens } from './Chip.types';

export const defaultChipColorTokens: TokenSettings<ChipTokens> = (t: Theme) =>
  ({
    // neutral is default appearance on Android.
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
    },
    danger: {
      backgroundColor: t.colors.dangerBackground1,
      color: t.colors.dangerForeground1,
      selected: {
        backgroundColor: t.colors.dangerBackground2,
        color: 'white',
      },
    },
    severe: {
      backgroundColor: t.colors.severeBackground1,
      color: t.colors.severeForeground1,
      selected: {
        backgroundColor: t.colors.severeBackground2,
        color: 'white',
      },
    },
    warning: {
      backgroundColor: t.colors.warningBackground1,
      color: t.colors.warningForeground1,
      selected: {
        backgroundColor: t.colors.warningBackground2,
        color: 'black',
      },
    },
    success: {
      backgroundColor: t.colors.successBackground1,
      color: t.colors.successForeground1,
      selected: {
        backgroundColor: t.colors.successBackground2,
        color: 'white',
      },
    },
    searchBar: {
      backgroundColor: t.colors.neutralBackground6,
      color: t.colors.neutralForeground1,
      selected: {
        backgroundColor: t.colors.brandBackgroundInverted,
        color: t.colors.neutralForegroundOnColor,
      },
      disabled: {
        backgroundColor: t.colors.neutralBackground6,
        color: t.colors.neutralForegroundDisabled2,
      },
      brand: {
        backgroundColor: t.colors.brandBackground3,
        color: t.colors.neutralForegroundOnColor,
        selected: {
          backgroundColor: t.colors.neutralBackground1,
          color: t.colors.brandForeground1,
        },
        disabled: {
          backgroundColor: t.colors.brandBackground3,
          color: t.colors.brandForeground1Disabled,
        },
      },
    },
  }) as ChipTokens;
