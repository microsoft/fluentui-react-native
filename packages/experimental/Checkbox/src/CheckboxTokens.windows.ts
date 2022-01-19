import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    borderRadius: globalTokens.corner.radius.small,
    checkboxBorderWidth: globalTokens.stroke.width.thin,
    checkboxBorderRadius: globalTokens.corner.radius.small,
    checkboxBackgroundColor: t.colors.neutralBackground1,
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    checkboxSize: 16,
    color: t.colors.neutralForeground3,
    spacingLabelAfter: globalTokens.spacing.m,
    variant: 'bodyStandard',
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
      checkboxBorderRadius: globalTokens.corner.radius.circle,
    },
    labelIsBefore: {
      spacingLabelBefore: globalTokens.spacing.m,
      spacingLabelAfter: 0,
    },
  } as CheckboxTokens);
