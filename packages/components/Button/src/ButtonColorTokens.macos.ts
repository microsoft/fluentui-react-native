import type { Theme } from '@fluentui-react-native/framework';
import type { TokenSettings } from '@fluentui-react-native/use-styling';

import type { ButtonTokens } from './Button.types';

// Github #X: We should be using the `hover` tokens for the hover states, but they currently set a
// different color from rest. macOS by default doesn't have many hover states on it's controls. Address
// this discrepancy in the token packages, and then update these definitions as appropriate.

// Github #X2: The macOS brand ramps from the token package use blue from Fluent V1, instead of communication blue.
// Update the packages to use the newly defiened Fluent 2 brand ramp.

export const defaultButtonColorTokens: TokenSettings<ButtonTokens, Theme> = (t: Theme) =>
  ({
    backgroundColor: t.colors.neutralBackground2,
    color: t.colors.neutralForeground2,
    borderColor: t.colors.neutralStroke2,
    iconColor: t.colors.neutralForeground3,
    disabled: {
      backgroundColor: t.colors.neutralBackground2,
      color: t.colors.neutralForegroundDisabled,
      borderColor: t.colors.neutralStrokeDisabled,
      iconColor: t.colors.neutralForeground3,
    },
    hovered: {
      backgroundColor: t.colors.neutralBackground2,
      color: t.colors.neutralForeground2,
      borderColor: t.colors.neutralStroke2,
      iconColor: t.colors.neutralForeground3,
    },
    pressed: {
      backgroundColor: t.colors.neutralBackground2Pressed,
      color: t.colors.neutralForeground2,
      borderColor: t.colors.neutralStroke2,
      iconColor: t.colors.neutralForeground3,
    },
    focused: {
      backgroundColor: t.colors.neutralBackground2,
      color: t.colors.neutralForeground2,
      borderColor: t.colors.neutralStroke2,
      icon: t.colors.neutralForeground3,
    },
    primary: {
      backgroundColor: t.colors.brandBackground,
      color: t.colors.neutralForegroundOnBrand,
      borderColor: t.colors.transparentStroke,
      iconColor: t.colors.neutralForegroundOnBrand,
      disabled: {
        backgroundColor: t.colors.neutralBackgroundDisabled,
        color: t.colors.neutralForegroundDisabled,
        borderColor: t.colors.transparentStroke,
        iconColor: t.colors.neutralForegroundDisabled,
      },
      hovered: {
        backgroundColor: t.colors.brandBackground,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.transparentStroke,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
      pressed: {
        backgroundColor: t.colors.brandBackgroundPressed,
        color: t.colors.neutralForegroundOnBrandPressed,
        borderColor: t.colors.transparentStroke,
        iconColor: t.colors.neutralForegroundOnBrandPressed,
      },
      focused: {
        backgroundColor: t.colors.brandBackground,
        color: t.colors.neutralForegroundOnBrand,
        borderColor: t.colors.transparentStroke,
        iconColor: t.colors.neutralForegroundOnBrand,
      },
    },
    subtle: {
      backgroundColor: t.colors.subtleBackground,
      color: t.colors.brandForeground1,
      borderColor: t.colors.transparentStroke,
      iconColor: t.colors.brandForeground1,
      disabled: {
        color: t.colors.brandForeground1Disabled,
        borderColor: t.colors.transparentStrokeDisabled,
        backgroundColor: t.colors.ghostDisabledBackground,
        iconColor: t.colors.ghostDisabledIcon,
      },
      hovered: {
        backgroundColor: t.colors.subtleBackgroundHover,
        color: t.colors.brandForeground1Hover,
        borderColor: t.colors.transparentStroke,
        iconColor: t.colors.brandForeground1,
      },
      pressed: {
        backgroundColor: t.colors.subtleBackgroundPressed,
        borderColor: t.colors.transparentStroke,
        color: t.colors.brandForeground1Pressed,
        icon: t.colors.brandForeground1Pressed,
      },
      focused: {
        borderColor: t.colors.subtleBackground,
        backgroundColor: t.colors.brandForeground1,
        color: t.colors.transparentStroke,
        icon: t.colors.brandForeground1,
      },
    },
  } as ButtonTokens);
