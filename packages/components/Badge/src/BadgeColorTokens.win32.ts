import { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';
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
            backgroundColor: globalTokens.color.red.primary,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.red.primary, colorDark: globalTokens.color.red.tint20 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.red.tint60,
            color: globalTokens.color.red.primary,
            borderColor: globalTokens.color.red.tint40,
            backgroundColorDark: globalTokens.color.red.shade40,
            colorDark: globalTokens.color.red.tint30,
            borderColorDark: globalTokens.color.red.shade30,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.red.primary,
            colorDark: globalTokens.color.red.tint20,
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
            backgroundColor: globalTokens.color.darkOrange.primary,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps(
          { color: globalTokens.color.darkOrange.primary, colorDark: globalTokens.color.orange.tint20 },
          t,
          getWin32Props,
        ),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.darkOrange.tint60,
            color: globalTokens.color.office.shade10,
            borderColor: globalTokens.color.office.tint50,
            backgroundColorDark: globalTokens.color.orange.shade40,
            colorDark: globalTokens.color.office.tint40,
            borderColorDark: globalTokens.color.office.shade40,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.darkOrange.primary,
            colorDark: globalTokens.color.orange.tint20,
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
            backgroundColor: globalTokens.color.yellow.primary,
            color: globalTokens.color.grey14, // It should be neutralForegroundStatic1. It's hardcoded because the token doesn't exist right now
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps(
          { color: globalTokens.color.yellow.shade30, colorDark: globalTokens.color.yellow.tint40 },
          t,
          getWin32Props,
        ),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.yellow.tint60,
            color: globalTokens.color.yellow.shade30,
            borderColor: globalTokens.color.yellow.tint40,
            backgroundColorDark: globalTokens.color.yellow.shade40,
            colorDark: globalTokens.color.yellow.tint40,
            borderColorDark: globalTokens.color.yellow.shade30,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.yellow.shade30,
            colorDark: globalTokens.color.yellow.tint40,
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
            backgroundColor: globalTokens.color.green.primary,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.green.primary, colorDark: globalTokens.color.green.tint20 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.green.tint60,
            color: globalTokens.color.green.primary,
            borderColor: globalTokens.color.green.tint40,
            backgroundColorDark: globalTokens.color.green.shade40,
            colorDark: globalTokens.color.green.tint30,
            borderColorDark: globalTokens.color.green.shade30,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.green.primary,
            colorDark: globalTokens.color.green.tint20,
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
            backgroundColorDark: globalTokens.color.grey68,
            colorDark: globalTokens.color.grey16,
            borderColorDark: globalTokens.color.grey68,
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
  } as BadgeTokens);
