import { StyleSheet } from 'react-native';
import type { DimensionValue, TextStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import { getNumericStyleValue, getThemedColorStyleFactory, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StateNames, StyleDefinition, TextColorStyle } from '@fluentui-react-native/design/styling';

import type { LinkState } from './link.types';

/** Rendered height of the trailing glyph. Recorded as the `link-icon-size` token gap. */
export const linkIconSize = 16;

export const linkStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
  },
  decorationHidden: {
    textDecorationLine: 'none',
  },
  decorationFunctional: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'solid',
  },
  // The dotted style is requested because it is the correct React Native property. Neither target
  // platform honors it, which is recorded as the `link-underline-style` token gap.
  decorationContent: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
  },
});

const rootStateLevels = [['disabled', 'focused']] as const;
type RootStateLevels = typeof rootStateLevels;
type RootState = StateNames<RootStateLevels>;

/**
 * Holds the focus border transparently at rest so gaining focus repaints it without moving the text.
 * `FocusVisual` composes nested views and cannot sit inside a text run, so one border stands in for the
 * universal dual ring.
 */
function createRootStyleDefinition({ borderRadius, color, strokeWidth }: FlexTokens): StyleDefinition<TextStyle, RootStateLevels> {
  return {
    borderColor: 'transparent',
    borderRadius: borderRadius.base100,
    borderWidth: strokeWidth.thick,
    disabled: { borderColor: 'transparent' },
    focused: { borderColor: color.strokeFocusOuter },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Link.root', createRootStyleDefinition, rootStateLevels);

export function getLinkRootStyle(state: LinkState): TextStyle {
  const source: RootState[] = [];
  if (state.disabled) {
    source.push('disabled');
  }
  if (state.focused) {
    source.push('focused');
  }
  return getThemedRootStyle(state, source);
}

const foregroundStateLevels = [['disabled', 'pressed']] as const;
type ForegroundStateLevels = typeof foregroundStateLevels;
type ForegroundState = StateNames<ForegroundStateLevels>;

/**
 * Rest foreground is the same neutral color the surrounding body text uses, so the underline rather
 * than the color carries the affordance. The pressed value is synthesized by the color factory from the
 * theme's pressed override of the rest token.
 */
const foregroundDefinition: ColorStyleDefinition<TextColorStyle, ForegroundStateLevels> = {
  color: 'foregroundNeutralPrimary',
  disabled: { color: 'foregroundNeutralDisabled' },
};

const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ForegroundStateLevels>(
  'Link.foreground',
  foregroundDefinition,
  foregroundStateLevels,
);

export function getLinkForegroundStyle(state: LinkState): TextColorStyle {
  const source: ForegroundState[] = [];
  if (state.disabled) {
    source.push('disabled');
  }
  if (state.pressed) {
    source.push('pressed');
  }
  return getThemedForegroundStyle(state, source);
}

const typographyStateLevels = [['content', 'functional']] as const;
type TypographyStateLevels = typeof typographyStateLevels;

function createTypographyStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, TypographyStateLevels> {
  return {
    content: {
      fontFamily: fontFamily.content,
      fontSize: fontSize.contentParagraphMedium,
      fontWeight: fontWeight.contentRegular,
      lineHeight: lineHeight.contentParagraphMedium,
    },
    functional: {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
    },
  };
}

const getThemedTypographyStyle = getThemedStateStyleFactory('Link.typography', createTypographyStyleDefinition, typographyStateLevels);

export function getLinkTypographyStyle(state: LinkState): TextStyle {
  return getThemedTypographyStyle(state, [state.typeSet]);
}

export function getLinkDecorationStyle(state: LinkState): TextStyle {
  if (!state.underlined) {
    return linkStyles.decorationHidden;
  }
  return state.typeSet === 'content' ? linkStyles.decorationContent : linkStyles.decorationFunctional;
}

function toGapValue(value: DimensionValue): number {
  return Number(getNumericStyleValue(value));
}

/**
 * The text engine lays `Text` children out without `gap`, so the label-to-glyph spacing is carried as
 * horizontal space inside the glyph's own inline box.
 */
export function getLinkIconMetrics(tokens: FlexTokens): { height: number; width: number } {
  const gap = toGapValue(tokens.spacing.componentBase50);
  return { height: linkIconSize, width: linkIconSize + gap * 2 };
}
