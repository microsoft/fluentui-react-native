import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import { cornerRadiusNone, size160, size200, size240, sizeNone } from '@fluentui-react-native/design/tokens/global';

import { getThemedColorStyleFactory } from '../../utils/colorStyles';
import type { ColorStyleDefinition, TextColorStyle, ViewColorStyle } from '../../utils/colorStyles';
import type { ButtonAppearance, ButtonShape, ButtonSize, ButtonState } from './button.types';

type FlexTokens = ThemeState['tokens'];
type ButtonRootState = 'selected';
type ButtonBranchState = 'disabled' | 'pressed' | 'hovered';
type BackgroundColorDefinition = ColorStyleDefinition<ViewColorStyle, ButtonRootState, ButtonBranchState>;
type ForegroundColorDefinition = ColorStyleDefinition<TextColorStyle, ButtonRootState, ButtonBranchState>;

const rootStates = ['selected'] as const;
const branchStates = ['disabled', 'pressed', 'hovered'] as const;

type AppearanceColorDefinitions = {
  background: BackgroundColorDefinition;
  foreground: ForegroundColorDefinition;
};

const appearanceColorDefinitions: Record<ButtonAppearance, AppearanceColorDefinitions> = {
  primary: {
    background: {
      backgroundColor: 'backgroundBrandHeavy',
      borderColor: 'strokeNeutralTransparent',
      disabled: {
        backgroundColor: 'backgroundNeutralHeavyDisabled',
      },
    },
    foreground: {
      color: 'foregroundBrandOnloud',
      disabled: {
        color: 'foregroundNeutralDisabled',
      },
    },
  },
  secondary: {
    background: {
      backgroundColor: 'backgroundNeutralSubtle',
      borderColor: 'strokeNeutralTransparent',
      selected: {
        backgroundColor: 'backgroundNeutralHeavy',
        disabled: {
          backgroundColor: 'backgroundNeutralHeavyDisabled',
        },
      },
      disabled: {
        backgroundColor: 'backgroundNeutralSubtleDisabled',
      },
    },
    foreground: {
      color: 'foregroundNeutralPrimary',
      selected: {
        color: 'foregroundNeutralOnloud',
      },
      disabled: {
        color: 'foregroundNeutralDisabled',
      },
    },
  },
  outline: {
    background: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeNeutralSubtle',
      selected: {
        backgroundColor: 'backgroundNeutralHeavy',
        borderColor: 'strokeNeutralHeavy',
        disabled: {
          backgroundColor: 'backgroundNeutralHeavyDisabled',
          borderColor: 'strokeNeutralDisabled',
        },
      },
      disabled: {
        borderColor: 'strokeNeutralDisabled',
      },
    },
    foreground: {
      color: 'foregroundNeutralPrimary',
      selected: {
        color: 'foregroundNeutralOnloud',
      },
      disabled: {
        color: 'foregroundNeutralDisabled',
      },
    },
  },
  subtle: {
    background: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeNeutralTransparent',
      selected: {
        backgroundColor: 'backgroundNeutralSoft',
        disabled: {
          backgroundColor: 'backgroundNeutralSubtleDisabled',
        },
      },
    },
    foreground: {
      color: 'foregroundNeutralPrimary',
      disabled: {
        color: 'foregroundNeutralDisabled',
      },
    },
  },
};

type AppearanceStyleGetter = (state: ButtonState) => {
  background: ViewColorStyle;
  foreground: TextColorStyle;
};

function createAppearanceStyleGetter(appearance: ButtonAppearance, definitions: AppearanceColorDefinitions): AppearanceStyleGetter {
  const getBackground = getThemedColorStyleFactory(`Button.${appearance}.background`, definitions.background, rootStates, branchStates);
  const getForeground = getThemedColorStyleFactory(`Button.${appearance}.foreground`, definitions.foreground, rootStates, branchStates);

  return (state) => ({
    background: getBackground(state, state),
    foreground: getForeground(state, state),
  });
}

const appearanceStyleGetters: Record<ButtonAppearance, AppearanceStyleGetter> = {
  primary: createAppearanceStyleGetter('primary', appearanceColorDefinitions.primary),
  secondary: createAppearanceStyleGetter('secondary', appearanceColorDefinitions.secondary),
  outline: createAppearanceStyleGetter('outline', appearanceColorDefinitions.outline),
  subtle: createAppearanceStyleGetter('subtle', appearanceColorDefinitions.subtle),
};

export function getAppearanceStyles(state: ButtonState): ReturnType<AppearanceStyleGetter> {
  return appearanceStyleGetters[state.appearance](state);
}

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

export function getButtonThemeStyles(themeState: ThemeState): ButtonThemeStyles {
  return getThemedButtonStyles(themeState);
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
