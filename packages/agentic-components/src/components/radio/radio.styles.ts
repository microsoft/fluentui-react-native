import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import {
  getNumericStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  interactiveStatePriority,
} from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StyleDefinition, TextColorStyle, ViewColorStyle } from '@fluentui-react-native/design/styling';
import type { RadioState } from './radio.types';

export const radioStyles = StyleSheet.create({
  indicator: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  dot: {
    flexShrink: 0,
  },
  label: {
    flexShrink: 1,
  },
  labelContainer: {
    flexShrink: 1,
    justifyContent: 'center',
    minWidth: 0,
  },
  root: {
    alignSelf: 'flex-start',
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 1,
    justifyContent: 'flex-start',
  },
  secondaryText: {
    flexShrink: 1,
  },
});

const noStateLevels = [[]] as const;
const selectionStateLevels = [['selected'], interactiveStatePriority] as const;
const focusStateLevels = [['focused']] as const;
type RadioColorState = 'selected' | 'disabled' | 'pressed' | 'hovered';

const toDimensionValue = (value: unknown): number => Number(getNumericStyleValue(value));

const getRadioRootLayoutStyle = getThemedStateStyleFactory(
  'Radio.rootLayout',
  ({ borderRadius, color, spacing }: FlexTokens): StyleDefinition<ViewStyle, typeof noStateLevels> => ({
    backgroundColor: color.backgroundNeutralTransparent,
    borderRadius: borderRadius.base300,
    gap: toDimensionValue(spacing.componentBase100),
  }),
  noStateLevels,
);

const getRadioIndicatorLayoutStyle = getThemedStateStyleFactory(
  'Radio.indicatorLayout',
  ({ color, spacing, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof noStateLevels> => ({
    backgroundColor: color.backgroundNeutralTransparent,
    borderRadius: 8,
    borderStyle: 'solid',
    borderWidth: strokeWidth.thin,
    height: 16,
    margin: toDimensionValue(spacing.componentBase200),
    width: 16,
  }),
  noStateLevels,
);

const getRadioIndicatorDotLayoutStyle = getThemedStateStyleFactory(
  'Radio.indicatorDotLayout',
  (): StyleDefinition<ViewStyle, typeof noStateLevels> => ({
    borderRadius: 5,
    height: 10,
    width: 10,
  }),
  noStateLevels,
);

const getRadioLabelContainerLayoutStyle = getThemedStateStyleFactory(
  'Radio.labelContainerLayout',
  ({ spacing }: FlexTokens): StyleDefinition<ViewStyle, typeof noStateLevels> => ({
    gap: toDimensionValue(spacing.componentBase50),
    paddingEnd: toDimensionValue(spacing.componentBase200),
    paddingVertical: toDimensionValue(spacing.componentBase150),
  }),
  noStateLevels,
);

const getRadioLabelTypographyStyle = getThemedStateStyleFactory(
  'Radio.labelTypography',
  ({ fontFamily, fontSize, fontWeight, lineHeight }: FlexTokens): StyleDefinition<TextStyle, typeof noStateLevels> => ({
    fontFamily: fontFamily.functional,
    fontSize: fontSize.functionalBodyMedium,
    fontWeight: fontWeight.functionalRegular,
    lineHeight: lineHeight.functionalBodyMedium,
  }),
  noStateLevels,
);

const getRadioSecondaryTypographyStyle = getThemedStateStyleFactory(
  'Radio.secondaryTypography',
  ({ fontFamily, fontSize, fontWeight, lineHeight }: FlexTokens): StyleDefinition<TextStyle, typeof noStateLevels> => ({
    fontFamily: fontFamily.functional,
    fontSize: fontSize.functionalBodySmall,
    fontWeight: fontWeight.functionalRegular,
    lineHeight: lineHeight.functionalBodySmall,
  }),
  noStateLevels,
);

const getRadioFocusStyle = getThemedStateStyleFactory(
  'Radio.focus',
  ({ borderRadius, color, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof focusStateLevels> => ({
    focused: {
      borderColor: color.strokeFocusInner,
      borderRadius: borderRadius.base300,
      outlineColor: color.strokeFocusOuter,
      outlineOffset: strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: strokeWidth.thick,
    },
  }),
  focusStateLevels,
);

const indicatorBorderDefinition: ColorStyleDefinition<ViewColorStyle, typeof selectionStateLevels> = {
  borderColor: 'strokeNeutralHeavy',
  disabled: {
    borderColor: 'strokeNeutralDisabled',
  },
  selected: {
    borderColor: 'strokeBrandLoud',
    disabled: {
      borderColor: 'strokeNeutralDisabled',
    },
  },
};

const indicatorDotDefinition: ColorStyleDefinition<ViewColorStyle, typeof selectionStateLevels> = {
  backgroundColor: 'foregroundBrandPrimary',
  disabled: {
    backgroundColor: 'foregroundNeutralDisabled',
  },
  selected: {
    backgroundColor: 'foregroundBrandPrimary',
    disabled: {
      backgroundColor: 'foregroundNeutralDisabled',
    },
  },
};

const labelColorDefinition: ColorStyleDefinition<TextColorStyle, typeof selectionStateLevels> = {
  color: 'foregroundNeutralSecondary',
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
  selected: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const secondaryTextColorDefinition: ColorStyleDefinition<TextColorStyle, typeof selectionStateLevels> = {
  color: 'foregroundNeutralSecondary',
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
  selected: {
    color: 'foregroundNeutralSecondary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getRadioIndicatorBorderColor = getThemedColorStyleFactory<ViewColorStyle, typeof selectionStateLevels>(
  'Radio.indicatorBorder',
  indicatorBorderDefinition,
  selectionStateLevels,
);

const getRadioIndicatorDotColor = getThemedColorStyleFactory<ViewColorStyle, typeof selectionStateLevels>(
  'Radio.indicatorDot',
  indicatorDotDefinition,
  selectionStateLevels,
);

const getRadioLabelColor = getThemedColorStyleFactory<TextColorStyle, typeof selectionStateLevels>(
  'Radio.labelColor',
  labelColorDefinition,
  selectionStateLevels,
);

const getRadioSecondaryTextColor = getThemedColorStyleFactory<TextColorStyle, typeof selectionStateLevels>(
  'Radio.secondaryTextColor',
  secondaryTextColorDefinition,
  selectionStateLevels,
);

function getColorStateSource(state: RadioState): RadioColorState[] {
  const source: RadioColorState[] = [];
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

export function getRadioRootLayout(state: RadioState): ViewStyle {
  return getRadioRootLayoutStyle(state, []);
}

export function getRadioIndicatorLayout(state: RadioState): ViewStyle {
  return getRadioIndicatorLayoutStyle(state, []);
}

export function getRadioIndicatorDotLayout(state: RadioState): ViewStyle {
  return getRadioIndicatorDotLayoutStyle(state, []);
}

export function getRadioLabelContainerLayout(state: RadioState): ViewStyle {
  return getRadioLabelContainerLayoutStyle(state, []);
}

export function getRadioLabelTypography(state: RadioState): TextStyle {
  return getRadioLabelTypographyStyle(state, []);
}

export function getRadioSecondaryTypography(state: RadioState): TextStyle {
  return getRadioSecondaryTypographyStyle(state, []);
}

export function getRadioFocus(state: RadioState): ViewStyle | undefined {
  return state.focused && !state.disabled ? getRadioFocusStyle(state, ['focused']) : undefined;
}

export function getRadioIndicatorBorder(state: RadioState) {
  return getRadioIndicatorBorderColor(state, getColorStateSource(state));
}

export function getRadioIndicatorDotColorStyle(state: RadioState) {
  return getRadioIndicatorDotColor(state, getColorStateSource(state));
}

export function getRadioLabelColorStyle(state: RadioState) {
  return getRadioLabelColor(state, getColorStateSource(state));
}

export function getRadioSecondaryTextColorStyle(state: RadioState) {
  return getRadioSecondaryTextColor(state, getColorStateSource(state));
}
