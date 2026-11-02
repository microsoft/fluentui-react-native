import { StyleSheet } from 'react-native';
import type { ColorValue, TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import {
  functionalTypography,
  getNumericStyleValue,
  getRadiusStyleValue,
  getStrokeWidthStyleValue,
  getThemedStateStyleFactory,
} from '@fluentui-react-native/design/styling';
import type { StyleDefinition } from '@fluentui-react-native/design/styling';
import { cornerRadiusNone, size160, size200, size240 } from '@fluentui-react-native/design/tokens/global';

import type { InputSize, InputVariant, InputVisualState } from './input.types';
import { inputTraits } from './spec/traits';

export const inputStyles = StyleSheet.create({
  root: {
    alignSelf: 'stretch',
    flexDirection: 'column',
    overflow: 'hidden',
  },
  contents: {
    alignItems: 'center',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    flexDirection: 'row',
    overflow: 'hidden',
    position: 'relative',
  },
  iconTextStack: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  iconEnd: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    minWidth: 0,
  },
  textInput: {
    backgroundColor: 'transparent',
    borderWidth: 0,
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
    padding: 0,
  },
  underline: {
    left: 0,
    position: 'absolute',
    right: 0,
    bottom: 0,
  },
});

const rootStateLevels = [
  ['outline', 'underline'],
  ['small', 'medium', 'large'],
] as const;
const contentStateLevels = [
  ['outline', 'underline'],
  ['small', 'medium', 'large'],
  ['disabled', 'error', 'readOnly', 'focused', 'pressed', 'hovered', 'rest'],
] as const;
const textStateLevels = [
  ['small', 'medium', 'large'],
  ['disabled', 'error', 'readOnly', 'focused', 'pressed', 'hovered', 'rest'],
] as const;
const visualStateLevels = [['disabled', 'error', 'readOnly', 'focused', 'pressed', 'hovered', 'rest']] as const;

type RootStateLevels = typeof rootStateLevels;
type ContentStateLevels = typeof contentStateLevels;
type TextStateLevels = typeof textStateLevels;
type VisualStateLevels = typeof visualStateLevels;

const toNumber = (value: unknown): number => Number(getNumericStyleValue(value));

function getMetrics(tokens: FlexTokens, size: InputSize) {
  const { lineHeight, spacing } = tokens;
  const metrics = {
    small: {
      height: toNumber(lineHeight.functionalBodySmall) + toNumber(spacing.componentBase100) * 2,
      horizontalPadding: toNumber(spacing.componentBase150),
      iconSize: toNumber(size160),
      textRole: 'functionalBodySmall',
      verticalPadding: toNumber(spacing.componentBase100),
    },
    medium: {
      height: toNumber(lineHeight.functionalBodyMedium) + toNumber(spacing.componentBase150) * 2,
      horizontalPadding: toNumber(spacing.componentBase250),
      iconSize: toNumber(size200),
      textRole: 'functionalBodyMedium',
      verticalPadding: toNumber(spacing.componentBase150),
    },
    large: {
      height: toNumber(lineHeight.functionalBodyLarge) + toNumber(spacing.componentBase200) * 2,
      horizontalPadding: toNumber(spacing.componentBase300),
      iconSize: toNumber(size240),
      textRole: 'functionalBodyLarge',
      verticalPadding: toNumber(spacing.componentBase200),
    },
  } as const;

  return metrics[size];
}

function createRootStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, RootStateLevels> {
  const { radius } = inputTraits.geometry.root;
  return {
    outline: {
      small: { borderRadius: toNumber(getRadiusStyleValue(tokens, radius, 'small')) },
      medium: { borderRadius: toNumber(getRadiusStyleValue(tokens, radius, 'medium')) },
      large: { borderRadius: toNumber(getRadiusStyleValue(tokens, radius, 'large')) },
    },
    // The underline variant draws only a bottom stroke, so its corners stay square.
    underline: {
      small: { borderRadius: cornerRadiusNone },
      medium: { borderRadius: cornerRadiusNone },
      large: { borderRadius: cornerRadiusNone },
    },
  };
}

function createContentsLayoutDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, ContentStateLevels> {
  const { spacing } = tokens;
  const metrics = {
    small: { height: getMetrics(tokens, 'small').height, gap: toNumber(spacing.componentBase250) },
    medium: { height: getMetrics(tokens, 'medium').height, gap: toNumber(spacing.componentBase250) },
    large: { height: getMetrics(tokens, 'large').height, gap: toNumber(spacing.componentBase250) },
  } as const;

  return {
    outline: {
      small: {
        gap: metrics.small.gap,
        minHeight: metrics.small.height,
      },
      medium: {
        gap: metrics.medium.gap,
        minHeight: metrics.medium.height,
      },
      large: {
        gap: metrics.large.gap,
        minHeight: metrics.large.height,
      },
    },
    underline: {
      small: {
        gap: metrics.small.gap,
        minHeight: metrics.small.height,
      },
      medium: {
        gap: metrics.medium.gap,
        minHeight: metrics.medium.height,
      },
      large: {
        gap: metrics.large.gap,
        minHeight: metrics.large.height,
      },
    },
  };
}

function createContentsStrokeDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, ContentStateLevels> {
  const { color } = tokens;
  const { strokeWidth } = inputTraits.geometry.contents;
  const outlineBase = {
    borderWidth: toNumber(getStrokeWidthStyleValue(tokens, strokeWidth, 'outline')),
  };
  const underlineBase = {
    borderWidth: toNumber(getStrokeWidthStyleValue(tokens, strokeWidth, 'underline')),
  };
  const outlineStates = {
    disabled: { borderColor: color.strokeNeutralDisabled.rest },
    error: { borderColor: color.strokeDangerLoud.rest },
    focused: { borderColor: color.strokeNeutralSubtle.rest },
    hovered: { borderColor: color.strokeNeutralLoud.hover },
    pressed: { borderColor: color.strokeNeutralLoud.pressed },
    readOnly: { borderColor: color.strokeNeutralDisabled.rest },
    rest: { borderColor: color.strokeNeutralLoud.rest },
  } satisfies Record<InputVisualState, ViewStyle>;
  const underlineStates = {
    disabled: { borderBottomColor: color.strokeNeutralDisabled.rest },
    error: { borderBottomColor: color.strokeDangerLoud.rest },
    focused: { borderBottomColor: color.strokeFocusOuter.rest },
    hovered: { borderBottomColor: color.strokeNeutralLoud.hover },
    pressed: { borderBottomColor: color.strokeNeutralLoud.pressed },
    readOnly: { borderBottomColor: color.strokeNeutralDisabled.rest },
    rest: { borderBottomColor: color.strokeNeutralLoud.rest },
  } satisfies Record<InputVisualState, ViewStyle>;

  function createSizeBranch(base: ViewStyle, states: Record<InputVisualState, ViewStyle>) {
    return {
      disabled: { ...base, ...states.disabled },
      error: { ...base, ...states.error },
      focused: { ...base, ...states.focused },
      hovered: { ...base, ...states.hovered },
      pressed: { ...base, ...states.pressed },
      readOnly: { ...base, ...states.readOnly },
      rest: { ...base, ...states.rest },
    };
  }

  return {
    outline: {
      small: createSizeBranch(outlineBase, outlineStates),
      medium: createSizeBranch(outlineBase, outlineStates),
      large: createSizeBranch(outlineBase, outlineStates),
    },
    underline: {
      small: createSizeBranch(underlineBase, underlineStates),
      medium: createSizeBranch(underlineBase, underlineStates),
      large: createSizeBranch(underlineBase, underlineStates),
    },
  };
}

function createIconTextStackDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, typeof textStateLevels> {
  const { spacing } = tokens;
  return {
    small: {
      gap: toNumber(spacing.componentBase250),
      paddingHorizontal: toNumber(spacing.componentBase150),
    },
    medium: {
      gap: toNumber(spacing.componentBase250),
      paddingHorizontal: toNumber(spacing.componentBase250),
    },
    large: {
      gap: toNumber(spacing.componentBase250),
      paddingHorizontal: toNumber(spacing.componentBase300),
    },
  };
}

function createIconEndDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, typeof textStateLevels> {
  const { spacing } = tokens;
  return {
    small: {
      gap: toNumber(spacing.componentBase100),
      paddingRight: toNumber(spacing.componentBase150),
    },
    medium: {
      gap: toNumber(spacing.componentBase100),
      paddingRight: toNumber(spacing.componentBase250),
    },
    large: {
      gap: toNumber(spacing.componentBase100),
      paddingRight: toNumber(spacing.componentBase300),
    },
  };
}

function createTextInputDefinition(tokens: FlexTokens): StyleDefinition<TextStyle, TextStateLevels> {
  const { color } = tokens;
  const small = getMetrics(tokens, 'small');
  const medium = getMetrics(tokens, 'medium');
  const large = getMetrics(tokens, 'large');
  const typography = inputTraits.typography.textInput;
  const foreground = { color: color.foregroundNeutralPrimary.rest };

  return {
    small: {
      ...foreground,
      ...functionalTypography(tokens, small.textRole, typography),
      marginVertical: small.verticalPadding,
      disabled: {
        color: color.foregroundNeutralDisabled.rest,
      },
    },
    medium: {
      ...foreground,
      ...functionalTypography(tokens, medium.textRole, typography),
      marginVertical: medium.verticalPadding,
      disabled: {
        color: color.foregroundNeutralDisabled.rest,
      },
    },
    large: {
      ...foreground,
      ...functionalTypography(tokens, large.textRole, typography),
      marginVertical: large.verticalPadding,
      disabled: {
        color: color.foregroundNeutralDisabled.rest,
      },
    },
  };
}

function getUnderlineWidth(tokens: FlexTokens): number {
  return toNumber(getStrokeWidthStyleValue(tokens, inputTraits.geometry.underline.strokeWidth));
}

function createUnderlineDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, VisualStateLevels> {
  const base = {
    bottom: 0,
    borderBottomWidth: getUnderlineWidth(tokens),
    left: 0,
    position: 'absolute' as const,
    right: 0,
  };
  return {
    disabled: base,
    error: base,
    focused: base,
    hovered: base,
    pressed: base,
    readOnly: base,
    rest: base,
  };
}

// The focus underline sits directly above the underline and matches its width.
function createUnderlineFocusDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, VisualStateLevels> {
  const width = getUnderlineWidth(tokens);
  return {
    bottom: width,
    left: 0,
    right: 0,
    position: 'absolute',
    borderBottomWidth: width,
    borderBottomColor: tokens.color.strokeFocusOuter.rest,
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Input.root', createRootStyleDefinition, rootStateLevels);
const getThemedContentsLayoutStyle = getThemedStateStyleFactory('Input.contentsLayout', createContentsLayoutDefinition, contentStateLevels);
const getThemedContentsStrokeStyle = getThemedStateStyleFactory('Input.contentsStroke', createContentsStrokeDefinition, contentStateLevels);
const getThemedIconTextStackStyle = getThemedStateStyleFactory('Input.iconTextStack', createIconTextStackDefinition, textStateLevels);
const getThemedIconEndStyle = getThemedStateStyleFactory('Input.iconEnd', createIconEndDefinition, textStateLevels);
const getThemedTextInputStyle = getThemedStateStyleFactory('Input.textInput', createTextInputDefinition, textStateLevels);
const getThemedUnderlineStyle = getThemedStateStyleFactory('Input.underline', createUnderlineDefinition, visualStateLevels);
const getThemedUnderlineFocusStyle = getThemedStateStyleFactory('Input.underlineFocus', createUnderlineFocusDefinition, visualStateLevels);

export type InputResolvedStyles = {
  root: ViewStyle;
  contents: ViewStyle;
  iconTextStack: ViewStyle;
  iconEnd: ViewStyle;
  underline: ViewStyle;
  underlineFocus: ViewStyle;
  textInput: TextStyle;
  iconSize: number;
  iconColor: ColorValue;
  placeholderTextColor: ColorValue;
};

/** Resolves Input's visual state from its interaction state, in the precedence its style levels apply. */
export function getInputVisualState(state: {
  disabled: boolean;
  error: boolean;
  readOnly: boolean;
  focused: boolean;
  pressed: boolean;
  hovered: boolean;
}): InputVisualState {
  if (state.disabled) {
    return 'disabled';
  }
  if (state.error) {
    return 'error';
  }
  if (state.readOnly) {
    return 'readOnly';
  }
  if (state.focused) {
    return 'focused';
  }
  if (state.pressed) {
    return 'pressed';
  }
  if (state.hovered) {
    return 'hovered';
  }
  return 'rest';
}

export function getInputResolvedStyles(
  state: ThemeState & { tokens: FlexTokens; size: InputSize; variant: InputVariant; visualState: InputVisualState; focusVisible?: boolean },
): InputResolvedStyles {
  const focusVisible = state.visualState !== 'disabled' && (state.focusVisible ?? state.visualState === 'focused');
  const strokeState = state.visualState === 'focused' && !focusVisible ? 'rest' : state.visualState;
  const metrics = getMetrics(state.tokens, state.size);
  const root = getThemedRootStyle(state, [state.variant, state.size]);
  const contents = {
    ...inputStyles.contents,
    ...getThemedContentsLayoutStyle(state, [state.variant, state.size]),
    ...getThemedContentsStrokeStyle(state, [state.variant, state.size, strokeState]),
  };
  const iconTextStack = {
    ...inputStyles.iconTextStack,
    ...getThemedIconTextStackStyle(state, [state.size]),
  };
  const iconEnd = {
    ...inputStyles.iconEnd,
    ...getThemedIconEndStyle(state, [state.size]),
  };
  const underline = {
    ...inputStyles.underline,
    ...getThemedUnderlineStyle(state, [state.visualState]),
    ...getThemedContentsStrokeStyle(state, ['underline', state.size, strokeState]),
  };
  const underlineFocus = {
    ...getThemedUnderlineFocusStyle(state, []),
    opacity: focusVisible ? 1 : 0,
  };
  const textInput = {
    ...inputStyles.textInput,
    ...getThemedTextInputStyle(state, [state.size, state.visualState]),
  };
  const iconColor = textInput.color ?? state.tokens.color.foregroundNeutralPrimary.rest;
  const placeholderTextColor =
    state.visualState === 'disabled'
      ? state.tokens.color.foregroundNeutralDisabled.rest
      : state.visualState === 'readOnly'
        ? state.tokens.color.foregroundNeutralPrimary.rest
        : state.tokens.color.foregroundNeutralTertiary.rest;

  return {
    contents,
    iconColor,
    iconEnd,
    iconSize: metrics.iconSize,
    iconTextStack,
    placeholderTextColor,
    root,
    textInput,
    underline,
    underlineFocus,
  };
}
