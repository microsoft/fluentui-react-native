import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import {
  cornerRadius20,
  cornerRadius40,
  cornerRadiusCircular,
  fontWeightRegular,
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
        paddingHorizontal: size120,
        borderRadius: cornerRadius40,
        spacingLabelAfter: size80,
        labelIsBefore: {
          spacingLabelBefore: size80,
          spacingLabelAfter: 0,
        },
      },
      padding: size40,
      fontSize: globalTokens.font.size200,
      fontWeight: fontWeightRegular,
      fontFamily: t.typography.families.primary,
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
      fontSize: globalTokens.font.size300,
      fontWeight: fontWeightRegular,
      fontFamily: t.typography.families.primary,
    },
    checkboxBackgroundColor: t.colors.neutralBackground1,
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground1,
    checkmarkOpacity: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled,
      checkboxBackgroundColor: t.colors.neutralBackgroundDisabled,
    },
    hovered: {
      checkboxBackgroundColor: t.colors.neutralBackground1,
      checkboxBorderColor: t.colors.neutralStrokeAccessibleHover,
      checkmarkColor: t.colors.neutralForeground4,
      checkmarkOpacity: 1,
      color: t.colors.neutralForeground1,
      checked: {
        checkboxBackgroundColor: t.colors.brandBackgroundHover,
        checkboxBorderColor: t.colors.compoundBrandStroke1Hover,
        checkmarkColor: t.colors.neutralForegroundOnBrandHover,
      },
    },
    pressed: {
      checkboxBackgroundColor: t.colors.neutralBackground1,
      checkboxBorderColor: t.colors.neutralStrokeAccessiblePressed,
      checkmarkColor: t.colors.neutralForeground1,
      checkmarkOpacity: 1,
      color: t.colors.neutralForeground1,
      checked: {
        checkboxBackgroundColor: t.colors.brandBackgroundPressed,
        checkboxBorderColor: t.colors.compoundBrandStroke1Pressed,
        checkmarkColor: t.colors.neutralForegroundOnBrandPressed,
      },
    },
    checked: {
      checkboxBackgroundColor: t.colors.brandBackground,
      checkboxBorderColor: t.colors.compoundBrandStroke1Hover,
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
