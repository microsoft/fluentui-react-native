import { Theme, TokenSettings } from '@fluentui-react-native/framework';
import { globalTokens } from '@fluentui-react-native/theme-tokens';
import { BadgeTokens } from './Badge.types';
import { BadgeColors, getHCProps } from './colorHelper';

export const defaultBadgeColorTokens: TokenSettings<BadgeTokens> = (t: Theme) =>
  ({
    filled: {
      ...getFilledColorProps(
        {
          backgroundColor: t.colors.brandBackgroundStatic,
        },
        t,
      ),
      borderColor: 'transparent',
    },
    outline: {
      ...getOutlineColorProps({ color: t.colors.brandForeground1, colorDark: t.colors.brandForeground1 }, t),
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
      ),
    },
    brand: {
      filled: {
        ...getFilledColorProps(
          {
            backgroundColor: t.colors.brandBackgroundStatic,
          },
          t,
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: t.colors.brandForeground1, colorDark: t.colors.brandForeground1 }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: t.colors.brandForeground1,
            colorDark: t.colors.brandForeground1,
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.red.primary, colorDark: globalTokens.color.red.tint20 }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.red.primary,
            colorDark: globalTokens.color.red.tint20,
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.darkOrange.primary, colorDark: globalTokens.color.orange.tint20 }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.darkOrange.primary,
            colorDark: globalTokens.color.orange.tint20,
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.yellow.shade30, colorDark: globalTokens.color.yellow.tint40 }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.yellow.shade30,
            colorDark: globalTokens.color.yellow.tint40,
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.green.primary, colorDark: globalTokens.color.green.tint20 }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.green.primary,
            colorDark: globalTokens.color.green.tint20,
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.grey[14], colorDark: globalTokens.color.white }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.grey[14],
            colorDark: globalTokens.color.white,
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps(
          { color: globalTokens.color.grey[92], colorDark: globalTokens.color.grey[68], borderColorDark: globalTokens.color.grey[32] },
          t,
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.grey[92],
            colorDark: globalTokens.color.grey[68],
          },
          t,
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
        ),
      },
      outline: {
        ...getOutlineColorProps({ color: globalTokens.color.white, colorDark: globalTokens.color.white }, t),
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
        ),
      },
      ghost: {
        ...getGhostColorProps(
          {
            color: globalTokens.color.white,
            colorDark: globalTokens.color.white,
          },
          t,
        ),
      },
    },
  } as BadgeTokens);

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - backgroundColor, color, iconColor
 */
function getFilledColorProps(colors: BadgeColors, theme: Theme) {
  const { backgroundColor, ...restColors } = colors;
  const color = restColors.color || theme.colors.neutralForegroundOnBrand;
  const backgroundColorDark = restColors.backgroundColorDark || backgroundColor;
  const colorDark = restColors.colorDark || color;
  const hcBackground = restColors.hcBackground || theme.colors.neutralBackgroundInverted;
  const hcColor = restColors.hcColor || theme.colors.neutralForegroundInverted;
  const hcBorderColor = restColors.hcBorderColor || theme.colors.neutralForegroundInverted;

  const themeAppearance = theme.name;
  switch (themeAppearance) {
    case 'White':
    case 'Colorful':
    default:
      return {
        backgroundColor: backgroundColor,
        color: color,
        iconColor: color,
      };
    case 'DarkGray':
    case 'Black':
      return {
        backgroundColor: backgroundColorDark,
        color: colorDark,
        iconColor: colorDark,
      };
    case 'HighContrast':
      return getHCProps(theme, {
        hcBackground,
        hcColor,
        hcBorderColor,
      });
  }
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - color, iconColor and borderColor
 */
function getOutlineColorProps(colors: BadgeColors, theme: Theme) {
  const { color, colorDark } = colors;
  const borderColorDark = colors.borderColorDark || colorDark;
  const themeAppearance = theme.name;
  switch (themeAppearance) {
    case 'White':
    case 'Colorful':
    default:
      return {
        color: color,
        iconColor: color,
        borderColor: color,
      };
    case 'DarkGray':
    case 'Black':
      return {
        color: colorDark,
        iconColor: colorDark,
        borderColor: borderColorDark,
      };
    case 'HighContrast':
      return getHCProps(theme);
  }
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - backgroundColor, color, iconColor and borderColor
 */
function getTintColorProps(colors: BadgeColors, theme: Theme) {
  const { backgroundColor, color, borderColor, backgroundColorDark, colorDark, borderColorDark } = colors;

  const themeAppearance = theme.name;
  switch (themeAppearance) {
    case 'White':
    case 'Colorful':
    default:
      return {
        backgroundColor: backgroundColor,
        color: color,
        iconColor: color,
        borderColor: borderColor,
      };
    case 'DarkGray':
    case 'Black':
      return {
        backgroundColor: backgroundColorDark,
        color: colorDark,
        iconColor: colorDark,
        borderColor: borderColorDark,
      };
    case 'HighContrast':
      return getHCProps(theme);
  }
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - color and iconColor
 */
function getGhostColorProps(colors: BadgeColors, theme: Theme) {
  const { color, colorDark } = colors;
  const themeAppearance = theme.name;
  switch (themeAppearance) {
    case 'White':
    case 'Colorful':
    default:
      return {
        color: color,
        iconColor: color,
      };
    case 'DarkGray':
    case 'Black':
      return {
        color: colorDark,
        iconColor: colorDark,
      };
    case 'HighContrast':
      return getHCProps(theme);
  }
}
