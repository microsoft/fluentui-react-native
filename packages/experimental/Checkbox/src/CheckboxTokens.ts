import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from '.';

export const checkboxStates: (keyof CheckboxTokens)[] = ['labelIsBefore', 'hovered', 'focused', 'pressed', 'checked', 'disabled'];

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderColor: t.colors.menuItemText,
    color: t.colors.menuItemText,
    checkboxBackgroundColor: t.colors.menuBackground,
    textBorderColor: 'transparent',
    checkmarkColor: t.colors.menuItemTextHovered,
    variant: 'bodyStandard',
    checkmarkOpacity: 0,
    checkboxMarginStart: 0,
    checkboxMarginEnd: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 2,
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
      textBorderColor: t.colors.focusBorder,
    },
    pressed: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundPressed,
    },
    checked: {
      checkmarkOpacity: 1,
    },
    labelIsBefore: {
      checkboxMarginStart: 4,
      checkboxMarginEnd: 0,
    },
  } as CheckboxTokens);
