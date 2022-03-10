import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    requiredColor: t.colors.redForeground1,
    requiredPadding: globalTokens.spacing.s,
    medium: {
      borderRadius: globalTokens.corner.radius.small,
      checkboxBorderWidth: globalTokens.stroke.width.thin,
      checkboxBorderRadius: globalTokens.corner.radius.small,
      checkboxSize: 16,
      checkmarkSize: 8,
      spacingLabelAfter: globalTokens.spacing.m,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.spacing.m,
        spacingLabelAfter: 0,
      },
      padding: globalTokens.spacing.s,
      variant: 'bodyStandard',
    },
    large: {
      borderRadius: globalTokens.corner.radius.small,
      checkboxBorderWidth: globalTokens.stroke.width.thin,
      checkboxBorderRadius: globalTokens.corner.radius.small,
      checkboxSize: 20,
      checkmarkSize: 10,
      spacingLabelAfter: globalTokens.spacing.m,
      labelIsBefore: {
        spacingLabelBefore: globalTokens.spacing.m,
        spacingLabelAfter: 0,
      },
      padding: globalTokens.spacing.s,
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
      checkboxBorderRadius: globalTokens.corner.radius.circle,
    },
  } as CheckboxTokens);
