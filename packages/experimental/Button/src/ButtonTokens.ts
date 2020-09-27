import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from '.';

export const buttonStates: (keyof ButtonTokens)[] = ['fluid', 'primary', 'ghost', 'hovered', 'focused', 'pressed', 'disabled'];

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) => ({
  backgroundColor: t.colors.buttonBackground,
  color: t.colors.buttonText,
  borderColor: t.colors.buttonBorder,
  borderWidth: 1,
  borderRadius: 2,
  fluid: {
    width: '100%',
  },
  disabled: {
    backgroundColor: t.colors.buttonBackgroundDisabled,
    color: t.colors.buttonTextDisabled,
    borderColor: t.colors.buttonBorderDisabled,
  },
  hovered: {
    backgroundColor: t.colors.buttonBackgroundHovered,
    color: t.colors.buttonTextHovered,
    borderColor: t.colors.buttonBorderHovered,
  },
  pressed: {
    backgroundColor: t.colors.buttonBackgroundPressed,
    color: t.colors.buttonTextPressed,
    borderColor: t.colors.buttonBorderPressed,
  },
  focused: {
    borderColor: t.colors.buttonBorderFocused,
    color: t.colors.buttonTextHovered,
  },
  primary: {
    backgroundColor: t.colors.primaryButtonBackground,
    color: t.colors.primaryButtonText,
    borderColor: t.colors.primaryButtonBorder,
    disabled: {
      backgroundColor: t.colors.primaryButtonBackgroundDisabled,
      color: t.colors.primaryButtonTextDisabled,
      borderColor: t.colors.primaryButtonBackgroundDisabled,
    },
    hovered: {
      backgroundColor: t.colors.primaryButtonBackgroundHovered,
      color: t.colors.primaryButtonTextHovered,
      borderColor: t.colors.primaryButtonBorderHovered,
    },
    pressed: {
      backgroundColor: t.colors.primaryButtonBackgroundPressed,
      color: t.colors.primaryButtonTextPressed,
      borderColor: t.colors.primaryButtonBorderPressed,
    },
    focused: {
      borderColor: t.colors.primaryButtonBorderFocused,
      backgroundColor: t.colors.primaryButtonBackgroundHovered,
      color: t.colors.primaryButtonTextHovered,
    },
  },
  ghost: {
    backgroundColor: t.colors.menuBackground,
    color: t.colors.menuItemText,
    borderColor: t.colors.menuBackground,
    disabled: {
      color: t.colors.disabledBodyText,
      borderColor: t.colors.menuBackground,
      backgroundColor: t.colors.background,
    },
    hovered: {
      backgroundColor: t.colors.menuItemBackgroundHovered,
      color: t.colors.menuItemTextHovered,
      borderColor: t.colors.menuItemBackgroundHovered,
    },
    pressed: {
      backgroundColor: t.colors.menuItemBackgroundPressed,
      borderColor: t.colors.menuItemBackgroundPressed,
    },
    focused: {
      borderColor: t.colors.focusBorder,
      backgroundColor: t.colors.menuItemBackgroundHovered,
      color: t.colors.menuItemTextHovered,
    },
  },
});
