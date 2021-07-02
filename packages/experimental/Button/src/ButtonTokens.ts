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
      backgroundColor: t.colors.brandBackground,
      color: t.colors.brandContent,
      borderColor: t.colors.brandBorder,
      iconColor: t.colors.brandIcon,
      disabled: {
        backgroundColor: t.colors.brandDisabledBackground,
        color: t.colors.brandDisabledContent,
        borderColor: t.colors.brandDisabledBorder,
        iconColor: t.colors.brandDisabledIcon,
      },
      hovered: {
        backgroundColor: t.colors.brandHoveredBackground,
        color: t.colors.brandHoveredContent,
        borderColor: t.colors.brandHoveredBorder,
        iconColor: t.colors.brandHoveredIcon,
      },
      pressed: {
        backgroundColor: t.colors.brandPressedBackground,
        color: t.colors.brandPressedContent,
        borderColor: t.colors.brandPressedBorder,
        iconColor: t.colors.brandPressedIcon,
      },
      focused: {
        backgroundColor: t.colors.brandFocusedBackground,
        color: t.colors.brandFocusedContent,
        borderColor: t.colors.brandFocusedBorder,
        iconColor: t.colors.brandFocusedIcon,
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
