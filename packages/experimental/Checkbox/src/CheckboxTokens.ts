import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from '.';

export const checkboxStates: (keyof CheckboxTokens)[] = ['disabled', 'boxAtEnd', 'hovered', 'focused', 'pressed', 'checked'];

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderColor: t.colors.menuItemText,
    color: t.colors.menuItemText,
    checkboxBackgroundColor: t.colors.menuBackground,
    textBorderColor: 'transparent',
    variant: 'bodyStandard',
    checkmarkVisibility: 0,
    disabled: {
      checkboxBorderColor: t.colors.buttonBorderDisabled,
      color: t.colors.disabledBodyText,
      checkboxBackgroundColor: t.colors.background,
    },
    hovered: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundHovered,
      checkmarkColor: t.colors.menuItemTextHovered,
    },
    focused: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundHovered,
      textBorderColor: t.colors.focusBorder,
      checkmarkColor: t.colors.menuItemTextHovered,
    },
    pressed: {
      checkboxBackgroundColor: t.colors.menuItemBackgroundPressed,
    },
    checked: {
      checkmarkVisibility: 1,
      checkmarkColor: t.colors.menuItemTextHovered,
    },
    boxAtEnd: {
      checkbox: {
        style: {
          marginStart: 4,
          marginEnd: 0,
        },
      },
    },
  } as CheckboxTokens);
