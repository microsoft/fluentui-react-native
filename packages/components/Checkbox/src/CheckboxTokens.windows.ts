import type { Theme } from '@fluentui-react-native/framework';
import {
  cornerRadius20,
  cornerRadius40,
  cornerRadiusCircular,
  size120,
  size40,
  size80,
  strokeWidth10,
} from '@fluentui-react-native/design/tokens/global';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    requiredColor: t.colors.redForeground1,
    requiredPadding: size80,
    medium: {
      borderRadius: cornerRadius20,
      checkboxBorderWidth: strokeWidth10,
      checkboxBorderRadius: cornerRadius20,
      checkboxSize: 16,
      checkmarkSize: 8,
      spacingLabelAfter: size120,
      label: {
        padding: size80,
        borderRadius: cornerRadius40,
        spacingLabelAfter: size120,
        labelIsBefore: {
          spacingLabelBefore: size120,
          spacingLabelAfter: 0,
        },
      },
      padding: size40,
      variant: 'bodyStandard',
    },
    large: {
      borderRadius: cornerRadius20,
      checkboxBorderWidth: strokeWidth10,
      checkboxBorderRadius: cornerRadius20,
      checkboxSize: 20,
      checkmarkSize: 10,
      spacingLabelAfter: size120,
      label: {
        padding: size80,
        borderRadius: cornerRadius40,
        spacingLabelAfter: size120,
        labelIsBefore: {
          spacingLabelBefore: size120,
          spacingLabelAfter: 0,
        },
      },
      padding: size40,
      variant: 'bodyStandard',
    },
    checkboxBackgroundColor: t.colors.neutralBackground1,
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground3,
    checkmarkOpacity: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled,
      checkboxBackgroundColor: t.colors.neutralBackgroundDisabled,
    },
    hovered: {
      checkboxBackgroundColor: t.colors.neutralBackground1,
      checkboxBorderColor: t.colors.neutralStrokeAccessibleHover,
      color: t.colors.neutralForeground2,
      checked: {
        checkboxBackgroundColor: t.colors.compoundBrandBackground1Hover,
        checkboxBorderColor: t.colors.compoundBrandBackground1Hover,
        checkmarkColor: t.colors.neutralForegroundOnBrand,
        checkmarkOpacity: 1,
      },
    },
    pressed: {
      checkboxBackgroundColor: t.colors.neutralBackground1,
      checkboxBorderColor: t.colors.neutralStrokeAccessiblePressed,
      color: t.colors.neutralForeground1,
      checked: {
        checkboxBackgroundColor: t.colors.compoundBrandBackground1Pressed,
        checkboxBorderColor: t.colors.compoundBrandBackground1Pressed,
        checkmarkColor: t.colors.neutralForegroundOnBrand,
        checkmarkOpacity: 1,
      },
    },
    checked: {
      checkboxBackgroundColor: t.colors.compoundBrandBackground1,
      checkboxBorderColor: t.colors.compoundBrandBackground1,
      checkmarkOpacity: 1,
      checkmarkColor: t.colors.neutralForegroundOnBrand,
      disabled: {
        checkmarkColor: t.colors.neutralForegroundDisabled,
      },
    },
    circular: {
      borderRadius: cornerRadiusCircular,
      checkboxBorderRadius: cornerRadiusCircular,
    },
  }) as CheckboxTokens;
