import type { Theme } from '@fluentui-react-native/framework';
import {
  colorDarkRedPrimary,
  cornerRadius40,
  size120,
  size160,
  size20,
  size200,
  strokeWidth15,
  strokeWidthNone,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CheckboxTokens } from './Checkbox.types';

// No Tokens for Sizes , hovered and circular checkbox as they're not supported for Android Platform

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    requiredColor: colorDarkRedPrimary,
    requiredPadding: size20,
    checkboxBorderWidth: strokeWidth15,
    checkboxBorderRadius: cornerRadius40,
    checkboxSize: size200,
    checkmarkSize: size120,
    rippleColor: '#D4D4D4',
    label: {
      // Tokens taken from Android List Item
      color: t.colors.neutralForeground1,
      padding: size20,
      spacingLabelAfter: size160,
      labelIsBefore: {
        spacingLabelBefore: size120,
        spacingLabelAfter: 0,
      },
    },
    pressed: {
      checkboxBackgroundColor: t.colors.neutralBackground1Pressed,
    },
    padding: size20,
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
      checkboxBorderWidth: strokeWidthNone,
      checkmarkColor: t.colors.neutralForegroundOnColor,
      disabled: {
        checkboxBackgroundColor: t.colors.brandBackgroundDisabled,
      },
    },
  }) as CheckboxTokens;
