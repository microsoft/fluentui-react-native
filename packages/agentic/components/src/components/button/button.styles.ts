import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import {
  channelStatePriority,
  functionalTypography,
  getGapStyleValue,
  getRadiusStyleValue,
  getStrokeWidthStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  resolveHoverMode,
} from '@fluentui-react-native/design/styling';
import type {
  ColorStyleDefinition,
  StateNames,
  StyleDefinition,
  TextColorStyle,
  ViewColorStyle,
} from '@fluentui-react-native/design/styling';
import { cornerRadiusNone, size160, size200, size240 } from '@fluentui-react-native/design/tokens/global';

import type { ButtonSize, ButtonState } from './button.types';
import { buttonTraits } from './spec/traits';

export const buttonStyles = StyleSheet.create({
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

const appearances = ['primary', 'secondary', 'outline', 'subtle'] as const;
const backgroundStateLevels = [appearances, ['selected'], channelStatePriority(buttonTraits.channels.root.background)] as const;
const foregroundStateLevels = [appearances, ['selected'], channelStatePriority(buttonTraits.channels.content.foreground)] as const;
const strokeStateLevels = [appearances, ['selected'], channelStatePriority(buttonTraits.channels.root.stroke)] as const;
type ColorState = StateNames<typeof backgroundStateLevels> | StateNames<typeof foregroundStateLevels>;
type StrokeState = StateNames<typeof strokeStateLevels>;
type StrokeColorStyle = Pick<ViewColorStyle, 'borderColor'>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, typeof backgroundStateLevels> = {
  primary: {
    backgroundColor: 'backgroundBrandHeavy',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
    },
  },
  secondary: {
    backgroundColor: 'backgroundNeutralSubtle',
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
    selected: {
      backgroundColor: 'backgroundNeutralHeavy',
      disabled: {
        backgroundColor: 'backgroundNeutralHeavyDisabled',
      },
    },
  },
  subtle: {
    backgroundColor: 'backgroundNeutralTransparent',
    hovered: {
      backgroundColor: 'backgroundNeutralSubtle',
    },
    pressed: {
      backgroundColor: 'backgroundNeutralSubtle',
    },
    selected: {
      backgroundColor: 'backgroundNeutralSoft',
      disabled: {
        backgroundColor: 'backgroundNeutralSubtleDisabled',
      },
    },
  },
};

const strokeColorDefinition: ColorStyleDefinition<StrokeColorStyle, typeof strokeStateLevels> = {
  primary: {
    borderColor: 'strokeNeutralTransparent',
  },
  secondary: {
    borderColor: 'strokeNeutralTransparent',
  },
  outline: {
    borderColor: 'strokeNeutralLoud',
    selected: {
      borderColor: 'strokeNeutralHeavy',
      disabled: {
        borderColor: 'strokeNeutralDisabled',
      },
    },
    disabled: {
      borderColor: 'strokeNeutralDisabled',
    },
  },
  subtle: {
    borderColor: 'strokeNeutralTransparent',
  },
};

const foregroundColorDefinition: ColorStyleDefinition<TextColorStyle, typeof foregroundStateLevels> = {
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

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, typeof backgroundStateLevels>(
  'Button.background',
  backgroundColorDefinition,
  backgroundStateLevels,
);
const getThemedStrokeStyle = getThemedColorStyleFactory<StrokeColorStyle, typeof strokeStateLevels>(
  'Button.stroke',
  strokeColorDefinition,
  strokeStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, typeof foregroundStateLevels>(
  'Button.foreground',
  foregroundColorDefinition,
  foregroundStateLevels,
);

function getStrokeStateSource(state: ButtonState): StrokeState[] {
  const source: StrokeState[] = [state.appearance];
  if (state.selected) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  }
  return source;
}

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
  if (state.hovered && resolveHoverMode(buttonTraits.hover, state.appearance) !== 'suppressed') {
    source.push('hovered');
  }
  return source;
}

export function getButtonColorStyles(state: ButtonState): {
  background: ViewColorStyle;
  stroke: StrokeColorStyle;
  foreground: TextColorStyle;
} {
  const source = getColorStateSource(state);
  return {
    background: getThemedBackgroundStyle(state, source),
    stroke: getThemedStrokeStyle(state, getStrokeStateSource(state)),
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

function createRootStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  const { borderRadius, spacing } = tokens;
  const { radius, strokeWidth } = buttonTraits.geometry.root;
  return {
    borderWidth: getStrokeWidthStyleValue(tokens, strokeWidth),
    minHeight: size240,
    minWidth: size240,
    small: createSizeStyle(
      getRadiusStyleValue(tokens, radius, 'small'),
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
      getRadiusStyleValue(tokens, radius, 'medium'),
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
      getRadiusStyleValue(tokens, radius, 'large'),
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

function createContentStyleDefinition(tokens: FlexTokens): StyleDefinition<TextStyle, ContentStyleStateLevels> {
  // Selection reserves semibold label width structurally (BTN-005), so it is not a typography trait.
  const selected: TextStyle = { fontWeight: tokens.fontWeight.functionalSemibold };
  const typography = buttonTraits.typography.content;
  return {
    small: { ...functionalTypography(tokens, 'functionalBodySmall', typography), selected },
    medium: { ...functionalTypography(tokens, 'functionalBodyMedium', typography), selected },
    large: { ...functionalTypography(tokens, 'functionalBodyLarge', typography), selected },
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

const iconSizes: Record<ButtonSize, number> = {
  small: size160,
  medium: size200,
  large: size200,
};

export function getButtonIconSize(size: ButtonSize): number {
  return iconSizes[size];
}
