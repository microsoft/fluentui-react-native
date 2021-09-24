import { Theme } from '@fluentui-react-native/framework';
import { TokenSettings } from '@fluentui-react-native/use-styling';
import { ButtonTokens } from './Button.types';
import { shadowStyleFromGlobalToken } from './shadowStyle';

export const defaultButtonColorTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.neutralBackground1,
    color: t.colors.neutralForeground1,
    borderColor: t.colors.neutralStroke1,
    iconColor: t.colors.neutralForeground1,
    fab: {
      ...shadowStyleFromGlobalToken(8),
      // coloring same as primary
      backgroundColor: t.colors.brandBackground,
      color: t.colors.neutralForegroundOnBrand,
      borderColor: t.colors.brandBackground,
      iconColor: t.colors.neutralForegroundOnBrand,
      disabled: {
        backgroundColor: t.colors.neutralBackgroundDisabled,
        color: t.colors.neutralForegroundDisabled,
        borderColor: t.colors.neutralStrokeDisabled,
        iconColor: t.colors.neutralForegroundDisabled,
      },
      hovered: {
        backgroundColor: t.colors.brandBackgroundHover,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.brandBackgroundHover,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      pressed: {
        backgroundColor: t.colors.brandBackgroundPressed,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.brandBackgroundPressed,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      focused: {
        backgroundColor: t.colors.brandBackgroundHover,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.strokeFocus2,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
    },
    disabled: {
      backgroundColor: t.colors.neutralBackgroundDisabled,
      color: t.colors.neutralForegroundDisabled,
      borderColor: t.colors.neutralStrokeDisabled,
      iconColor: t.colors.neutralForegroundDisabled,
    },
    hovered: {
      backgroundColor: t.colors.neutralBackground1Hover,
      color: t.colors.neutralForeground1,
      borderColor: t.colors.neutralStroke1Hover,
      iconColor: t.colors.neutralForeground1,
    },
    pressed: {
      backgroundColor: t.colors.neutralBackground1Pressed,
      color: t.colors.neutralForeground1,
      borderColor: t.colors.neutralStroke1Pressed,
      iconColor: t.colors.neutralForeground1,
    },
    focused: {
      backgroundColor: t.colors.neutralBackground1Hover,
      color: t.colors.neutralforeground1,
      borderColor: t.colors.strokeFocus2,
      icon: t.colors.neutralforeground1,
    },
    primary: {
      backgroundColor: t.colors.brandBackground,
      color: t.colors.neutralForegroundOnBrand,
      borderColor: t.colors.brandBackground,
      iconColor: t.colors.neutralForegroundOnBrand,
      disabled: {
        backgroundColor: t.colors.neutralBackgroundDisabled,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.neutralStrokeDisabled,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      hovered: {
        backgroundColor: t.colors.brandBackgroundHover,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.brandBackgroundHover,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      pressed: {
        backgroundColor: t.colors.brandBackgroundPressed,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.brandBackgroundPressed,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      focused: {
        backgroundColor: t.colors.brandBackgroundHover,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.strokeFocus2,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
    },
    subtle: {
      backgroundColor: t.colors.subtleBackground,
      color: t.colors.neutralForeground1,
      borderColor: t.colors.subtleBackground,
      iconColor: t.colors.neutralForeground2,
      disabled: {
        color: t.colors.neutralForegroundDisabled,
        backgroundColor: 'transparent',
        borderColor: 'transparent',
        iconColor: t.colors.neutralForegroundDisabled,
      },
      hovered: {
        backgroundColor: t.colors.subtleBackgroundHover,
        color: t.colors.neutralForeground1,
        borderColor: t.colors.subtleBackgroundHover,
        iconColor: t.colors.neutralForeground2BrandHover,
      },
      pressed: {
        backgroundColor: t.colors.subtleBackgroundPressed,
        color: t.colors.neutralForeground1,
        borderColor: t.colors.subtleBackgroundPressed,
        iconColor: t.colors.neutralForeground2BrandPressed,
      },
      focused: {
        backgroundColor: t.colors.subtleBackground,
        color: t.colors.neutralForeground1,
        borderColor: t.colors.strokeFocus2,
        iconColor: t.colors.neutralForeground2,
      },
    },
  } as ButtonTokens);
