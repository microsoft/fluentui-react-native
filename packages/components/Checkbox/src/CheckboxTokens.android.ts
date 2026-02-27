import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CheckboxTokens } from './Checkbox.types';

// No Tokens for Sizes , hovered and circular checkbox as they're not supported for Android Platform

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    requiredColor: globalTokens.color.darkRed.primary,
    requiredPadding: globalTokens.size20,
    checkboxBorderWidth: globalTokens.stroke.width15,
    checkboxBorderRadius: globalTokens.corner.radius40,
    checkboxSize: globalTokens.size200,
    checkmarkSize: globalTokens.size120,
    rippleColor: '#D4D4D4',
    label: {
      // Tokens taken from Android List Item
      color: t.colors.neutralForeground1,
      padding: globalTokens.size20,
      spacingLabelAfter: globalTokens.size160,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.size120,
        spacingLabelAfter: 0,
      },
    },
    pressed: {
      checkboxBackgroundColor: t.colors.neutralBackground1Pressed,
    },
    padding: globalTokens.size20,
    variant: 'body1',
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    checkmarkOpacity: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled1,
    },
    checked: {
      checkboxBackgroundColor: t.colors.brandBackground,
      checkmarkOpacity: 1,
      checkboxBorderWidth: globalTokens.stroke.widthNone,
      checkmarkColor: t.colors.neutralForegroundOnColor,
      disabled: {
        checkboxBackgroundColor: t.colors.brandBackgroundDisabled,
      },
    },
  }) as CheckboxTokens;
