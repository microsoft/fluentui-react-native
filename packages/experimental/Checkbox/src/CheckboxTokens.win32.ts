import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    medium: {
      borderRadius: globalTokens.corner.radius.small,
      checkboxBorderWidth: globalTokens.stroke.width.thin,
      checkboxBorderRadius: globalTokens.corner.radius.small,
      checkboxSize: 16,
      checkmarkSize: 8,
      spacingLabelAfter: globalTokens.spacing.s,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.spacing.s,
        spacingLabelAfter: 0,
      },
      padding: globalTokens.spacing.m,
      fontSize: globalTokens.font.size[200],
      fontWeight: globalTokens.font.weight.regular,
      fontFamily: t.typography.families.primary,
    },
    large: {
      borderRadius: globalTokens.corner.radius.small,
      checkboxBorderWidth: globalTokens.stroke.width.thin,
      checkboxBorderRadius: globalTokens.corner.radius.small,
      checkboxSize: 20,
      checkmarkSize: 10,
      spacingLabelAfter: globalTokens.spacing.s,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.spacing.s,
        spacingLabelAfter: 0,
      },
      padding: globalTokens.spacing.m,
      fontSize: globalTokens.font.size[200],
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
        checkboxBorderColor: t.colors.brandBackgroundHover,
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
        checkboxBorderColor: t.colors.brandBackgroundPressed,
      },
    },
    checked: {
      checkboxBackgroundColor: t.colors.brandBackground,
      checkboxBorderColor: t.colors.brandBackground,
      checkmarkOpacity: 1,
      checkmarkColor: t.colors.neutralForegroundOnBrand,
      disabled: {
        checkmarkColor: t.colors.neutralForegroundDisabled,
      },
    },
    circular: {
      checkboxBorderRadius: globalTokens.corner.radius.circle,
    },
  } as CheckboxTokens);
