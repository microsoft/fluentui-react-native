import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';
import {
  getGapStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  interactiveStatePriority,
} from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StyleDefinition, TextColorStyle, ViewColorStyle } from '@fluentui-react-native/design/styling';
import { size120, size160, size240 } from '@fluentui-react-native/design/tokens/global';

import type { CheckboxState } from './checkbox.types';

export const checkboxStyles = StyleSheet.create({
  indicator: {
    alignItems: 'center',
    borderStyle: 'solid',
    justifyContent: 'center',
  },
  labelContainer: {
    alignItems: 'flex-start',
    flexDirection: 'column',
    flexShrink: 1,
    justifyContent: 'center',
  },
  labelText: {
    flexShrink: 1,
  },
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  secondaryText: {
    flexShrink: 1,
  },
});

const rootStateLevels = [['withLabel', 'iconOnly']] as const;
const labelContainerStateLevels = [['withSecondaryText', 'withoutSecondaryText']] as const;
const indicatorShapeStateLevels = [['standard', 'circular']] as const;
const statusStateLevels = [['unchecked', 'checked', 'indeterminate'], interactiveStatePriority] as const;
const focusStateLevels = [['focused']] as const;

export const checkboxTextStyles = themedStyleSheetFactory('Checkbox.text', ({ tokens }) =>
  StyleSheet.create({
    label: {
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodyMedium,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodyMedium,
    },
    secondaryText: {
      fontFamily: tokens.fontFamily.functional,
      fontSize: tokens.fontSize.functionalBodySmall,
      fontWeight: tokens.fontWeight.functionalRegular,
      lineHeight: tokens.lineHeight.functionalBodySmall,
    },
  }),
);

function createIndicatorShapeDefinition({
  borderRadius,
  spacing,
  strokeWidth,
}: FlexTokens): StyleDefinition<ViewStyle, typeof indicatorShapeStateLevels> {
  return {
    circular: {
      borderRadius: borderRadius.circular,
      borderWidth: strokeWidth.thin,
      height: size160,
      marginVertical: spacing.componentBase200,
      width: size160,
    },
    standard: {
      borderRadius: borderRadius.base100,
      borderWidth: strokeWidth.thin,
      height: size160,
      marginVertical: spacing.componentBase200,
      width: size160,
    },
  };
}

const getIndicatorShapeStyle = getThemedStateStyleFactory(
  'Checkbox.indicatorShape',
  createIndicatorShapeDefinition,
  indicatorShapeStateLevels,
);

function createRootLayoutDefinition({ spacing }: FlexTokens): StyleDefinition<ViewStyle, typeof rootStateLevels> {
  return {
    iconOnly: {
      gap: 0,
      minHeight: size240,
      minWidth: size240,
    },
    withLabel: {
      gap: getGapStyleValue(spacing.componentBase100),
      minHeight: size240,
      minWidth: size240,
    },
  };
}

const getRootLayoutStyle = getThemedStateStyleFactory('Checkbox.rootLayout', createRootLayoutDefinition, rootStateLevels);

function createLabelContainerDefinition({ spacing }: FlexTokens): StyleDefinition<ViewStyle, typeof labelContainerStateLevels> {
  return {
    withSecondaryText: {
      gap: getGapStyleValue(spacing.componentBase50),
      paddingEnd: spacing.componentBase200,
      paddingVertical: spacing.componentBase150,
    },
    withoutSecondaryText: {
      paddingEnd: spacing.componentBase200,
      paddingVertical: spacing.componentBase150,
    },
  };
}

const getLabelContainerLayoutStyle = getThemedStateStyleFactory(
  'Checkbox.labelContainer',
  createLabelContainerDefinition,
  labelContainerStateLevels,
);

const getFocusRingStyle = getThemedStateStyleFactory(
  'Checkbox.focus',
  ({ color, borderRadius, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof focusStateLevels> => ({
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

const indicatorColorDefinition: ColorStyleDefinition<ViewColorStyle, typeof statusStateLevels> = {
  backgroundColor: 'backgroundNeutralTransparent',
  borderColor: 'strokeNeutralHeavy',
  checked: {
    backgroundColor: 'backgroundBrandHeavy',
    borderColor: 'strokeNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
      borderColor: 'strokeNeutralTransparent',
    },
    hovered: {
      backgroundColor: 'backgroundBrandHeavy',
      borderColor: 'strokeNeutralTransparent',
    },
    pressed: {
      backgroundColor: 'backgroundBrandHeavy',
      borderColor: 'strokeNeutralTransparent',
    },
  },
  disabled: {
    backgroundColor: 'backgroundNeutralTransparent',
    borderColor: 'strokeNeutralDisabled',
  },
  indeterminate: {
    backgroundColor: 'backgroundBrandHeavy',
    borderColor: 'strokeNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
      borderColor: 'strokeNeutralTransparent',
    },
    hovered: {
      backgroundColor: 'backgroundBrandHeavy',
      borderColor: 'strokeNeutralTransparent',
    },
    pressed: {
      backgroundColor: 'backgroundBrandHeavy',
      borderColor: 'strokeNeutralTransparent',
    },
  },
  unchecked: {
    backgroundColor: 'backgroundNeutralTransparent',
    borderColor: 'strokeNeutralHeavy',
    hovered: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeNeutralHeavy',
    },
    pressed: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeNeutralHeavy',
    },
  },
};

const getIndicatorColorStyle = getThemedColorStyleFactory('Checkbox.indicatorColors', indicatorColorDefinition, statusStateLevels);

const labelColorDefinition: ColorStyleDefinition<TextColorStyle, typeof statusStateLevels> = {
  color: 'foregroundNeutralSecondary',
  checked: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundNeutralPrimary',
    },
    pressed: {
      color: 'foregroundNeutralPrimary',
    },
  },
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
  indeterminate: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundNeutralPrimary',
    },
    pressed: {
      color: 'foregroundNeutralPrimary',
    },
  },
  unchecked: {
    color: 'foregroundNeutralSecondary',
    hovered: {
      color: 'foregroundNeutralSecondary',
    },
    pressed: {
      color: 'foregroundNeutralSecondary',
    },
  },
};

const getLabelColorStyle = getThemedColorStyleFactory('Checkbox.labelColors', labelColorDefinition, statusStateLevels);

const secondaryTextColorDefinition: ColorStyleDefinition<TextColorStyle, typeof statusStateLevels> = {
  color: 'foregroundNeutralSecondary',
  checked: {
    color: 'foregroundNeutralSecondary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundNeutralSecondary',
    },
    pressed: {
      color: 'foregroundNeutralSecondary',
    },
  },
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
  indeterminate: {
    color: 'foregroundNeutralSecondary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundNeutralSecondary',
    },
    pressed: {
      color: 'foregroundNeutralSecondary',
    },
  },
  unchecked: {
    color: 'foregroundNeutralSecondary',
    hovered: {
      color: 'foregroundNeutralSecondary',
    },
    pressed: {
      color: 'foregroundNeutralSecondary',
    },
  },
};

const getSecondaryTextColorStyle = getThemedColorStyleFactory(
  'Checkbox.secondaryTextColors',
  secondaryTextColorDefinition,
  statusStateLevels,
);

const indicatorIconColorDefinition: ColorStyleDefinition<TextColorStyle, typeof statusStateLevels> = {
  color: 'foregroundBrandOnloud',
  checked: {
    color: 'foregroundBrandOnloud',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundBrandOnloud',
    },
    pressed: {
      color: 'foregroundBrandOnloud',
    },
  },
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
  indeterminate: {
    color: 'foregroundBrandOnloud',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundBrandOnloud',
    },
    pressed: {
      color: 'foregroundBrandOnloud',
    },
  },
  unchecked: {
    color: 'foregroundBrandOnloud',
    hovered: {
      color: 'foregroundBrandOnloud',
    },
    pressed: {
      color: 'foregroundBrandOnloud',
    },
  },
};

const getIndicatorIconColorStyle = getThemedColorStyleFactory(
  'Checkbox.indicatorIconColors',
  indicatorIconColorDefinition,
  statusStateLevels,
);

function getStatusStateSource(state: CheckboxState) {
  const source: ('unchecked' | 'checked' | 'indeterminate' | 'disabled' | 'pressed' | 'hovered')[] = [state.status];
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

export function getCheckboxIndicatorStyle(state: CheckboxState): ViewStyle {
  return getIndicatorShapeStyle(state, [state.variant]);
}

export function getCheckboxRootStyle(state: CheckboxState): ViewStyle {
  return getRootLayoutStyle(state, [state.showLabel ? 'withLabel' : 'iconOnly']);
}

export function getCheckboxLabelContainerStyle(state: CheckboxState): ViewStyle {
  return getLabelContainerLayoutStyle(state, [state.renderSecondaryText ? 'withSecondaryText' : 'withoutSecondaryText']);
}

export function getCheckboxFocusStyle(state: CheckboxState): ViewStyle | undefined {
  return state.focused && !state.disabled ? getFocusRingStyle(state, ['focused']) : undefined;
}

export function getCheckboxIndicatorColors(state: CheckboxState): ViewColorStyle {
  return getIndicatorColorStyle(state, getStatusStateSource(state));
}

export function getCheckboxLabelColors(state: CheckboxState): TextColorStyle {
  return getLabelColorStyle(state, getStatusStateSource(state));
}

export function getCheckboxSecondaryTextColors(state: CheckboxState): TextColorStyle {
  return getSecondaryTextColorStyle(state, getStatusStateSource(state));
}

export function getCheckboxIndicatorIconColors(state: CheckboxState): TextColorStyle {
  return getIndicatorIconColorStyle(state, getStatusStateSource(state));
}

export { size120 as checkboxIndicatorIconSize };
