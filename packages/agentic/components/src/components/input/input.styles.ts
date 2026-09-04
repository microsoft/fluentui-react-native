import { StyleSheet } from 'react-native';
import type { ColorValue, TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import type { ThemeState } from '@fluentui-react-native/design';
import { getNumericStyleValueAsNumber as toNumber, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { StyleDefinition } from '@fluentui-react-native/design/styling';
import { cornerRadiusNone, size160, size200, size240 } from '@fluentui-react-native/design/tokens/global';

import type { InputSize, InputVariant, InputVisualState } from './input.types';

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
    paddingHorizontal: 0,
    textAlignVertical: 'center',
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

function getMetrics(tokens: FlexTokens, size: InputSize) {
  const { fontSize, lineHeight, spacing } = tokens;
  const metrics = {
    small: {
      height: toNumber(lineHeight.functionalBodySmall) + toNumber(spacing.componentBase100) * 2,
      horizontalPadding: toNumber(spacing.componentBase150),
      iconSize: toNumber(size160),
      textFontSize: toNumber(fontSize.functionalBodySmall),
      textLineHeight: toNumber(lineHeight.functionalBodySmall),
      verticalPadding: toNumber(spacing.componentBase100),
    },
    medium: {
      height: toNumber(lineHeight.functionalBodyMedium) + toNumber(spacing.componentBase150) * 2,
      horizontalPadding: toNumber(spacing.componentBase250),
      iconSize: toNumber(size200),
      textFontSize: toNumber(fontSize.functionalBodyMedium),
      textLineHeight: toNumber(lineHeight.functionalBodyMedium),
      verticalPadding: toNumber(spacing.componentBase150),
    },
    large: {
      height: toNumber(lineHeight.functionalBodyLarge) + toNumber(spacing.componentBase200) * 2,
      horizontalPadding: toNumber(spacing.componentBase300),
      iconSize: toNumber(size240),
      textFontSize: toNumber(fontSize.functionalBodyLarge),
      textLineHeight: toNumber(lineHeight.functionalBodyLarge),
      verticalPadding: toNumber(spacing.componentBase200),
    },
  } as const;

  return metrics[size];
}

function createRootStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, RootStateLevels> {
  const { borderRadius } = tokens;
  return {
    outline: {
      small: { borderRadius: toNumber(borderRadius.base200) },
      medium: { borderRadius: toNumber(borderRadius.base300) },
      large: { borderRadius: toNumber(borderRadius.base400) },
    },
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
  const { color, strokeWidth } = tokens;
  const outlineBase = {
    borderWidth: toNumber(strokeWidth.thin),
  };
  const underlineBase = {
    borderWidth: 0,
  };
  const outlineStates = {
    disabled: { borderColor: color.strokeNeutralDisabled },
    error: { borderColor: color.strokeDangerLoud },
    focused: { borderColor: color.strokeNeutralHeavy },
    hovered: { borderColor: color.hover.strokeNeutralLoud },
    pressed: { borderColor: color.pressed.strokeNeutralLoud },
    readOnly: { borderColor: color.strokeNeutralDisabled },
    rest: { borderColor: color.strokeNeutralLoud },
  } satisfies Record<InputVisualState, ViewStyle>;
  const underlineStates = {
    disabled: { borderBottomColor: color.strokeNeutralDisabled },
    error: { borderBottomColor: color.strokeDangerLoud },
    focused: { borderBottomColor: color.strokeNeutralHeavy },
    hovered: { borderBottomColor: color.hover.strokeNeutralLoud },
    pressed: { borderBottomColor: color.pressed.strokeNeutralLoud },
    readOnly: { borderBottomColor: color.strokeNeutralDisabled },
    rest: { borderBottomColor: color.strokeNeutralLoud },
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
  const { color, fontFamily } = tokens;
  const small = getMetrics(tokens, 'small');
  const medium = getMetrics(tokens, 'medium');
  const large = getMetrics(tokens, 'large');
  const base = {
    color: color.foregroundNeutralPrimary,
    fontFamily: fontFamily.functional,
    paddingHorizontal: 0,
  };

  return {
    small: {
      ...base,
      fontSize: small.textFontSize,
      lineHeight: small.textLineHeight,
      paddingVertical: small.verticalPadding,
      disabled: {
        color: color.foregroundNeutralDisabled,
      },
    },
    medium: {
      ...base,
      fontSize: medium.textFontSize,
      lineHeight: medium.textLineHeight,
      paddingVertical: medium.verticalPadding,
      disabled: {
        color: color.foregroundNeutralDisabled,
      },
    },
    large: {
      ...base,
      fontSize: large.textFontSize,
      lineHeight: large.textLineHeight,
      paddingVertical: large.verticalPadding,
      disabled: {
        color: color.foregroundNeutralDisabled,
      },
    },
  };
}

function createUnderlineDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, VisualStateLevels> {
  const { strokeWidth } = tokens;
  const base = {
    bottom: 0,
    left: 0,
    position: 'absolute' as const,
    right: 0,
  };
  return {
    disabled: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
    error: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
    focused: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
    hovered: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
    pressed: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
    readOnly: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
    rest: { ...base, borderBottomWidth: toNumber(strokeWidth.thin) },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Input.root', createRootStyleDefinition, rootStateLevels);
const getThemedContentsLayoutStyle = getThemedStateStyleFactory('Input.contentsLayout', createContentsLayoutDefinition, contentStateLevels);
const getThemedContentsStrokeStyle = getThemedStateStyleFactory('Input.contentsStroke', createContentsStrokeDefinition, contentStateLevels);
const getThemedIconTextStackStyle = getThemedStateStyleFactory('Input.iconTextStack', createIconTextStackDefinition, textStateLevels);
const getThemedIconEndStyle = getThemedStateStyleFactory('Input.iconEnd', createIconEndDefinition, textStateLevels);
const getThemedTextInputStyle = getThemedStateStyleFactory('Input.textInput', createTextInputDefinition, textStateLevels);
const getThemedUnderlineStyle = getThemedStateStyleFactory('Input.underline', createUnderlineDefinition, visualStateLevels);

export type InputResolvedStyles = {
  root: ViewStyle;
  contents: ViewStyle;
  iconTextStack: ViewStyle;
  iconEnd: ViewStyle;
  underline: ViewStyle;
  textInput: TextStyle;
  iconSize: number;
  iconColor: ColorValue;
  placeholderTextColor: ColorValue;
};

export function getInputResolvedStyles(
  state: ThemeState & { tokens: FlexTokens; size: InputSize; variant: InputVariant; visualState: InputVisualState },
): InputResolvedStyles {
  const metrics = getMetrics(state.tokens, state.size);
  const root = getThemedRootStyle(state, [state.variant, state.size]);
  const contents = {
    ...inputStyles.contents,
    ...getThemedContentsLayoutStyle(state, [state.variant, state.size]),
    ...getThemedContentsStrokeStyle(state, [state.variant, state.size, state.visualState]),
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
    ...getThemedContentsStrokeStyle(state, ['underline', state.size, state.visualState]),
  };
  const textInput = {
    ...inputStyles.textInput,
    ...getThemedTextInputStyle(state, [state.size, state.visualState]),
  };
  const iconColor = textInput.color ?? state.tokens.color.foregroundNeutralPrimary;
  const placeholderTextColor =
    state.visualState === 'disabled'
      ? state.tokens.color.foregroundNeutralDisabled
      : state.visualState === 'readOnly'
        ? state.tokens.color.foregroundNeutralPrimary
        : state.tokens.color.foregroundNeutralTertiary;

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
  };
}
