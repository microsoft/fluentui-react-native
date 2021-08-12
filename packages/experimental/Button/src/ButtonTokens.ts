import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from '.';

export const buttonStates: (keyof ButtonTokens)[] = ['fluid', 'primary', 'ghost', 'hovered', 'focused', 'pressed', 'disabled'];

export const defaultButtonTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.buttonBackground,
    color: t.colors.buttonText,
    borderColor: t.colors.buttonBorder,
    iconColor: t.colors.buttonIcon,
    minHeight: 32,
    minWidth: 80,
    borderWidth: 1,
    borderRadius: 2,
    fluid: {
      width: '100%',
    },
    disabled: {
      backgroundColor: t.colors.buttonDisabledBackground,
      color: t.colors.buttonDisabledContent,
      borderColor: t.colors.buttonDisabledBorder,
      iconColor: t.colors.buttonDisabledIcon,
    },
    hovered: {
      backgroundColor: t.colors.buttonHoveredBackground,
      color: t.colors.buttonHoveredContent,
      borderColor: t.colors.buttonHoveredBorder,
      iconColor: t.colors.buttonHoveredIcon,
    },
    pressed: {
      backgroundColor: t.colors.buttonPressedBackground,
      color: t.colors.buttonPressedContent,
      borderColor: t.colors.buttonPressedBorder,
      iconColor: t.colors.buttonPressedIcon,
    },
    focused: {
      backgroundColor: t.colors.buttonFocusedBackground,
      color: t.colors.buttonFocusedContent,
      borderColor: t.colors.buttonFocusedBorder,
      icon: t.colors.buttonFocusedIcon,
    },
    primary: {
      backgroundColor: t.colors.brandedBackground,
      color: t.colors.brandedContent,
      borderColor: t.colors.brandedBorder,
      iconColor: t.colors.brandedIcon,
      disabled: {
        backgroundColor: t.colors.brandedDisabledBackground,
        color: t.colors.brandedDisabledContent,
        borderColor: t.colors.brandedDisabledBorder,
        iconColor: t.colors.brandedDisabledIcon,
      },
      hovered: {
        backgroundColor: t.colors.brandedHoveredBackground,
        color: t.colors.brandedHoveredContent,
        borderColor: t.colors.brandedHoveredBorder,
        iconColor: t.colors.brandedHoveredIcon,
      },
      pressed: {
        backgroundColor: t.colors.brandedPressedBackground,
        color: t.colors.brandedPressedContent,
        borderColor: t.colors.brandedPressedBorder,
        iconColor: t.colors.brandedPressedIcon,
      },
      focused: {
        backgroundColor: t.colors.brandedFocusedBackground,
        color: t.colors.brandedFocusedContent,
        borderColor: t.colors.brandedFocusedBorder,
        iconColor: t.colors.brandedFocusedIcon,
      },
    },
    ghost: {
      backgroundColor: t.colors.ghostBackground,
      color: t.colors.ghostContent,
      borderColor: t.colors.ghostBorder,
      iconColor: t.colors.ghostIcon,
      disabled: {
        color: t.colors.ghostDisabledContent,
        borderColor: t.colors.ghostDisabledBorder,
        backgroundColor: t.colors.ghostDisabledBackground,
        iconColor: t.colors.ghostDisabledIcon,
      },
      hovered: {
        backgroundColor: t.colors.ghostHoveredBackground,
        color: t.colors.ghostHoveredContent,
        borderColor: t.colors.ghostHoveredBorder,
        iconColor: t.colors.ghostHoveredIcon,
      },
      pressed: {
        backgroundColor: t.colors.ghostPressedBackground,
        borderColor: t.colors.ghostPressedBorder,
        color: t.colors.ghostPressedContent,
        icon: t.colors.ghostPressedIcon,
      },
      focused: {
        borderColor: t.colors.ghostFocusedBorder,
        backgroundColor: t.colors.ghostFocusedBackground,
        color: t.colors.ghostFocusedContent,
        icon: t.colors.ghostFocusedIcon,
      },
    },
  } as ButtonTokens);
