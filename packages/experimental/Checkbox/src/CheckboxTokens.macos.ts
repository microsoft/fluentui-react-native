import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from '.';

export const checkboxStates: (keyof CheckboxTokens)[] = ['disabled', 'boxAtEnd', 'checked'];

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBackgroundColor: 'transparent',
    textBorderColor: 'transparent',
    checkboxBorderColor: t.colors.checkboxBorderColor,
    checkmarkColor: t.colors.checkmarkColor,
    checkmarkVisibility: 0,
    variant: 'bodyStandard',
    checkboxMarginStart: 0,
    checkboxMarginEnd: 5,
    color: t.colors.menuItemText,
    disabled: {
      checkboxBackgroundColor: t.colors.checkboxBackgroundDisabled,
      checkboxVisibility: 0.38,
    },
    checked: {
      checkboxBorderColor: t.colors.checkboxBackground,
      checkboxBackgroundColor: t.colors.checkboxBackground,
      checkmarkVisibility: 1,
    },
    boxAtEnd: {
      checkboxMarginStart: 4,
      checkboxMarginEnd: 0,
    },
  } as CheckboxTokens);
