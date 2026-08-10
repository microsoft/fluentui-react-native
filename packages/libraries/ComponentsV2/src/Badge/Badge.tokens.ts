import type { ColorValue } from 'react-native';

import type { useFluentTheme } from '@fluentui-react-native/framework';

import type { BadgeAppearance, BadgeColor, BadgeSize } from './Badge.types';

export interface BadgeSizeTokens {
  fontSize: number;
  height: number;
  iconSize: number;
  lineHeight: number;
  paddingHorizontal: number;
  roundedRadius: number;
  textGap: number;
}

export interface BadgeColorTokens {
  backgroundColor: ColorValue;
  borderColor: ColorValue;
  foregroundColor: ColorValue;
}

export const badgeSizeTokens: Readonly<Record<BadgeSize, BadgeSizeTokens>> = {
  tiny: { fontSize: 4, height: 6, iconSize: 6, lineHeight: 4, paddingHorizontal: 0, roundedRadius: 2, textGap: 0 },
  'extra-small': { fontSize: 6, height: 10, iconSize: 10, lineHeight: 6, paddingHorizontal: 0, roundedRadius: 2, textGap: 0 },
  small: { fontSize: 10, height: 16, iconSize: 12, lineHeight: 12, paddingHorizontal: 4, roundedRadius: 2, textGap: 4 },
  medium: { fontSize: 12, height: 20, iconSize: 12, lineHeight: 16, paddingHorizontal: 6, roundedRadius: 4, textGap: 4 },
  large: { fontSize: 14, height: 24, iconSize: 16, lineHeight: 20, paddingHorizontal: 6, roundedRadius: 4, textGap: 4 },
  'extra-large': { fontSize: 14, height: 32, iconSize: 20, lineHeight: 20, paddingHorizontal: 8, roundedRadius: 4, textGap: 6 },
};

type FluentTheme = ReturnType<typeof useFluentTheme>;

const palette = {
  darkOrangeBackground1: '#fdf3e7',
  darkOrangeBackground3: '#da3b01',
  darkOrangeBorder1: '#f4bfab',
  darkOrangeForeground1: '#a23e00',
  darkOrangeForeground3: '#da3b01',
  greenBackground1: '#f1faf1',
  greenBackground3: '#107c10',
  greenBorder1: '#9fd89f',
  greenBorder2: '#54b054',
  greenForeground1: '#0e700e',
  greenForeground3: '#107c10',
  redBackground1: '#fdf3f4',
  redBackground3: '#c50f1f',
  redBorder1: '#f1bbbc',
  redBorder2: '#dc626d',
  redForeground1: '#b10e1c',
  redForeground3: '#c50f1f',
  yellowBackground1: '#fffef5',
  yellowBackground3: '#fde300',
  yellowBorder1: '#f8e359',
  yellowForeground1: '#817400',
  yellowForeground2: '#817400',
  neutralForeground1Static: '#242424',
} as const;

export function resolveBadgeColorTokens(
  theme: FluentTheme,
  appearance: BadgeAppearance,
  color: BadgeColor,
): BadgeColorTokens {
  const transparent = theme.colors.transparentBackground;
  const semantic = {
    brand: {
      filled: [theme.colors.brandBackgroundStatic, theme.colors.neutralForegroundOnBrand, theme.colors.transparentStroke],
      ghost: [transparent, theme.colors.brandForeground1, theme.colors.transparentStroke],
      outline: [transparent, theme.colors.brandForeground1, theme.colors.brandForeground1],
      tint: [theme.colors.brandBackground2, theme.colors.brandForeground2, theme.colors.brandStroke2],
    },
    danger: {
      filled: [palette.redBackground3, theme.colors.neutralForegroundOnBrand, theme.colors.transparentStroke],
      ghost: [transparent, palette.redForeground3, theme.colors.transparentStroke],
      outline: [transparent, palette.redForeground3, palette.redBorder2],
      tint: [palette.redBackground1, palette.redForeground1, palette.redBorder1],
    },
    important: {
      filled: [theme.colors.neutralForeground1, theme.colors.neutralBackground1, theme.colors.transparentStroke],
      ghost: [transparent, theme.colors.neutralForeground1, theme.colors.transparentStroke],
      outline: [transparent, theme.colors.neutralForeground3, theme.colors.neutralStrokeAccessible],
      tint: [theme.colors.neutralForeground3, theme.colors.neutralBackground1, theme.colors.transparentStroke],
    },
    informative: {
      filled: [theme.colors.neutralBackground5, theme.colors.neutralForeground3, theme.colors.transparentStroke],
      ghost: [transparent, theme.colors.neutralForeground3, theme.colors.transparentStroke],
      outline: [transparent, theme.colors.neutralForeground3, theme.colors.neutralStroke2],
      tint: [theme.colors.neutralBackground4, theme.colors.neutralForeground3, theme.colors.neutralStroke2],
    },
    severe: {
      filled: [palette.darkOrangeBackground3, theme.colors.neutralForegroundOnBrand, theme.colors.transparentStroke],
      ghost: [transparent, palette.darkOrangeForeground3, theme.colors.transparentStroke],
      outline: [transparent, palette.darkOrangeForeground3, palette.darkOrangeForeground3],
      tint: [palette.darkOrangeBackground1, palette.darkOrangeForeground1, palette.darkOrangeBorder1],
    },
    subtle: {
      filled: [theme.colors.neutralBackground1, theme.colors.neutralForeground1, theme.colors.transparentStroke],
      ghost: [transparent, theme.colors.neutralForegroundOnBrand, theme.colors.transparentStroke],
      outline: [transparent, theme.colors.neutralForegroundOnBrand, theme.colors.neutralForegroundOnBrand],
      tint: [theme.colors.neutralBackground1, theme.colors.neutralForeground3, theme.colors.neutralStroke2],
    },
    success: {
      filled: [palette.greenBackground3, theme.colors.neutralForegroundOnBrand, theme.colors.transparentStroke],
      ghost: [transparent, palette.greenForeground3, theme.colors.transparentStroke],
      outline: [transparent, palette.greenForeground3, palette.greenBorder2],
      tint: [palette.greenBackground1, palette.greenForeground1, palette.greenBorder1],
    },
    warning: {
      filled: [palette.yellowBackground3, palette.neutralForeground1Static, theme.colors.transparentStroke],
      ghost: [transparent, palette.yellowForeground2, theme.colors.transparentStroke],
      outline: [transparent, palette.yellowForeground2, palette.yellowForeground2],
      tint: [palette.yellowBackground1, palette.yellowForeground1, palette.yellowBorder1],
    },
  } as const;
  const [backgroundColor, foregroundColor, borderColor] = semantic[color][appearance];
  return {
    backgroundColor: backgroundColor ?? 'transparent',
    borderColor: borderColor ?? 'transparent',
    foregroundColor: foregroundColor ?? '#242424',
  };
}
