import { StyleSheet } from 'react-native';
import type { ColorValue, TextStyle, ViewStyle } from 'react-native';

import { getThemeStyleSheet } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import { cornerRadiusNone, size160, size200, size240, sizeNone } from '@fluentui-react-native/design/tokens/global';

import type { ButtonAppearance, ButtonShape, ButtonSize } from './button.types';

type FlexTokens = ThemeState['tokens'];
type InteractionState = 'rest' | 'hovered' | 'pressed';
type BackgroundStyleName =
  | 'brandHeavy'
  | 'neutralHeavy'
  | 'neutralSoft'
  | 'neutralSubtle'
  | 'neutralTransparent'
  | 'neutralHeavyDisabled'
  | 'neutralSubtleDisabled';
type BorderStyleName = 'neutralTransparent' | 'neutralSubtle' | 'neutralHeavy' | 'neutralDisabled';
type ForegroundStyleName = 'brandOnloud' | 'neutralPrimary' | 'neutralOnloud' | 'neutralDisabled';

type ButtonColorStyleNames = {
  background: BackgroundStyleName;
  border: BorderStyleName;
  foreground: ForegroundStyleName;
};

const buttonThemeStylesKey = Symbol('Button.themeStyles');

const unselectedColorStyles: Record<ButtonAppearance, ButtonColorStyleNames> = {
  primary: {
    background: 'brandHeavy',
    border: 'neutralTransparent',
    foreground: 'brandOnloud',
  },
  secondary: {
    background: 'neutralSubtle',
    border: 'neutralTransparent',
    foreground: 'neutralPrimary',
  },
  outline: {
    background: 'neutralTransparent',
    border: 'neutralSubtle',
    foreground: 'neutralPrimary',
  },
  subtle: {
    background: 'neutralTransparent',
    border: 'neutralTransparent',
    foreground: 'neutralPrimary',
  },
};

const selectedColorStyles: Record<ButtonAppearance, ButtonColorStyleNames> = {
  primary: unselectedColorStyles.primary,
  secondary: {
    background: 'neutralHeavy',
    border: 'neutralTransparent',
    foreground: 'neutralOnloud',
  },
  outline: {
    background: 'neutralHeavy',
    border: 'neutralHeavy',
    foreground: 'neutralOnloud',
  },
  subtle: {
    background: 'neutralSoft',
    border: 'neutralTransparent',
    foreground: 'neutralPrimary',
  },
};

const disabledColorStyles: Record<ButtonAppearance, ButtonColorStyleNames> = {
  primary: {
    background: 'neutralHeavyDisabled',
    border: 'neutralTransparent',
    foreground: 'neutralDisabled',
  },
  secondary: {
    background: 'neutralSubtleDisabled',
    border: 'neutralTransparent',
    foreground: 'neutralDisabled',
  },
  outline: {
    background: 'neutralTransparent',
    border: 'neutralDisabled',
    foreground: 'neutralDisabled',
  },
  subtle: {
    background: 'neutralTransparent',
    border: 'neutralTransparent',
    foreground: 'neutralDisabled',
  },
};

const selectedDisabledColorStyles: Record<ButtonAppearance, ButtonColorStyleNames> = {
  primary: disabledColorStyles.primary,
  secondary: {
    background: 'neutralHeavyDisabled',
    border: 'neutralTransparent',
    foreground: 'neutralDisabled',
  },
  outline: {
    background: 'neutralHeavyDisabled',
    border: 'neutralDisabled',
    foreground: 'neutralDisabled',
  },
  subtle: {
    background: 'neutralSubtleDisabled',
    border: 'neutralTransparent',
    foreground: 'neutralDisabled',
  },
};

function getGapValue(value: FlexTokens['spacing']['componentBase50']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new TypeError('Button gap tokens must resolve to a number or string.');
}

function createButtonThemeStyles({ tokens }: ThemeState) {
  const rest = tokens.color;
  const hovered = { ...rest, ...rest.hover };
  const pressed = { ...rest, ...rest.pressed };

  return StyleSheet.create({
    root: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      borderStyle: 'solid',
      borderWidth: tokens.strokeWidth.thin,
      flexDirection: 'row',
      justifyContent: 'center',
      minHeight: size240,
      minWidth: size240,
    },
    rootWithContentSmall: {
      gap: getGapValue(tokens.spacing.componentBase50),
      paddingHorizontal: tokens.spacing.componentBase200,
      paddingVertical: tokens.spacing.componentBase100,
    },
    rootWithContentMedium: {
      gap: getGapValue(tokens.spacing.componentBase100),
      paddingHorizontal: tokens.spacing.componentBase250,
      paddingVertical: tokens.spacing.componentBase150,
    },
    rootWithContentLarge: {
      gap: getGapValue(tokens.spacing.componentBase150),
      paddingHorizontal: tokens.spacing.componentBase300,
      paddingVertical: tokens.spacing.componentBase200,
    },
    rootIconOnlySmall: {
      paddingHorizontal: tokens.spacing.componentBase100,
      paddingVertical: tokens.spacing.componentBase100,
    },
    rootIconOnlyMedium: {
      paddingHorizontal: tokens.spacing.componentBase150,
      paddingVertical: tokens.spacing.componentBase150,
    },
    rootIconOnlyLarge: {
      paddingHorizontal: tokens.spacing.componentBase250,
      paddingVertical: tokens.spacing.componentBase250,
    },
    roundedSmall: { borderRadius: tokens.borderRadius.base200 },
    roundedMedium: { borderRadius: tokens.borderRadius.base300 },
    roundedLarge: { borderRadius: tokens.borderRadius.base400 },
    circle: { borderRadius: tokens.borderRadius.circular },
    square: { borderRadius: cornerRadiusNone },
    focused: {
      borderColor: tokens.color.strokeFocusInner,
      outlineColor: tokens.color.strokeFocusOuter,
      outlineOffset: tokens.strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: tokens.strokeWidth.thick,
    },
    content: {
      fontFamily: tokens.fontFamily.functional,
      textAlign: 'center',
    },
    contentSmall: {
      fontSize: tokens.fontSize.functionalBodySmall,
      lineHeight: tokens.lineHeight.functionalBodySmall,
    },
    contentMedium: {
      fontSize: tokens.fontSize.functionalBodyMedium,
      lineHeight: tokens.lineHeight.functionalBodyMedium,
    },
    contentLarge: {
      fontSize: tokens.fontSize.functionalBodyLarge,
      lineHeight: tokens.lineHeight.functionalBodyLarge,
    },
    contentRegular: { fontWeight: tokens.fontWeight.functionalRegular },
    contentSemibold: { fontWeight: tokens.fontWeight.functionalSemibold },
    contentHidden: { opacity: sizeNone },
    contentVisible: {
      bottom: sizeNone,
      left: sizeNone,
      position: 'absolute',
      right: sizeNone,
      top: sizeNone,
    },
    contentContainer: {
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
    },
    backgroundBrandHeavy: { backgroundColor: rest.backgroundBrandHeavy },
    backgroundBrandHeavyHovered: { backgroundColor: hovered.backgroundBrandHeavy },
    backgroundBrandHeavyPressed: { backgroundColor: pressed.backgroundBrandHeavy },
    backgroundNeutralHeavy: { backgroundColor: rest.backgroundNeutralHeavy },
    backgroundNeutralHeavyHovered: { backgroundColor: hovered.backgroundNeutralHeavy },
    backgroundNeutralHeavyPressed: { backgroundColor: pressed.backgroundNeutralHeavy },
    backgroundNeutralSoft: { backgroundColor: rest.backgroundNeutralSoft },
    backgroundNeutralSoftHovered: { backgroundColor: hovered.backgroundNeutralSoft },
    backgroundNeutralSoftPressed: { backgroundColor: pressed.backgroundNeutralSoft },
    backgroundNeutralSubtle: { backgroundColor: rest.backgroundNeutralSubtle },
    backgroundNeutralSubtleHovered: { backgroundColor: hovered.backgroundNeutralSubtle },
    backgroundNeutralSubtlePressed: { backgroundColor: pressed.backgroundNeutralSubtle },
    backgroundNeutralTransparent: { backgroundColor: rest.backgroundNeutralTransparent },
    backgroundNeutralTransparentHovered: { backgroundColor: hovered.backgroundNeutralTransparent },
    backgroundNeutralTransparentPressed: { backgroundColor: pressed.backgroundNeutralTransparent },
    backgroundNeutralHeavyDisabled: { backgroundColor: rest.backgroundNeutralHeavyDisabled },
    backgroundNeutralSubtleDisabled: { backgroundColor: rest.backgroundNeutralSubtleDisabled },
    borderNeutralTransparent: { borderColor: rest.strokeNeutralTransparent },
    borderNeutralTransparentHovered: { borderColor: hovered.strokeNeutralTransparent },
    borderNeutralTransparentPressed: { borderColor: pressed.strokeNeutralTransparent },
    borderNeutralSubtle: { borderColor: rest.strokeNeutralSubtle },
    borderNeutralSubtleHovered: { borderColor: hovered.strokeNeutralSubtle },
    borderNeutralSubtlePressed: { borderColor: pressed.strokeNeutralSubtle },
    borderNeutralHeavy: { borderColor: rest.strokeNeutralHeavy },
    borderNeutralHeavyHovered: { borderColor: hovered.strokeNeutralHeavy },
    borderNeutralHeavyPressed: { borderColor: pressed.strokeNeutralHeavy },
    borderNeutralDisabled: { borderColor: rest.strokeNeutralDisabled },
    foregroundBrandOnloud: { color: rest.foregroundBrandOnloud },
    foregroundBrandOnloudHovered: { color: hovered.foregroundBrandOnloud },
    foregroundBrandOnloudPressed: { color: pressed.foregroundBrandOnloud },
    foregroundNeutralPrimary: { color: rest.foregroundNeutralPrimary },
    foregroundNeutralPrimaryHovered: { color: hovered.foregroundNeutralPrimary },
    foregroundNeutralPrimaryPressed: { color: pressed.foregroundNeutralPrimary },
    foregroundNeutralOnloud: { color: rest.foregroundNeutralOnloud },
    foregroundNeutralOnloudHovered: { color: hovered.foregroundNeutralOnloud },
    foregroundNeutralOnloudPressed: { color: pressed.foregroundNeutralOnloud },
    foregroundNeutralDisabled: { color: rest.foregroundNeutralDisabled },
  });
}

export type ButtonThemeStyles = ReturnType<typeof createButtonThemeStyles>;

const rootSizeStyleKeys = {
  small: { withContent: 'rootWithContentSmall', iconOnly: 'rootIconOnlySmall' },
  medium: { withContent: 'rootWithContentMedium', iconOnly: 'rootIconOnlyMedium' },
  large: { withContent: 'rootWithContentLarge', iconOnly: 'rootIconOnlyLarge' },
} as const;

const roundedStyleKeys = {
  small: 'roundedSmall',
  medium: 'roundedMedium',
  large: 'roundedLarge',
} as const;

const contentSizeStyleKeys = {
  small: 'contentSmall',
  medium: 'contentMedium',
  large: 'contentLarge',
} as const;

const iconSizes: Record<ButtonSize, number> = {
  small: size160,
  medium: size200,
  large: size200,
};

const backgroundStyleKeys = {
  brandHeavy: {
    rest: 'backgroundBrandHeavy',
    hovered: 'backgroundBrandHeavyHovered',
    pressed: 'backgroundBrandHeavyPressed',
  },
  neutralHeavy: {
    rest: 'backgroundNeutralHeavy',
    hovered: 'backgroundNeutralHeavyHovered',
    pressed: 'backgroundNeutralHeavyPressed',
  },
  neutralSoft: {
    rest: 'backgroundNeutralSoft',
    hovered: 'backgroundNeutralSoftHovered',
    pressed: 'backgroundNeutralSoftPressed',
  },
  neutralSubtle: {
    rest: 'backgroundNeutralSubtle',
    hovered: 'backgroundNeutralSubtleHovered',
    pressed: 'backgroundNeutralSubtlePressed',
  },
  neutralTransparent: {
    rest: 'backgroundNeutralTransparent',
    hovered: 'backgroundNeutralTransparentHovered',
    pressed: 'backgroundNeutralTransparentPressed',
  },
  neutralHeavyDisabled: {
    rest: 'backgroundNeutralHeavyDisabled',
    hovered: 'backgroundNeutralHeavyDisabled',
    pressed: 'backgroundNeutralHeavyDisabled',
  },
  neutralSubtleDisabled: {
    rest: 'backgroundNeutralSubtleDisabled',
    hovered: 'backgroundNeutralSubtleDisabled',
    pressed: 'backgroundNeutralSubtleDisabled',
  },
} as const;

const borderStyleKeys = {
  neutralTransparent: {
    rest: 'borderNeutralTransparent',
    hovered: 'borderNeutralTransparentHovered',
    pressed: 'borderNeutralTransparentPressed',
  },
  neutralSubtle: {
    rest: 'borderNeutralSubtle',
    hovered: 'borderNeutralSubtleHovered',
    pressed: 'borderNeutralSubtlePressed',
  },
  neutralHeavy: {
    rest: 'borderNeutralHeavy',
    hovered: 'borderNeutralHeavyHovered',
    pressed: 'borderNeutralHeavyPressed',
  },
  neutralDisabled: {
    rest: 'borderNeutralDisabled',
    hovered: 'borderNeutralDisabled',
    pressed: 'borderNeutralDisabled',
  },
} as const;

const foregroundStyleKeys = {
  brandOnloud: {
    rest: 'foregroundBrandOnloud',
    hovered: 'foregroundBrandOnloudHovered',
    pressed: 'foregroundBrandOnloudPressed',
  },
  neutralPrimary: {
    rest: 'foregroundNeutralPrimary',
    hovered: 'foregroundNeutralPrimaryHovered',
    pressed: 'foregroundNeutralPrimaryPressed',
  },
  neutralOnloud: {
    rest: 'foregroundNeutralOnloud',
    hovered: 'foregroundNeutralOnloudHovered',
    pressed: 'foregroundNeutralOnloudPressed',
  },
  neutralDisabled: {
    rest: 'foregroundNeutralDisabled',
    hovered: 'foregroundNeutralDisabled',
    pressed: 'foregroundNeutralDisabled',
  },
} as const;

export type ButtonColorStyles = {
  background: ViewStyle;
  border: ViewStyle;
  foreground: TextStyle;
  foregroundColor: ColorValue;
};

export function getButtonThemeStyles(themeState: ThemeState): ButtonThemeStyles {
  return getThemeStyleSheet(themeState, buttonThemeStylesKey, createButtonThemeStyles);
}

export function getButtonColorStyles(
  styles: ButtonThemeStyles,
  appearance: ButtonAppearance,
  disabled: boolean,
  selected: boolean,
  pressed: boolean,
  hovered: boolean,
): ButtonColorStyles {
  const names = disabled
    ? selected
      ? selectedDisabledColorStyles[appearance]
      : disabledColorStyles[appearance]
    : selected
      ? selectedColorStyles[appearance]
      : unselectedColorStyles[appearance];
  const interaction = disabled ? 'rest' : getInteractionState(pressed, hovered);
  const foreground = getForegroundStyle(styles, names.foreground, interaction);

  return {
    background: getBackgroundStyle(styles, names.background, interaction),
    border: getBorderStyle(styles, names.border, interaction),
    foreground,
    foregroundColor: foreground.color,
  };
}

export function getButtonRootSizeStyle(styles: ButtonThemeStyles, size: ButtonSize, iconOnly: boolean): ViewStyle {
  return styles[rootSizeStyleKeys[size][iconOnly ? 'iconOnly' : 'withContent']];
}

export function getButtonShapeStyle(styles: ButtonThemeStyles, shape: ButtonShape, size: ButtonSize): ViewStyle {
  if (shape === 'circle') {
    return styles.circle;
  }
  if (shape === 'square') {
    return styles.square;
  }
  return styles[roundedStyleKeys[size]];
}

export function getButtonContentSizeStyle(styles: ButtonThemeStyles, size: ButtonSize): TextStyle {
  return styles[contentSizeStyleKeys[size]];
}

export function getButtonIconSize(size: ButtonSize): number {
  return iconSizes[size];
}

function getInteractionState(pressed: boolean, hovered: boolean): InteractionState {
  return pressed ? 'pressed' : hovered ? 'hovered' : 'rest';
}

function getBackgroundStyle(styles: ButtonThemeStyles, name: BackgroundStyleName, interaction: InteractionState): ViewStyle {
  return styles[backgroundStyleKeys[name][interaction]];
}

function getBorderStyle(styles: ButtonThemeStyles, name: BorderStyleName, interaction: InteractionState): ViewStyle {
  return styles[borderStyleKeys[name][interaction]];
}

function getForegroundStyle(
  styles: ButtonThemeStyles,
  name: ForegroundStyleName,
  interaction: InteractionState,
): TextStyle & { color: ColorValue } {
  return styles[foregroundStyleKeys[name][interaction]];
}
