import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

// https://github.com/microsoft/fluentui-react-native/issues/3782
// The macOS brand ramps from the token package use blue from Fluent V1,
// instead of communication blue. Update the packages to use the newly
// defined Fluent 2 brand ramp.

export const defaultButtonColorTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.neutralBackground2,
    color: t.colors.neutralForeground2,
    borderColor: t.colors.neutralStroke2,
    iconColor: t.colors.neutralForeground2,
    disabled: {
      backgroundColor: t.colors.neutralBackground2,
      color: t.colors.neutralForegroundDisabled,
      borderColor: t.colors.neutralStrokeDisabled,
      iconColor: t.colors.neutralForegroundDisabled,
    },
    hovered: {
      backgroundColor: t.colors.neutralBackground2,
      color: t.colors.neutralForeground2,
      borderColor: t.colors.neutralStroke2,
      iconColor: t.colors.neutralForeground2,
    },
    pressed: {
      backgroundColor: t.colors.neutralBackground2Pressed,
      color: t.colors.neutralForeground2,
      borderColor: t.colors.neutralStroke2,
      iconColor: t.colors.neutralForeground2,
    },
    focused: {
      backgroundColor: t.colors.neutralBackground2,
      color: t.colors.neutralForeground2,
      borderColor: t.colors.neutralStroke2,
      icon: t.colors.neutralForeground2,
    },
    primary: {
      backgroundColor: t.colors.brandBackground,
      color: t.colors.neutralForegroundOnBrand,
      borderColor: t.colors.brandStroke1,
      iconColor: t.colors.neutralForegroundOnBrand,
      disabled: {
        backgroundColor: t.colors.neutralBackgroundDisabled,
        color: t.colors.neutralForegroundDisabled,
        borderColor: t.colors.neutralStrokeDisabled,
        iconColor: t.colors.neutralForegroundDisabled,
      },
      hovered: {
        // https://github.com/microsoft/fluentui-react-native/issues/3780
        // brandBackgroundHover should match brandBackground, but does not. Update
        // `backgroundColor` and `borderColor` here when fixed in design token package.
        backgroundColor: t.colors.brandBackground,
        color: t.colors.neutralForegroundOnBrandHover,
        borderColor: t.colors.brandBackground,
        iconColor: t.colors.neutralForegroundOnBrandHover,
      },
      pressed: {
        backgroundColor: t.colors.brandBackgroundPressed,
        color: t.colors.neutralForegroundOnBrandPressed,
        borderColor: t.colors.brandBackgroundPressed,
        iconColor: t.colors.neutralForegroundOnBrandPressed,
      },
      focused: {
        backgroundColor: t.colors.brandBackground,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.brandBackground,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
    },
    // https://github.com/microsoft/fluentui-react-native/issues/3781
    // Subtle Button should match Titlebar buttons on macOS, which
    // in high contrast keep a border around them. To do so, the alias tokens
    // `subtleBackgroundHover` and `subtleBackgroundPressed` need their high contrast
    // variants updated to be closer to what `transparentStroke` does.
    subtle: {
      backgroundColor: t.colors.subtleBackground,
      color: t.colors.brandForeground1,
      borderColor: t.colors.transparentStroke,
      iconColor: t.colors.brandForeground1,
      disabled: {
        backgroundColor: t.colors.subtleBackground,
        color: t.colors.brandForeground1Disabled,
        borderColor: t.colors.transparentStrokeDisabled,
        iconColor: t.colors.brandForeground1Disabled,
      },
      hovered: {
        backgroundColor: t.colors.subtleBackgroundHover,
        color: t.colors.brandForeground1Hover,
        borderColor: t.colors.subtleBackgroundHover,
        iconColor: t.colors.brandForeground1Hover,
      },
      pressed: {
        backgroundColor: t.colors.subtleBackgroundPressed,
        color: t.colors.brandForeground1Pressed,
        borderColor: t.colors.subtleBackgroundPressed,
        iconColor: t.colors.brandForeground1Pressed,
      },
      focused: {
        backgroundColor: t.colors.subtleBackground,
        color: t.colors.brandForeground1,
        borderColor: t.colors.transparentStroke,
        iconColor: t.colors.brandForeground1,
      },
    },
  } as ButtonTokens);
