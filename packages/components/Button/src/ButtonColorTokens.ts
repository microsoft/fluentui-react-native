import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';

export const defaultButtonColorTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.buttonBackground,
    color: t.colors.buttonText,
    borderColor: t.colors.buttonBorder,
    iconColor: t.colors.buttonIcon,
    disabled: {
      backgroundColor: t.colors.defaultDisabledBackground,
      color: t.colors.defaultDisabledContent,
      borderColor: t.colors.defaultDisabledBorder,
      iconColor: t.colors.defaultDisabledIcon,
    },
    hovered: {
      backgroundColor: t.colors.defaultHoveredBackground,
      color: t.colors.defaultHoveredContent,
      borderColor: t.colors.defaultHoveredBorder,
      iconColor: t.colors.defaultHoveredIcon,
    },
    pressed: {
      backgroundColor: t.colors.defaultPressedBackground,
      color: t.colors.defaultPressedContent,
      borderColor: t.colors.defaultPressedBorder,
      iconColor: t.colors.defaultPressedIcon,
    },
    focused: {
      backgroundColor: t.colors.defaultFocusedBackground,
      color: t.colors.defaultFocusedContent,
      borderColor: t.colors.defaultFocusedBorder,
      icon: t.colors.defaultFocusedIcon,
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
    subtle: {
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
