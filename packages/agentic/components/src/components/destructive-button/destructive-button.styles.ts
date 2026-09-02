import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import {
  getGapStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  interactiveStatePriority,
} from '@fluentui-react-native/design/styling';
import type {
  ColorStyleDefinition,
  StateNames,
  StyleDefinition,
  TextColorStyle,
  ViewColorStyle,
} from '@fluentui-react-native/design/styling';
import { size240 } from '@fluentui-react-native/design/tokens/global';

import { getButtonIconSize } from '../button/button.styles';

import type { DestructiveButtonState } from './destructive-button.types';

export const destructiveButtonStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flexShrink: 1,
    textAlign: 'center',
  },
});

const colorStateLevels = [['primary', 'subtle'], interactiveStatePriority] as const;
type ColorStateLevels = typeof colorStateLevels;
type ColorState = StateNames<ColorStateLevels>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, ColorStateLevels> = {
  primary: {
    backgroundColor: 'backgroundDangerLoud',
    borderColor: 'strokeNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
    },
  },
  subtle: {
    backgroundColor: 'backgroundNeutralTransparent',
    borderColor: 'strokeNeutralTransparent',
    // The rest background is transparent, so hover and press resolve from the danger tint instead of
    // the transparent rest value, which would otherwise produce a neutral backplate.
    hovered: {
      backgroundColor: 'backgroundDangerSubtle',
    },
    pressed: {
      backgroundColor: 'backgroundDangerSubtle',
    },
  },
};

const foregroundColorDefinition: ColorStyleDefinition<TextColorStyle, ColorStateLevels> = {
  primary: {
    color: 'foregroundDangerOnloud',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  subtle: {
    color: 'foregroundDangerPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, ColorStateLevels>(
  'DestructiveButton.background',
  backgroundColorDefinition,
  colorStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ColorStateLevels>(
  'DestructiveButton.foreground',
  foregroundColorDefinition,
  colorStateLevels,
);

function getColorStateSource(state: DestructiveButtonState): ColorState[] {
  const source: ColorState[] = [state.appearance];
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

export function getDestructiveButtonColorStyles(state: DestructiveButtonState): {
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
  ['rounded', 'circle'],
  ['withContent', 'iconOnly'],
] as const;
type RootStyleStateLevels = typeof rootStyleStateLevels;
type RootStyleState = StateNames<RootStyleStateLevels>;

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
        gap: getGapStyleValue(spacing.componentBase50),
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
        gap: getGapStyleValue(spacing.componentBase100),
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
        gap: getGapStyleValue(spacing.componentBase150),
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

const getThemedRootStyle = getThemedStateStyleFactory('DestructiveButton.root', createRootStyleDefinition, rootStyleStateLevels);

function getRootStyleStateSource(state: DestructiveButtonState): RootStyleState[] {
  return [state.size, state.shape, state.iconOnly ? 'iconOnly' : 'withContent'];
}

export function getDestructiveButtonRootStyle(state: DestructiveButtonState): ViewStyle {
  return getThemedRootStyle(state, getRootStyleStateSource(state));
}

const contentStyleStateLevels = [['small', 'medium', 'large']] as const;
type ContentStyleStateLevels = typeof contentStyleStateLevels;

function createContentStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, ContentStyleStateLevels> {
  return {
    fontFamily: fontFamily.functional,
    fontWeight: fontWeight.functionalRegular,
    small: {
      fontSize: fontSize.functionalBodySmall,
      lineHeight: lineHeight.functionalBodySmall,
    },
    medium: {
      fontSize: fontSize.functionalBodyMedium,
      lineHeight: lineHeight.functionalBodyMedium,
    },
    large: {
      fontSize: fontSize.functionalBodyLarge,
      lineHeight: lineHeight.functionalBodyLarge,
    },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory(
  'DestructiveButton.content',
  createContentStyleDefinition,
  contentStyleStateLevels,
);

export function getDestructiveButtonContentStyle(state: DestructiveButtonState): TextStyle {
  return getThemedContentStyle(state, [state.size]);
}

/**
 * Icon sizing is inherited from Button so the button family cannot drift apart.
 */
export const getDestructiveButtonIconSize = getButtonIconSize;
