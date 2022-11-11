import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
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
      checkmarkSize: 12,
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
      checkmarkSize: 16,
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
      borderRadius: globalTokens.corner.radiusCircular,
      checkboxBorderRadius: globalTokens.corner.radiusCircular,
    },
  } as CheckboxTokens);
