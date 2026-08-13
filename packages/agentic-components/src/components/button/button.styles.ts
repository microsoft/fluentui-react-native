import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import { cornerRadiusNone, size160, size200, size240, sizeNone } from '@fluentui-react-native/design/tokens/global';

import { getStateStyleFactory, getThemedStateStyleFactory } from '../../utils/branchedStyle';
import type { StateNames, StyleDefinition } from '../../utils/branchedStyle';
import { getThemedColorStyleFactory } from '../../utils/colorStyles';
import type { ColorStyleDefinition, TextColorStyle, ViewColorStyle } from '../../utils/colorStyles';
import type { ButtonSize, ButtonState } from './button.types';

export const buttonStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    textAlign: 'center',
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
});

const colorStateLevels = [['primary', 'secondary', 'outline', 'subtle'], ['selected'], ['disabled', 'pressed', 'hovered']] as const;
type ColorStateLevels = typeof colorStateLevels;
type ColorState = StateNames<ColorStateLevels>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, ColorStateLevels> = {
  primary: {
    backgroundColor: 'backgroundBrandHeavy',
    borderColor: 'strokeNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
    },
  },
  secondary: {
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
  outline: {
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
  subtle: {
    backgroundColor: 'backgroundNeutralTransparent',
    borderColor: 'strokeNeutralTransparent',
    selected: {
      backgroundColor: 'backgroundNeutralSoft',
      disabled: {
        backgroundColor: 'backgroundNeutralSubtleDisabled',
      },
    },
  },
};

const foregroundColorDefinition: ColorStyleDefinition<TextColorStyle, ColorStateLevels> = {
  primary: {
    color: 'foregroundBrandOnloud',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  secondary: {
    color: 'foregroundNeutralPrimary',
    selected: {
      color: 'foregroundNeutralOnloud',
    },
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  outline: {
    color: 'foregroundNeutralPrimary',
    selected: {
      color: 'foregroundNeutralOnloud',
    },
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  subtle: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, ColorStateLevels>(
  'Button.background',
  backgroundColorDefinition,
  colorStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ColorStateLevels>(
  'Button.foreground',
  foregroundColorDefinition,
  colorStateLevels,
);

function getColorStateSource(state: ButtonState): ColorState[] {
  const source: ColorState[] = [state.appearance];
  if (state.selected) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  }
  if (state.pressed) {
    source.push('pressed');
  }
  if (state.hovered) {
    source.push('hovered');
  }
  return source;
}

export function getButtonColorStyles(state: ButtonState): {
  background: ViewColorStyle;
  foreground: TextColorStyle;
} {
  const source = getColorStateSource(state);
  return {
    background: getThemedBackgroundStyle(state, source),
    foreground: getThemedForegroundStyle(state, source),
  };
}

const rootStyleStateLevels = [
  ['small', 'medium', 'large'],
  ['rounded', 'square', 'circle'],
  ['withContent', 'iconOnly'],
] as const;
type RootStyleStateLevels = typeof rootStyleStateLevels;
type RootStyleState = StateNames<RootStyleStateLevels>;

function getGapValue(value: FlexTokens['spacing']['componentBase50']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new TypeError('Button gap tokens must resolve to a number or string.');
}

function createSizeStyle(
  roundedRadius: NonNullable<ViewStyle['borderRadius']>,
  circleRadius: NonNullable<ViewStyle['borderRadius']>,
  withContent: ViewStyle,
  iconOnly: ViewStyle,
) {
  return {
    rounded: {
      borderRadius: roundedRadius,
      iconOnly,
      withContent,
    },
    square: {
      borderRadius: cornerRadiusNone,
      iconOnly,
      withContent,
    },
    circle: {
      borderRadius: circleRadius,
      iconOnly,
      withContent,
    },
  };
}

function createRootStyleDefinition({ borderRadius, spacing, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  return {
    borderWidth: strokeWidth.thin,
    minHeight: size240,
    minWidth: size240,
    small: createSizeStyle(
      borderRadius.base200,
      borderRadius.circular,
      {
        gap: getGapValue(spacing.componentBase50),
        paddingHorizontal: spacing.componentBase200,
        paddingVertical: spacing.componentBase100,
      },
      {
        paddingHorizontal: spacing.componentBase100,
        paddingVertical: spacing.componentBase100,
      },
    ),
    medium: createSizeStyle(
      borderRadius.base300,
      borderRadius.circular,
      {
        gap: getGapValue(spacing.componentBase100),
        paddingHorizontal: spacing.componentBase250,
        paddingVertical: spacing.componentBase150,
      },
      {
        paddingHorizontal: spacing.componentBase150,
        paddingVertical: spacing.componentBase150,
      },
    ),
    large: createSizeStyle(
      borderRadius.base400,
      borderRadius.circular,
      {
        gap: getGapValue(spacing.componentBase150),
        paddingHorizontal: spacing.componentBase300,
        paddingVertical: spacing.componentBase200,
      },
      {
        paddingHorizontal: spacing.componentBase250,
        paddingVertical: spacing.componentBase250,
      },
    ),
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Button.root', createRootStyleDefinition, rootStyleStateLevels);

function getRootStyleStateSource(state: ButtonState): RootStyleState[] {
  return [state.size, state.shape, state.iconOnly ? 'iconOnly' : 'withContent'];
}

export function getButtonRootStyle(state: ButtonState): ViewStyle {
  return getThemedRootStyle(state, getRootStyleStateSource(state));
}

const contentStyleStateLevels = [['small', 'medium', 'large'], ['selected']] as const;
type ContentStyleStateLevels = typeof contentStyleStateLevels;
type ContentStyleState = StateNames<ContentStyleStateLevels>;

function createContentStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, ContentStyleStateLevels> {
  const selected: TextStyle = { fontWeight: fontWeight.functionalSemibold };
  return {
    fontFamily: fontFamily.functional,
    small: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
      selected,
    },
    medium: {
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
      selected,
    },
    large: {
      fontSize: fontSize.functionalBodyLarge,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyLarge,
      selected,
    },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory('Button.content', createContentStyleDefinition, contentStyleStateLevels);

export function getButtonContentStyle(state: ButtonState, selected = state.selected): TextStyle {
  const source: ContentStyleState[] = [state.size];
  if (selected) {
    source.push('selected');
  }
  return getThemedContentStyle(state, source);
}

const focusStyleStateLevels = [['focused']] as const;

const getThemedFocusStyle = getThemedStateStyleFactory(
  'Button.focus',
  ({ color, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof focusStyleStateLevels> => ({
    focused: {
      borderColor: color.strokeFocusInner,
      outlineColor: color.strokeFocusOuter,
      outlineOffset: strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: strokeWidth.thick,
    },
  }),
  focusStyleStateLevels,
);

const focusedState = ['focused'] as const;

export function getButtonFocusStyle(state: ButtonState): ViewStyle | undefined {
  return state.focused && !state.disabled ? getThemedFocusStyle(state, focusedState) : undefined;
}

const contentVisibilityStateLevels = [['visible', 'hidden']] as const;
type ContentVisibility = StateNames<typeof contentVisibilityStateLevels>;

const getContentVisibilityStyle = getStateStyleFactory<TextStyle, typeof contentVisibilityStateLevels>(
  {
    visible: {
      bottom: sizeNone,
      left: sizeNone,
      position: 'absolute',
      right: sizeNone,
      top: sizeNone,
    },
    hidden: {
      opacity: sizeNone,
    },
  },
  contentVisibilityStateLevels,
);

export function getButtonContentVisibilityStyle(visibility: ContentVisibility): TextStyle {
  return getContentVisibilityStyle([visibility]);
}

const iconSizes: Record<ButtonSize, number> = {
  small: size160,
  medium: size200,
  large: size200,
};

export function getButtonIconSize(size: ButtonSize): number {
  return iconSizes[size];
}
