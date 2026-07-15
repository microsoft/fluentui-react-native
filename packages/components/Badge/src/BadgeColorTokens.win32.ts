import type { Theme, TokenSettings } from '@fluentui-react-native/framework';
import {
  colorDarkOrangePrimary,
  colorDarkOrangeTint30,
  colorDarkOrangeTint60,
  colorGreenPrimary,
  colorGreenShade30,
  colorGreenShade40,
  colorGreenTint30,
  colorGreenTint40,
  colorGreenTint60,
  colorGrey14,
  colorGrey16,
  colorGrey68,
  colorOfficeShade10,
  colorOfficeShade40,
  colorOfficeTint40,
  colorOfficeTint50,
  colorOrangeShade40,
  colorRedPrimary,
  colorRedShade30,
  colorRedShade40,
  colorRedTint30,
  colorRedTint40,
  colorRedTint60,
  colorYellowPrimary,
  colorYellowShade30,
  colorYellowShade40,
  colorYellowTint40,
  colorYellowTint60,
} from '@fluentui-react-native/design/tokens/global';

import type { BadgeTokens } from './Badge.types';
import { getFilledColorProps, getOutlineColorProps, getTintColorProps, getGhostColorProps, getWin32Props } from './colorHelper';

export const defaultBadgeColorTokens: TokenSettings<BadgeTokens> = (t: Theme) =>
  ({
    color: t.colors.neutralForegroundOnBrand,
    backgroundColor: t.colors.brandBackgroundStatic,
    borderColor: t.colors.transparentStroke,
    filled: {
      borderColor: t.colors.transparentStroke,
    },
    outline: {
      backgroundColor: t.colors.transparentBackground,
    },
    ghost: {
      backgroundColor: t.colors.transparentBackground,
      borderColor: t.colors.transparentStroke,
    },
    brand: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: t.colors.brandBackgroundStatic,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: t.colors.brandForeground1 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: t.colors.brandBackground2,
            color: t.colors.brandForeground2,
            borderColor: t.colors.brandStroke2,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: t.colors.brandForeground1,
          },
          t,
          getWin32Props,
        ),
      },
    },
    danger: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: colorRedPrimary,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: colorRedPrimary, colorDark: colorRedTint30 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: colorRedTint60,
            color: colorRedPrimary,
            borderColor: colorRedTint40,
            backgroundColorDark: colorRedShade40,
            colorDark: colorRedTint30,
            borderColorDark: colorRedShade30,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: colorRedPrimary,
            colorDark: colorRedTint30,
          },
          t,
          getWin32Props,
        ),
      },
    },
    severe: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: colorDarkOrangePrimary,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: colorDarkOrangePrimary, colorDark: colorDarkOrangeTint30 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: colorDarkOrangeTint60,
            color: colorOfficeShade10,
            borderColor: colorOfficeTint50,
            backgroundColorDark: colorOrangeShade40,
            colorDark: colorOfficeTint40,
            borderColorDark: colorOfficeShade40,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: colorDarkOrangePrimary,
            colorDark: colorDarkOrangeTint30,
          },
          t,
          getWin32Props,
        ),
      },
    },
    warning: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: colorYellowPrimary,
            color: colorGrey14, // It should be neutralForegroundStatic1. It's hardcoded because the token doesn't exist right now
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: colorYellowShade30, colorDark: colorYellowTint40 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: colorYellowTint60,
            color: colorYellowShade30,
            borderColor: colorYellowTint40,
            backgroundColorDark: colorYellowShade40,
            colorDark: colorYellowTint40,
            borderColorDark: colorYellowShade30,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: colorYellowShade30,
            colorDark: colorYellowTint40,
          },
          t,
          getWin32Props,
        ),
      },
    },
    success: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: colorGreenPrimary,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: colorGreenPrimary, colorDark: colorGreenTint40 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: colorGreenTint60,
            color: colorGreenPrimary,
            borderColor: colorGreenTint40,
            backgroundColorDark: colorGreenShade40,
            colorDark: colorGreenTint30,
            borderColorDark: colorGreenShade30,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: colorGreenPrimary,
            colorDark: colorGreenTint40,
          },
          t,
          getWin32Props,
        ),
      },
    },
    important: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: t.colors.neutralForeground1,
            color: t.colors.neutralBackground1,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: t.colors.neutralForeground3, borderColor: t.colors.neutralStrokeAccessible }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: t.colors.neutralForeground3,
            color: t.colors.neutralBackground1,
            borderColor: t.colors.neutralStrokeAccessible,
            backgroundColorDark: colorGrey68,
            colorDark: colorGrey16,
            borderColorDark: colorGrey68,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: t.colors.neutralForeground1,
          },
          t,
          getWin32Props,
        ),
      },
    },
    informative: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: t.colors.neutralBackground5,
            color: t.colors.neutralForeground3,
            hcBackground: t.colors.neutralBackground3,
            hcColor: t.colors.brandForeground1,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: t.colors.neutralForeground3, borderColor: t.colors.neutralStroke2 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: t.colors.neutralBackground4,
            color: t.colors.neutralForeground3,
            borderColor: t.colors.neutralStroke2,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: t.colors.neutralForeground3,
          },
          t,
          getWin32Props,
        ),
      },
    },
    subtle: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: t.colors.neutralBackground1,
            color: t.colors.neutralForeground1,
            hcBackground: t.colors.neutralBackground3,
            hcColor: t.colors.brandForeground1,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: t.colors.neutralForegroundOnBrand }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: t.colors.neutralBackground1,
            color: t.colors.neutralForeground3,
            borderColor: t.colors.neutralStroke2,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: t.colors.neutralForegroundOnBrand,
          },
          t,
          getWin32Props,
        ),
      },
    },
  }) as BadgeTokens;
