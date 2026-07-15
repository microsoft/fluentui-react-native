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
      checkmarkSize: 12,
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
      checkmarkSize: 16,
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
    checkboxBackgroundColor: t.colors.menuBackground,
    checkboxBorderColor: t.colors.menuItemText,
    checkmarkColor: t.colors.menuItemTextHovered,
    checkmarkOpacity: 0,
    color: t.colors.menuItemText,
    disabled: {
      checkboxBorderColor: t.colors.buttonBorderDisabled,
      color: t.colors.disabledBodyText,
      checkboxBackgroundColor: t.colors.background,
      checkmarkColor: t.colors.neutralForegroundDisabled,
    },
    hovered: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundHovered,
    },
    focused: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundHovered,
      borderColor: t.colors.focusBorder,
    },
    pressed: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundPressed,
    },
    checked: {
      checkmarkOpacity: 1,
    },
    circular: {
      borderRadius: cornerRadiusCircular,
      checkboxBorderRadius: cornerRadiusCircular,
    },
  }) as CheckboxTokens;
