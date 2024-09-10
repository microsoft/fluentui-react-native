import type { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    requiredColor: t.colors.redForeground1,
    requiredPadding: globalTokens.size80,
    medium: {
      borderRadius: globalTokens.corner.radius20,
      checkboxBorderWidth: globalTokens.stroke.width10,
      checkboxBorderRadius: globalTokens.corner.radius20,
      checkboxSize: 16,
      checkmarkSize: 12,
      label: {
        padding: globalTokens.size80,
        paddingHorizontal: globalTokens.size120,
        borderRadius: globalTokens.corner.radius40,
        spacingLabelAfter: globalTokens.size80,
        labelIsBefore: {
          spacingLabelBefore: globalTokens.size80,
          spacingLabelAfter: 0,
        },
      },
      padding: globalTokens.size40,
      fontSize: globalTokens.font.size200,
      fontWeight: globalTokens.font.weight.regular,
      fontFamily: t.typography.families.primary,
    },
    large: {
      borderRadius: globalTokens.corner.radius20,
      checkboxBorderWidth: globalTokens.stroke.width10,
      checkboxBorderRadius: globalTokens.corner.radius20,
      checkboxSize: 20,
      checkmarkSize: 16,
      label: {
        padding: globalTokens.size80,
        borderRadius: globalTokens.corner.radius40,
        spacingLabelAfter: globalTokens.size120,
        labelIsBefore: {
          spacingLabelBefore: globalTokens.size120,
          spacingLabelAfter: 0,
        },
      },
      padding: globalTokens.size40,
      fontSize: globalTokens.font.size300,
      fontWeight: globalTokens.font.weight.regular,
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
      borderRadius: globalTokens.corner.radiusCircular,
      checkboxBorderRadius: globalTokens.corner.radiusCircular,
    },
  } as CheckboxTokens);
