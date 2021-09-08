import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from '.';

export const checkboxStates: (keyof CheckboxTokens)[] = ['boxAtEnd', 'hovered', 'focused', 'pressed', 'checked', 'disabled'];

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderColor: t.colors.menuItemText,
    color: t.colors.menuItemText,
    checkboxBackgroundColor: t.colors.menuBackground,
    textBorderColor: 'transparent',
    checkmarkColor: t.colors.menuItemTextHovered,
    variant: 'bodyStandard',
    checkboxMarginStart: 0,
    checkboxMarginEnd: 4,
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
    boxAtEnd: {
      checkboxMarginStart: 4,
      checkboxMarginEnd: 0,
    },
  } as CheckboxTokens);
