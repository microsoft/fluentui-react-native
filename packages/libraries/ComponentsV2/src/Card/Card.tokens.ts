import type { ColorValue, ViewStyle } from 'react-native';

import type { CardAppearance, CardSize } from './Card.types';

export interface CardSizeTokens {
  borderRadius: number;
  padding: number;
}

export interface CardColors {
  backgroundColor: ColorValue;
  borderColor: ColorValue;
}

interface CardThemeColors {
  neutralBackground1?: ColorValue;
  neutralBackground1Hover?: ColorValue;
  neutralBackground1Pressed?: ColorValue;
  neutralBackground1Selected?: ColorValue;
  neutralBackground2?: ColorValue;
  neutralBackground2Hover?: ColorValue;
  neutralBackground2Pressed?: ColorValue;
  neutralBackground2Selected?: ColorValue;
  neutralBackgroundDisabled?: ColorValue;
  neutralStroke1?: ColorValue;
  neutralStroke1Selected?: ColorValue;
  neutralStrokeDisabled?: ColorValue;
  subtleBackground?: ColorValue;
  subtleBackgroundHover?: ColorValue;
  subtleBackgroundPressed?: ColorValue;
  subtleBackgroundSelected?: ColorValue;
  transparentBackground?: ColorValue;
  transparentBackgroundHover?: ColorValue;
  transparentBackgroundPressed?: ColorValue;
  transparentBackgroundSelected?: ColorValue;
  transparentStroke?: ColorValue;
}

export const cardSizeTokens: Readonly<Record<CardSize, CardSizeTokens>> = {
  small: { borderRadius: 2, padding: 8 },
  medium: { borderRadius: 4, padding: 12 },
  large: { borderRadius: 6, padding: 16 },
};

export const cardShadow4: ViewStyle = {
  elevation: 4,
  shadowColor: '#000000',
  shadowOffset: { height: 1, width: 0 },
  shadowOpacity: 0.14,
  shadowRadius: 2,
};

export const cardShadow8: ViewStyle = {
  elevation: 8,
  shadowColor: '#000000',
  shadowOffset: { height: 3, width: 0 },
  shadowOpacity: 0.2,
  shadowRadius: 6,
};

export const cardShadow2: ViewStyle = {
  elevation: 2,
  shadowColor: '#000000',
  shadowOffset: { height: 1, width: 0 },
  shadowOpacity: 0.1,
  shadowRadius: 1,
};

function themeColor(
  theme: { colors: CardThemeColors },
  name: string,
  fallback: ColorValue,
): ColorValue {
  return theme.colors[name as keyof CardThemeColors] ?? fallback;
}

export function getCardColors(
  theme: { colors: CardThemeColors },
  appearance: CardAppearance,
  state: { disabled: boolean; hovered: boolean; pressed: boolean; selected: boolean },
): CardColors {
  if (state.disabled) {
    return {
      backgroundColor: themeColor(theme, 'neutralBackgroundDisabled', '#f0f0f0'),
      borderColor: themeColor(theme, 'neutralStrokeDisabled', '#d1d1d1'),
    };
  }

  const appearanceTokens = {
    filled: {
      base: 'neutralBackground1',
      fallback: '#ffffff',
      hover: 'neutralBackground1Hover',
      pressed: 'neutralBackground1Pressed',
      selected: 'neutralBackground1Selected',
    },
    'filled-alternative': {
      base: 'neutralBackground2',
      fallback: '#f5f5f5',
      hover: 'neutralBackground2Hover',
      pressed: 'neutralBackground2Pressed',
      selected: 'neutralBackground2Selected',
    },
    outline: {
      base: 'transparentBackground',
      fallback: 'transparent',
      hover: 'transparentBackgroundHover',
      pressed: 'transparentBackgroundPressed',
      selected: 'transparentBackgroundSelected',
    },
    subtle: {
      base: 'subtleBackground',
      fallback: 'transparent',
      hover: 'subtleBackgroundHover',
      pressed: 'subtleBackgroundPressed',
      selected: 'subtleBackgroundSelected',
    },
  }[appearance];

  const backgroundName = state.selected
    ? appearanceTokens.selected
    : state.pressed
      ? appearanceTokens.pressed
      : state.hovered
        ? appearanceTokens.hover
        : appearanceTokens.base;
  const hasVisibleDefaultBorder = appearance === 'outline';

  return {
    backgroundColor: themeColor(theme, backgroundName, themeColor(theme, appearanceTokens.base, appearanceTokens.fallback)),
    borderColor: state.selected
      ? themeColor(theme, 'neutralStroke1Selected', '#0f6cbd')
      : hasVisibleDefaultBorder
        ? themeColor(theme, 'neutralStroke1', '#d1d1d1')
        : themeColor(theme, 'transparentStroke', 'transparent'),
  };
}
