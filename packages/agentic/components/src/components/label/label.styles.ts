import { StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';
import { getGapStyleValue, getThemedColorStyleFactory, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StyleDefinition, TextColorStyle } from '@fluentui-react-native/design/styling';

import type { LabelState } from './label.types';

export const labelStyles = StyleSheet.create({
  content: {
    flexShrink: 1,
  },
});

/**
 * Structural root styling. The gap between the label text and the required indicator is uniform across sizes so the
 * indicator keeps reading as part of the last word of the label.
 */
export const getLabelThemedStyles = themedStyleSheetFactory('Label.styles', ({ tokens }) =>
  StyleSheet.create({
    root: {
      alignItems: 'center',
      alignSelf: 'flex-start',
      flexDirection: 'row',
      gap: getGapStyleValue(tokens.spacing.componentBase50),
      padding: 0,
    },
  }),
);

const sizeStateLevels = [['small', 'medium', 'large']] as const;

const getThemedSizeStyle = getThemedStateStyleFactory(
  'Label.size',
  ({ fontFamily, fontSize, lineHeight }: FlexTokens): StyleDefinition<TextStyle, typeof sizeStateLevels> => ({
    fontFamily: fontFamily.functional,
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
  }),
  sizeStateLevels,
);

export function getLabelSizeStyle(state: LabelState): TextStyle {
  return getThemedSizeStyle(state, [state.size]);
}

const weightStateLevels = [['regular', 'strong']] as const;

const getThemedWeightStyle = getThemedStateStyleFactory(
  'Label.weight',
  ({ fontWeight }: FlexTokens): StyleDefinition<TextStyle, typeof weightStateLevels> => ({
    regular: {
      fontWeight: fontWeight.functionalRegular,
    },
    strong: {
      fontWeight: fontWeight.functionalSemibold,
    },
  }),
  weightStateLevels,
);

export function getLabelWeightStyle(state: LabelState): TextStyle {
  return getThemedWeightStyle(state, [state.weight]);
}

const colorStateLevels = [['rest', 'disabled']] as const;
type ColorStateLevels = typeof colorStateLevels;

const contentColorDefinition: ColorStyleDefinition<TextColorStyle, ColorStateLevels> = {
  rest: {
    color: 'foregroundNeutralPrimary',
  },
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
};

/**
 * The indicator loses its danger foreground while disabled because the whole field is unavailable.
 */
const requiredIndicatorColorDefinition: ColorStyleDefinition<TextColorStyle, ColorStateLevels> = {
  rest: {
    color: 'foregroundDangerPrimary',
  },
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
};

const getThemedContentColorStyle = getThemedColorStyleFactory<TextColorStyle, ColorStateLevels>(
  'Label.content',
  contentColorDefinition,
  colorStateLevels,
);
const getThemedRequiredIndicatorColorStyle = getThemedColorStyleFactory<TextColorStyle, ColorStateLevels>(
  'Label.requiredIndicator',
  requiredIndicatorColorDefinition,
  colorStateLevels,
);

function getColorStateSource(state: LabelState): ['rest' | 'disabled'] {
  return [state.disabled ? 'disabled' : 'rest'];
}

export function getLabelContentColorStyle(state: LabelState): TextColorStyle {
  return getThemedContentColorStyle(state, getColorStateSource(state));
}

export function getLabelRequiredIndicatorColorStyle(state: LabelState): TextColorStyle {
  return getThemedRequiredIndicatorColorStyle(state, getColorStateSource(state));
}
