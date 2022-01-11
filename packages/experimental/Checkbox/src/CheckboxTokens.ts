import { Theme } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from './Checkbox.types';

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    borderRadius: globalTokens.corner.radius.small,
    checkboxBackgroundColor: t.colors.menuBackground,
    checkboxBorderColor: t.colors.menuItemText,
    checkboxBorderRadius: globalTokens.corner.radius.small,
    checkboxBorderWidth: globalTokens.stroke.width.thin,
    checkboxSize: 16,
    checkmarkColor: t.colors.menuItemTextHovered,
    spacingLabelAfter: globalTokens.spacing.m,
    checkmarkOpacity: 0,
    color: t.colors.menuItemText,
    variant: 'bodyStandard',
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
    labelIsBefore: {
      spacingLabelBefore: globalTokens.spacing.m,
      spacingLabelAfter: 0,
    },
  } as CheckboxTokens);
