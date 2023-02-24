import type { ColorValue } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';

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
      backgroundColor: hcBackground,
      color: hcColor,
      iconColor: hcColor,
      borderColor: theme.colors.transparentStroke,
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
  const { color } = colors;
  const borderColor = colors.borderColor || color;
  const colorDark = colors.colorDark || color;
  const borderColorDark = colors.borderColorDark || borderColor || colorDark;
  const getThemeProps = getProps || getDefaultProps;
  return getThemeProps(theme, {
    light: {
      color: color,
      iconColor: color,
      borderColor: borderColor,
    },
    dark: {
      color: colorDark,
      iconColor: colorDark,
      borderColor: borderColorDark,
    },
    hc: {
      color: theme.colors.neutralForeground3,
      iconColor: theme.colors.neutralForeground3,
      borderColor: theme.colors.transparentStroke,
    },
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
  const { backgroundColor, color, borderColor } = colors;
  const backgroundColorDark = colors.backgroundColorDark || backgroundColor;
  const colorDark = colors.colorDark || color;
  const borderColorDark = colors.borderColorDark || borderColor;
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
    hc: {
      backgroundColor: theme.colors.transparentBackground,
      color: theme.colors.neutralForeground3,
      iconColor: theme.colors.neutralForeground3,
      borderColor: theme.colors.transparentStroke,
    },
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
  const { color } = colors;
  const colorDark = colors.colorDark || color;
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
    hc: {
      color: theme.colors.neutralForeground3,
      iconColor: theme.colors.neutralForeground3,
    },
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
      return {
        ...themeProps.hc,
      };
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
      return {
        ...themeProps.hc,
      };
  }
}
