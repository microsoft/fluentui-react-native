import { ColorValue } from 'react-native';
import { Theme } from '@fluentui-react-native/framework';

export type BadgeColors = {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  iconColor?: ColorValue;
  borderColor?: ColorValue;
  backgroundColorDark?: ColorValue;
  colorDark?: ColorValue;
  borderColorDark?: ColorValue;
  hcBackground?: ColorValue;
  hcColor?: ColorValue;
  hcBorderColor?: ColorValue;
};

type ColorProps = {
  backgroundColor?: ColorValue;
  color?: ColorValue;
  iconColor?: ColorValue;
  borderColor?: ColorValue;
  hcBackground?: ColorValue;
  hcColor?: ColorValue;
  hcBorderColor?: ColorValue;
};

type ThemeProps = {
  light?: ColorProps;
  dark?: ColorProps;
  hc?: ColorProps;
};

export function getHCProps(theme: Theme, colors?: BadgeColors) {
  const hcColors = colors || {};
  const hcBackground = hcColors.hcBackground || theme.colors.transparentBackground;
  const hcColor = hcColors.hcColor || theme.colors.neutralForeground3;
  const hcBorderColor = hcColors.hcBorderColor || theme.colors.neutralForeground3;

  return {
    backgroundColor: hcBackground,
    color: hcColor,
    iconColor: hcColor,
    borderColor: hcBorderColor,
  };
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - backgroundColor, color, iconColor
 */
export function getFilledColorProps(
  colors: BadgeColors,
  theme: Theme,
  getProps?: (theme: Theme, themeProps: ThemeProps) => Record<string, unknown>,
) {
  const { backgroundColor, ...restColors } = colors;
  const color = restColors.color || theme.colors.neutralForegroundOnBrand;
  const backgroundColorDark = restColors.backgroundColorDark || backgroundColor;
  const colorDark = restColors.colorDark || color;
  const hcBackground = restColors.hcBackground || theme.colors.neutralBackgroundInverted;
  const hcColor = restColors.hcColor || theme.colors.neutralForegroundInverted;
  const hcBorderColor = restColors.hcBorderColor || theme.colors.transparentStroke;
  const getThemeProps = getProps || getDefaultProps;

  return getThemeProps(theme, {
    light: {
      backgroundColor: backgroundColor,
      color: color,
      iconColor: color,
    },
    dark: {
      backgroundColor: backgroundColorDark,
      color: colorDark,
      iconColor: colorDark,
    },
    hc: {
      hcBackground,
      hcColor,
      hcBorderColor,
    },
  });
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - color, iconColor and borderColor
 */
export function getOutlineColorProps(
  colors: BadgeColors,
  theme: Theme,
  getProps?: (theme: Theme, themeProps: ThemeProps) => Record<string, unknown>,
) {
  const { color, colorDark } = colors;
  const borderColorDark = colors.borderColorDark || colorDark;
  const getThemeProps = getProps || getDefaultProps;
  return getThemeProps(theme, {
    light: {
      color: color,
      iconColor: color,
      borderColor: color,
    },
    dark: {
      color: colorDark,
      iconColor: colorDark,
      borderColor: borderColorDark,
    },
    hc: getHCProps(theme),
  });
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - backgroundColor, color, iconColor and borderColor
 */
export function getTintColorProps(
  colors: BadgeColors,
  theme: Theme,
  getProps?: (theme: Theme, themeProps: ThemeProps) => Record<string, unknown>,
) {
  const { backgroundColor, color, borderColor, backgroundColorDark, colorDark, borderColorDark } = colors;
  const getThemeProps = getProps || getDefaultProps;
  return getThemeProps(theme, {
    light: {
      backgroundColor: backgroundColor,
      color: color,
      iconColor: color,
      borderColor: borderColor,
    },
    dark: {
      backgroundColor: backgroundColorDark,
      color: colorDark,
      iconColor: colorDark,
      borderColor: borderColorDark,
    },
    hc: getHCProps(theme),
  });
}

/**
 * A function which returns object of props depending on colors and theme.
 * @param colors object
 * @param theme
 * @returns object of props - color and iconColor
 */
export function getGhostColorProps(
  colors: BadgeColors,
  theme: Theme,
  getProps?: (theme: Theme, themeProps: ThemeProps) => Record<string, unknown>,
) {
  const { color, colorDark } = colors;
  const getThemeProps = getProps || getDefaultProps;
  return getThemeProps(theme, {
    light: {
      color: color,
      iconColor: color,
    },
    dark: {
      color: colorDark,
      iconColor: colorDark,
    },
    hc: getHCProps(theme),
  });
}

export function getWin32Props(theme: Theme, themeProps: ThemeProps) {
  const themeAppearance = theme.name;
  switch (themeAppearance) {
    case 'White':
    case 'Colorful':
    default:
      return {
        ...themeProps.light,
      };
    case 'DarkGray':
    case 'Black':
      return {
        ...themeProps.dark,
      };
    case 'HighContrast':
      return getHCProps(theme, {
        ...themeProps.hc,
      });
  }
}

export function getDefaultProps(theme: Theme, themeProps: ThemeProps) {
  const themeAppearance = theme.host.appearance;
  switch (themeAppearance) {
    case 'light':
    default:
      return {
        ...themeProps.light,
      };
    case 'dark':
      return {
        ...themeProps.dark,
      };
    case 'highContrast':
      return getHCProps(theme, {
        ...themeProps.hc,
      });
  }
}
