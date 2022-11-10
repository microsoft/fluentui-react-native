import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    requiredColor: t.colors.redForeground1,
    requiredPadding: globalTokens.spacing.s,
    medium: {
      borderRadius: globalTokens.corner.radius20,
      checkboxBorderWidth: globalTokens.stroke.width10,
      checkboxBorderRadius: globalTokens.corner.radius20,
      checkboxSize: 16,
      checkmarkSize: 8,
      spacingLabelAfter: globalTokens.spacing.m,
      label: {
        padding: globalTokens.spacing.s,
        borderRadius: globalTokens.corner.radius40,
        spacingLabelAfter: globalTokens.spacing.m,
        labelIsBefore: {
          spacingLabelBefore: globalTokens.spacing.m,
          spacingLabelAfter: 0,
        },
      },
      padding: globalTokens.spacing.xs,
      variant: 'bodyStandard',
    },
    large: {
      borderRadius: globalTokens.corner.radius20,
      checkboxBorderWidth: globalTokens.stroke.width10,
      checkboxBorderRadius: globalTokens.corner.radius20,
      checkboxSize: 20,
      checkmarkSize: 10,
      spacingLabelAfter: globalTokens.spacing.m,
      label: {
        padding: globalTokens.spacing.s,
        borderRadius: globalTokens.corner.radius40,
        spacingLabelAfter: globalTokens.spacing.m,
        labelIsBefore: {
          spacingLabelBefore: globalTokens.spacing.m,
          spacingLabelAfter: 0,
        },
      },
      padding: globalTokens.spacing.xs,
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
      borderRadius: globalTokens.corner.radiusCircular,
      checkboxBorderRadius: globalTokens.corner.radiusCircular,
    },
  } as CheckboxTokens);
