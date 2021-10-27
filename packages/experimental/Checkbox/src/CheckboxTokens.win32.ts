import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { CheckboxTokens } from '.';

export const checkboxStates: (keyof CheckboxTokens)[] = ['boxAtEnd', 'hovered', 'focused', 'pressed', 'checked', 'disabled'];

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground1,
    checkboxBackgroundColor: t.colors.neutralBackground1,
    textBorderColor: 'transparent',
    checkmarkColor: t.colors.neutralForeground4,
    variant: 'bodyStandard',
    checkmarkOpacity: 0,
    checkboxMarginStart: 0,
    checkboxMarginEnd: 4,
    borderStyle: 'solid',
    borderWidth: 1,
    borderRadius: 2,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled,
      checkboxBackgroundColor: t.colors.neutralBackgroundDisabled,
      checkmarkColor: t.colors.neutralForegroundDisabled,
    },
    hovered: {
      checkboxBackgroundColor: t.colors.neutralBackground1,
      checkboxBorderColor: t.colors.neutralStrokeAccessibleHover,
      checkmarkOpacity: 1,
      checked: {
        checkboxBackgroundColor: t.colors.brandBackgroundHover,
        checkboxBorderColor: t.colors.brandBackgroundHover,
      },
    },
    focused: {
      textBorderColor: t.colors.strokeFocus2,
    },
    pressed: {
      checkboxBackgroundColor: t.colors.neutralBackground1,
      checkboxBorderColor: t.colors.neutralStrokeAccessiblePressed,
      checkmarkColor: t.colors.neutralForeground1,
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
      borderRadius: 4,
    },
    boxAtEnd: {
      checkboxMarginStart: 4,
      checkboxMarginEnd: 0,
    },
  } as CheckboxTokens);
