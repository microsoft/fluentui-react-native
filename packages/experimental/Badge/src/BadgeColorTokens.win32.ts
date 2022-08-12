import { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';
import { getFilledColorProps, getOutlineColorProps, getTintColorProps, getGhostColorProps, getWin32Props } from './colorHelper';

export const defaultBadgeColorTokens: TokenSettings<BadgeTokens> = (t: Theme) =>
  ({
    filled: {
      ...getFilledColorProps(
        {
          backgroundColor: t.colors.brandBackgroundStatic,
        },
        t,
        getWin32Props,
      ),
      borderColor: 'transparent',
    },
    outline: {
      ...getOutlineColorProps({ color: t.colors.brandForeground1, colorDark: t.colors.brandForeground1 }, t, getWin32Props),
      backgroundColor: t.colors.transparentBackground,
    },
    tint: {
      ...getTintColorProps(
        {
          backgroundColor: globalTokens.color.brand.tint60,
          color: t.colors.brandForeground1,
          borderColor: t.colors.brandStroke2,
          backgroundColorDark: globalTokens.color.outlook.shade40,
          colorDark: globalTokens.color.brand.tint30,
          borderColorDark: globalTokens.color.outlook.shade40,
        },
        t,
        getWin32Props,
      ),
    },
    ghost: {
      backgroundColor: t.colors.transparentBackground,
      borderColor: t.colors.transparentStroke,
      ...getGhostColorProps(
        {
          color: t.colors.brandForeground1,
          colorDark: t.colors.brandForeground1,
        },
        t,
        getWin32Props,
      ),
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
        ...getOutlineColorProps({ color: t.colors.brandForeground1, colorDark: t.colors.brandForeground1 }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.brand.tint60,
            color: t.colors.brandForeground1,
            borderColor: t.colors.brandStroke2,
            backgroundColorDark: globalTokens.color.outlook.shade40,
            colorDark: globalTokens.color.brand.tint30,
            borderColorDark: globalTokens.color.outlook.shade40,
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: t.colors.brandForeground1,
            colorDark: t.colors.brandForeground1,
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
            color: globalTokens.color.grey[14],
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
            backgroundColor: globalTokens.color.grey[14],
            backgroundColorDark: globalTokens.color.white,
            colorDark: globalTokens.color.grey[14],
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.grey[14], colorDark: globalTokens.color.white }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.grey[38],
            color: t.colors.neutralForegroundOnBrand,
            borderColor: t.colors.transparentBackground,
            backgroundColorDark: globalTokens.color.grey[68],
            colorDark: globalTokens.color.grey[16],
            borderColorDark: globalTokens.color.grey[68],
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.grey[14],
            colorDark: globalTokens.color.white,
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
            backgroundColor: globalTokens.color.grey[92],
            color: globalTokens.color.grey[38],
            backgroundColorDark: t.colors.black,
            colorDark: globalTokens.color.grey[68],
            hcBackground: t.colors.neutralBackground3,
            hcColor: t.colors.brandForeground1,
            hcBorderColor: t.colors.brandForeground1,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps(
          { color: globalTokens.color.grey[92], colorDark: globalTokens.color.grey[68], borderColorDark: globalTokens.color.grey[32] },
          t,
          getWin32Props,
        ),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.grey[94],
            color: globalTokens.color.grey[38],
            borderColor: globalTokens.color.grey[92],
            backgroundColorDark: globalTokens.color.grey[8],
            colorDark: globalTokens.color.grey[68],
            borderColorDark: globalTokens.color.grey[32],
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.grey[92],
            colorDark: globalTokens.color.grey[68],
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
            backgroundColor: t.colors.white,
            color: globalTokens.color.grey[14],
            backgroundColorDark: globalTokens.color.grey[16],
            colorDark: t.colors.neutralForegroundOnBrand,
            hcBackground: t.colors.neutralBackground3,
            hcColor: t.colors.brandForeground1,
            hcBorderColor: t.colors.brandForeground1,
          },
          t,
          getWin32Props,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.white, colorDark: globalTokens.color.white }, t, getWin32Props),
      },
      tint: {
        ...getTintColorProps(
          {
            backgroundColor: globalTokens.color.white,
            color: globalTokens.color.grey[38],
            borderColor: globalTokens.color.grey[88],
            backgroundColorDark: globalTokens.color.grey[29],
            colorDark: globalTokens.color.grey[68],
            borderColorDark: globalTokens.color.grey[32],
          },
          t,
          getWin32Props,
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.white,
            colorDark: globalTokens.color.white,
          },
          t,
          getWin32Props,
        ),
      },
    },
  } as BadgeTokens);
