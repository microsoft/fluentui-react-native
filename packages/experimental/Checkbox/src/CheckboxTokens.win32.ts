import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { CheckboxTokens } from '.';

export const checkboxStates: (keyof CheckboxTokens)[] = ['boxAtEnd', 'hovered', 'focused', 'pressed', 'checked', 'disabled'];

export const defaultCheckboxTokens: TokenSettings<CheckboxTokens, Theme> = (t: Theme) =>
  ({
    checkboxBorderColor: t.colors.neutralStrokeAccessible,
    color: t.colors.neutralForeground1,
    checkboxBackgroundColor: t.colors.neutralBackground1,
    textBorderColor: 'transparent',
    rootBorderColor: 'transparent',
    checkmarkColor: t.colors.neutralForeground4,
    variant: 'bodyStandard',
    checkmarkOpacity: 0,
    checkboxMarginEnd: 4,
    borderStyle: 'solid',
    borderWidth: globalTokens.stroke.width.thin,
    borderRadius: globalTokens.corner.radius.small,
    marginLeft: 0,
    disabled: {
      checkboxBorderColor: t.colors.neutralStrokeDisabled,
      color: t.colors.neutralForegroundDisabled,
      checkboxBackgroundColor: t.colors.neutralBackgroundDisabled,
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
      rootBorderColor: t.colors.strokeFocus2,
      marginLeft: 1,
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
      borderRadius: globalTokens.corner.radius.medium,
      disabled: {
        checkmarkColor: t.colors.neutralForegroundDisabled,
      },
    },
    boxAtEnd: {
      checkboxMarginEnd: 0,
    },
  } as CheckboxTokens);
