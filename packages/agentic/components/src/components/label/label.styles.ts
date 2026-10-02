import { StyleSheet } from 'react-native';
import type { TextStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';
import { getGapStyleValue, getThemedColorStyleFactory, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StyleDefinition, TextColorStyle } from '@fluentui-react-native/design/styling';

import type { LabelState } from './label.types';

export const labelStyles = StyleSheet.create({
  content: { flexShrink: 1 },
  requiredIndicator: { flexShrink: 0 },
});

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

const sizeLevels = [['small', 'medium', 'large']] as const;
const getThemedSizeStyle = getThemedStateStyleFactory(
  'Label.size',
  ({ fontFamily, fontSize, lineHeight }: FlexTokens): StyleDefinition<TextStyle, typeof sizeLevels> => ({
    fontFamily: fontFamily.functional,
    small: { fontSize: fontSize.functionalBodySmall, lineHeight: lineHeight.functionalBodySmall },
    medium: { fontSize: fontSize.functionalBodyMedium, lineHeight: lineHeight.functionalBodyMedium },
    large: { fontSize: fontSize.functionalBodyLarge, lineHeight: lineHeight.functionalBodyLarge },
  }),
  sizeLevels,
);

const weightLevels = [['regular', 'strong']] as const;
const getThemedWeightStyle = getThemedStateStyleFactory(
  'Label.weight',
  ({ fontWeight }: FlexTokens): StyleDefinition<TextStyle, typeof weightLevels> => ({
    regular: { fontWeight: fontWeight.functionalRegular },
    strong: { fontWeight: fontWeight.functionalSemibold },
  }),
  weightLevels,
);

const colorLevels = [['disabled', 'rest']] as const;
const contentColors: ColorStyleDefinition<TextColorStyle, typeof colorLevels> = {
  rest: { color: 'foregroundNeutralPrimary' },
  disabled: { color: 'foregroundNeutralDisabled' },
};
const indicatorColors: ColorStyleDefinition<TextColorStyle, typeof colorLevels> = {
  rest: { color: 'foregroundDangerPrimary' },
  disabled: { color: 'foregroundNeutralDisabled' },
};
const getThemedContentColor = getThemedColorStyleFactory<TextColorStyle, typeof colorLevels>('Label.content', contentColors, colorLevels);
const getThemedIndicatorColor = getThemedColorStyleFactory<TextColorStyle, typeof colorLevels>(
  'Label.requiredIndicator',
  indicatorColors,
  colorLevels,
);

export function getLabelTypography(state: LabelState) {
  return [getThemedSizeStyle(state, [state.size]), getThemedWeightStyle(state, [state.weight])];
}

export function getLabelContentColor(state: LabelState) {
  return getThemedContentColor(state, [state.disabled ? 'disabled' : 'rest']);
}

export function getLabelIndicatorColor(state: LabelState) {
  return getThemedIndicatorColor(state, [state.disabled ? 'disabled' : 'rest']);
}
