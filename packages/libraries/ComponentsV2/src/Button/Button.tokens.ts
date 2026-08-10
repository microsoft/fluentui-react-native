import type { ColorValue } from 'react-native';

import type { Theme } from '@fluentui-react-native/framework';

import type { ButtonAppearance, ButtonShape, ButtonSize } from './Button.types';

export interface ButtonSizeTokens {
  fontSize: number;
  height: number;
  iconSize: number;
  lineHeight: number;
  minWidth: number;
  paddingHorizontal: number;
  paddingVertical: number;
  roundedRadius: number;
}

export interface ButtonColorTokens {
  backgroundColor: ColorValue | undefined;
  borderColor: ColorValue | undefined;
  foregroundColor: ColorValue | undefined;
}

export const buttonSizeTokens: Readonly<Record<ButtonSize, ButtonSizeTokens>> = {
  small: {
    fontSize: 12,
    height: 24,
    iconSize: 20,
    lineHeight: 16,
    minWidth: 64,
    paddingHorizontal: 8,
    paddingVertical: 3,
    roundedRadius: 4,
  },
  medium: {
    fontSize: 14,
    height: 32,
    iconSize: 20,
    lineHeight: 20,
    minWidth: 96,
    paddingHorizontal: 12,
    paddingVertical: 5,
    roundedRadius: 4,
  },
  large: {
    fontSize: 16,
    height: 40,
    iconSize: 24,
    lineHeight: 22,
    minWidth: 96,
    paddingHorizontal: 16,
    paddingVertical: 8,
    roundedRadius: 4,
  },
};

function disabledColors(theme: Theme): ButtonColorTokens {
  return {
    backgroundColor: theme.colors.neutralBackgroundDisabled,
    borderColor: theme.colors.neutralStrokeDisabled,
    foregroundColor: theme.colors.neutralForegroundDisabled,
  };
}

function primaryColors(theme: Theme, hovered: boolean, pressed: boolean): ButtonColorTokens {
  return {
    backgroundColor: pressed
      ? theme.colors.brandBackgroundPressed
      : hovered
        ? theme.colors.brandBackgroundHover
        : theme.colors.brandBackground,
    borderColor: theme.colors.transparentStroke,
    foregroundColor: pressed
      ? theme.colors.neutralForegroundOnBrandPressed
      : hovered
        ? theme.colors.neutralForegroundOnBrandHover
        : theme.colors.neutralForegroundOnBrand,
  };
}

function secondaryColors(theme: Theme, hovered: boolean, pressed: boolean): ButtonColorTokens {
  return {
    backgroundColor: pressed
      ? theme.colors.neutralBackground1Pressed
      : hovered
        ? theme.colors.neutralBackground1Hover
        : theme.colors.neutralBackground1,
    borderColor: pressed ? theme.colors.neutralStroke1Pressed : hovered ? theme.colors.neutralStroke1Hover : theme.colors.neutralStroke1,
    foregroundColor: pressed
      ? theme.colors.neutralForeground1Pressed
      : hovered
        ? theme.colors.neutralForeground1Hover
        : theme.colors.neutralForeground1,
  };
}

function outlineColors(theme: Theme, hovered: boolean, pressed: boolean): ButtonColorTokens {
  return {
    backgroundColor: pressed
      ? theme.colors.subtleBackgroundPressed
      : hovered
        ? theme.colors.subtleBackgroundHover
        : theme.colors.transparentBackground,
    borderColor: pressed ? theme.colors.neutralStroke1Pressed : hovered ? theme.colors.neutralStroke1Hover : theme.colors.neutralStroke1,
    foregroundColor: pressed
      ? theme.colors.neutralForeground1Pressed
      : hovered
        ? theme.colors.neutralForeground1Hover
        : theme.colors.neutralForeground1,
  };
}

function subtleColors(theme: Theme, hovered: boolean, pressed: boolean): ButtonColorTokens {
  return {
    backgroundColor: pressed
      ? theme.colors.subtleBackgroundPressed
      : hovered
        ? theme.colors.subtleBackgroundHover
        : theme.colors.subtleBackground,
    borderColor: theme.colors.transparentStroke,
    foregroundColor: pressed
      ? theme.colors.neutralForeground2Pressed
      : hovered
        ? theme.colors.neutralForeground2Hover
        : theme.colors.neutralForeground2,
  };
}

function transparentColors(theme: Theme, hovered: boolean, pressed: boolean): ButtonColorTokens {
  return {
    backgroundColor: pressed
      ? theme.colors.transparentBackgroundPressed
      : hovered
        ? theme.colors.transparentBackgroundHover
        : theme.colors.transparentBackground,
    borderColor: theme.colors.transparentStroke,
    foregroundColor: pressed
      ? theme.colors.neutralForeground2BrandPressed
      : hovered
        ? theme.colors.neutralForeground2BrandHover
        : theme.colors.neutralForeground2,
  };
}

function selectedColors(theme: Theme, appearance: ButtonAppearance, isAccessible: boolean): ButtonColorTokens {
  if (isAccessible) {
    return {
      backgroundColor: theme.colors.brandBackground,
      borderColor: theme.colors.transparentStroke,
      foregroundColor: theme.colors.neutralForegroundOnBrand,
    };
  }

  switch (appearance) {
    case 'primary':
      return {
        backgroundColor: theme.colors.brandBackgroundSelected,
        borderColor: theme.colors.transparentStroke,
        foregroundColor: theme.colors.neutralForegroundOnBrandSelected,
      };
    case 'subtle':
      return {
        backgroundColor: theme.colors.subtleBackgroundSelected,
        borderColor: theme.colors.transparentStroke,
        foregroundColor: theme.colors.neutralForeground2Selected,
      };
    case 'transparent':
      return {
        backgroundColor: theme.colors.transparentBackgroundSelected,
        borderColor: theme.colors.transparentStroke,
        foregroundColor: theme.colors.neutralForeground2BrandSelected,
      };
    case 'outline':
    case 'secondary':
      return {
        backgroundColor: theme.colors.neutralBackground1Selected,
        borderColor: theme.colors.neutralStroke1Selected,
        foregroundColor: theme.colors.neutralForeground1Selected,
      };
  }
}

export function getButtonColorTokens(
  theme: Theme,
  appearance: ButtonAppearance,
  options: {
    checked?: boolean;
    disabled?: boolean;
    hovered?: boolean;
    isAccessible?: boolean;
    pressed?: boolean;
  } = {},
): ButtonColorTokens {
  const { checked = false, disabled = false, hovered = false, isAccessible = false, pressed = false } = options;

  if (disabled) {
    return disabledColors(theme);
  }

  if (checked) {
    return selectedColors(theme, appearance, isAccessible);
  }

  switch (appearance) {
    case 'primary':
      return primaryColors(theme, hovered, pressed);
    case 'outline':
      return outlineColors(theme, hovered, pressed);
    case 'subtle':
      return subtleColors(theme, hovered, pressed);
    case 'transparent':
      return transparentColors(theme, hovered, pressed);
    case 'secondary':
      return secondaryColors(theme, hovered, pressed);
    default:
      return secondaryColors(theme, hovered, pressed);
  }
}

export function getButtonBorderRadius(shape: ButtonShape, size: ButtonSize): number {
  switch (shape) {
    case 'circular':
      return buttonSizeTokens[size].height / 2;
    case 'square':
      return 0;
    case 'rounded':
      return buttonSizeTokens[size].roundedRadius;
    default:
      return buttonSizeTokens.medium.roundedRadius;
  }
}
