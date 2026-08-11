import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import { cornerRadiusNone, size160, size200, size240, sizeNone } from '@fluentui-react-native/design/tokens/global';

import { buildInteractiveStyles } from '../../utils/colorStyles';
import type { BackgroundStyle, ColorSet, ForegroundStyle, InteractiveStyleSet } from '../../utils/colorStyles';
import type { ButtonAppearance, ButtonShape, ButtonSize } from './button.types';

type FlexTokens = ThemeState['tokens'];
type InteractiveState = 'hovered' | 'pressed' | 'disabled';
type ResolvedInteractionState = 'rest' | InteractiveState;

type ButtonColorSets = {
  rest: ColorSet;
  selected: ColorSet;
  disabled: Partial<ColorSet>;
  selectedDisabled: Partial<ColorSet>;
};

const getPrimaryStyles = themedStyleSheetFactory('Button.primary', (themeState) => {
  const base: ColorSet = {
    background: 'backgroundBrandHeavy',
    border: 'strokeNeutralTransparent',
    foreground: 'foregroundBrandOnloud',
  };
  const disabled: Partial<ColorSet> = {
    background: 'backgroundNeutralHeavyDisabled',
    foreground: 'foregroundNeutralDisabled',
  };
  return buildInteractiveStyles(themeState, base, {
    selected: base,
    disabled: disabled,
    selectedDisabled: disabled,
  });
});

const getSecondaryStyles = themedStyleSheetFactory('Button.secondary', (themeState) => {
  const base: ColorSet = {
    background: 'backgroundNeutralSubtle',
    border: 'strokeNeutralTransparent',
    foreground: 'foregroundNeutralPrimary',
  };
  const disabled: Partial<ColorSet> = {
    background: 'backgroundNeutralSubtleDisabled',
    foreground: 'foregroundNeutralDisabled',
  };
  return buildInteractiveStyles(themeState, base, {
    selected: {
      background: 'backgroundNeutralHeavy',
      foreground: 'foregroundNeutralOnloud',
    },
    disabled: disabled,
    selectedDisabled: disabled,
  });
});

const buttonColorSets = {
  primary: {
    rest: {
      background: 'backgroundBrandHeavy',
      border: 'strokeNeutralTransparent',
      foreground: 'foregroundBrandOnloud',
    },
    selected: {
      background: 'backgroundBrandHeavy',
      border: 'strokeNeutralTransparent',
      foreground: 'foregroundBrandOnloud',
    },
    disabled: {
      background: 'backgroundNeutralHeavyDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
    selectedDisabled: {
      background: 'backgroundNeutralHeavyDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
  },
  secondary: {
    rest: {
      background: 'backgroundNeutralSubtle',
      border: 'strokeNeutralTransparent',
      foreground: 'foregroundNeutralPrimary',
    },
    selected: {
      background: 'backgroundNeutralHeavy',
      border: 'strokeNeutralTransparent',
      foreground: 'foregroundNeutralOnloud',
    },
    disabled: {
      background: 'backgroundNeutralSubtleDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
    selectedDisabled: {
      background: 'backgroundNeutralHeavyDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
  },
  outline: {
    rest: {
      background: 'backgroundNeutralTransparent',
      border: 'strokeNeutralSubtle',
      foreground: 'foregroundNeutralPrimary',
    },
    selected: {
      background: 'backgroundNeutralHeavy',
      border: 'strokeNeutralHeavy',
      foreground: 'foregroundNeutralOnloud',
    },
    disabled: {
      border: 'strokeNeutralDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
    selectedDisabled: {
      background: 'backgroundNeutralHeavyDisabled',
      border: 'strokeNeutralDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
  },
  subtle: {
    rest: {
      background: 'backgroundNeutralTransparent',
      border: 'strokeNeutralTransparent',
      foreground: 'foregroundNeutralPrimary',
    },
    selected: {
      background: 'backgroundNeutralSoft',
      border: 'strokeNeutralTransparent',
      foreground: 'foregroundNeutralPrimary',
    },
    disabled: {
      foreground: 'foregroundNeutralDisabled',
    },
    selectedDisabled: {
      background: 'backgroundNeutralSubtleDisabled',
      foreground: 'foregroundNeutralDisabled',
    },
  },
} as const satisfies Record<ButtonAppearance, ButtonColorSets>;

type ButtonInteractiveStyles = InteractiveStyleSet<InteractiveState>;
type ButtonColorStyleGetter = (themeState: ThemeState) => ButtonInteractiveStyles;
type ButtonAppearanceColorStyleGetters = {
  rest: ButtonColorStyleGetter;
  selected: ButtonColorStyleGetter;
};

function createButtonColorStyleGetter(symbolName: string, base: ColorSet, disabled: Partial<ColorSet>): ButtonColorStyleGetter {
  return themedStyleSheetFactory(symbolName, (themeState) =>
    StyleSheet.create(
      buildInteractiveStyles(themeState, base, {
        disabled,
      }),
    ),
  );
}

function createButtonAppearanceColorStyleGetters(appearance: ButtonAppearance, colors: ButtonColorSets): ButtonAppearanceColorStyleGetters {
  return {
    rest: createButtonColorStyleGetter(`Button.${appearance}`, colors.rest, colors.disabled),
    selected: createButtonColorStyleGetter(`Button.${appearance}.selected`, colors.selected, colors.selectedDisabled),
  };
}

const buttonColorStyleGetters: Record<ButtonAppearance, ButtonAppearanceColorStyleGetters> = {
  primary: createButtonAppearanceColorStyleGetters('primary', buttonColorSets.primary),
  secondary: createButtonAppearanceColorStyleGetters('secondary', buttonColorSets.secondary),
  outline: createButtonAppearanceColorStyleGetters('outline', buttonColorSets.outline),
  subtle: createButtonAppearanceColorStyleGetters('subtle', buttonColorSets.subtle),
};

function getGapValue(value: FlexTokens['spacing']['componentBase50']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new TypeError('Button gap tokens must resolve to a number or string.');
}

function createButtonThemeStyles({ tokens }: ThemeState) {
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
  });
}

export type ButtonThemeStyles = ReturnType<typeof createButtonThemeStyles>;

const getThemedButtonStyles = themedStyleSheetFactory('Button', createButtonThemeStyles);

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

export type ButtonColorStyles = {
  background: BackgroundStyle;
  foreground: ForegroundStyle;
  foregroundColor: ForegroundStyle['color'];
};

export function getButtonThemeStyles(themeState: ThemeState): ButtonThemeStyles {
  return getThemedButtonStyles(themeState);
}

export function getButtonColorStyles(
  themeState: ThemeState,
  appearance: ButtonAppearance,
  disabled: boolean,
  selected: boolean,
  pressed: boolean,
  hovered: boolean,
): ButtonColorStyles {
  const styles = buttonColorStyleGetters[appearance][selected ? 'selected' : 'rest'](themeState);
  const interaction = disabled ? 'disabled' : getInteractionState(pressed, hovered);
  const background = getBackgroundStyle(styles, interaction);
  const foreground = getForegroundStyle(styles, interaction);

  return {
    background,
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

function getInteractionState(pressed: boolean, hovered: boolean): ResolvedInteractionState {
  return pressed ? 'pressed' : hovered ? 'hovered' : 'rest';
}

function getBackgroundStyle(styles: ButtonInteractiveStyles, interaction: ResolvedInteractionState): BackgroundStyle {
  return interaction === 'rest' ? styles.bg : styles[`bg.${interaction}`];
}

function getForegroundStyle(styles: ButtonInteractiveStyles, interaction: ResolvedInteractionState): ForegroundStyle {
  return interaction === 'rest' ? styles.fg : styles[`fg.${interaction}`];
}
