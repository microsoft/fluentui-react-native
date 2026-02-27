import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { RadioTokens } from './Radio.types';

// A copy of RadioTokens.android.ts, these are expected to change in the future.

export const defaultRadioTokens: TokenSettings<RadioTokens, Theme> = (t: Theme) =>
  ({
    // Tokens for label are taken from Android List Item
    color: t.colors.neutralForeground1,
    variant: 'body1',
    labelMarginLeft: globalTokens.size160,
    labelPadding: globalTokens.size20,
    subtextVariant: 'caption1',
    flexDirection: 'row',
    alignItems: 'center',
    labelPositionBelow: {
      flexDirection: 'column',
      marginLeft: globalTokens.sizeNone,
    },

    marginTop: 24 - 20, // Size - Outer Circle Size
    marginBottom: 24 - 20, // Size - Outer Circle Size
    marginLeft: 24 - 20, // Size - Outer Circle Size
    marginRight: 24 - 20, // Size - Outer Circle Size
    radioOuterCircleSize: 20,
    radioInnerCircleSize: 10,
    rippleRadius: globalTokens.size160,
    rippleColor: '#D4D4D4',

    // Unselected, Rest
    radioVisibility: 0,

    disabled: {
      // Unselected, Disabled
      rippleColor: '#D4D4D4',
      radioBorder: t.colors.neutralStrokeDisabled,
      radioVisibility: 0,
      color: t.colors.neutralForegroundDisabled1,
    },

    selected: {
      // Selected, Rest
      radioBorder: t.colors.brandBackground,
      radioFill: t.colors.brandForeground1,
      radioVisibility: 1,

      disabled: {
        // Selected, Disabled
        radioBorder: t.colors.brandBackgroundDisabled,
        radioFill: t.colors.brandForegroundDisabled2,
        radioVisibility: 1,
        color: t.colors.neutralForegroundDisabled1,
      },
    },
  }) as RadioTokens;
