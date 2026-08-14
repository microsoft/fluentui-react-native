import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import {
  getStateStyleFactory,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  interactiveStatePriority,
} from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StateNames, StyleDefinition, ViewColorStyle } from '@fluentui-react-native/design/styling';
import { size20, size40, size80, size200, size360, size400, size560 } from '@fluentui-react-native/design/tokens/global';

import type { SwitchState } from './switch.types';

export const switchStyles = StyleSheet.create({
  container: {
    alignSelf: 'flex-start',
  },
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    backgroundColor: 'transparent',
    borderStyle: 'solid',
    justifyContent: 'center',
    minHeight: size360,
    minWidth: size560,
    paddingHorizontal: size80,
    paddingVertical: size80,
  },
  track: {
    alignItems: 'center',
    height: size200,
    justifyContent: 'center',
    position: 'relative',
    borderStyle: 'solid',
    width: size400,
  },
  thumb: {
    height: 14,
    position: 'absolute',
    top: size20,
    width: 14,
    left: size20,
  },
  label: {
    flexShrink: 1,
    minWidth: 0,
  },
});

const layoutStateLevels = [['switch', 'horizontal', 'vertical']] as const;
type LayoutStateLevels = typeof layoutStateLevels;

const getLayoutStyle = getStateStyleFactory<ViewStyle, LayoutStateLevels>(
  {
    switch: {
      flexDirection: 'column',
      gap: 0,
      padding: 0,
    },
    horizontal: {
      alignItems: 'center',
      flexDirection: 'row',
      gap: size40,
      padding: size80,
    },
    vertical: {
      alignItems: 'flex-start',
      flexDirection: 'column',
      gap: size40,
      padding: size80,
    },
  },
  layoutStateLevels,
);

export function getSwitchLayoutStyle(layout: SwitchState['layout']): ViewStyle {
  return getLayoutStyle([layout]);
}

const baseStateLevels = [['base']] as const;

const getRootBaseStyle = getThemedStateStyleFactory(
  'Switch.rootBase',
  ({ borderRadius }: FlexTokens): StyleDefinition<ViewStyle, typeof baseStateLevels> => ({
    base: {
      borderRadius: borderRadius.circular,
    },
  }),
  baseStateLevels,
);

export function getSwitchRootBaseStyle(state: SwitchState): ViewStyle {
  return getRootBaseStyle(state, ['base']);
}

const getTrackBaseStyle = getThemedStateStyleFactory(
  'Switch.trackBase',
  ({ borderRadius, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof baseStateLevels> => ({
    base: {
      borderRadius: borderRadius.circular,
      borderWidth: strokeWidth.thin,
    },
  }),
  baseStateLevels,
);

export function getSwitchTrackBaseStyle(state: SwitchState): ViewStyle {
  return getTrackBaseStyle(state, ['base']);
}

const getThumbBaseStyle = getThemedStateStyleFactory(
  'Switch.thumbBase',
  ({ borderRadius }: FlexTokens): StyleDefinition<ViewStyle, typeof baseStateLevels> => ({
    base: {
      borderRadius: borderRadius.circular,
    },
  }),
  baseStateLevels,
);

export function getSwitchThumbBaseStyle(state: SwitchState): ViewStyle {
  return getThumbBaseStyle(state, ['base']);
}

const focusStateLevels = [['focused']] as const;

const getFocusStyle = getThemedStateStyleFactory(
  'Switch.focus',
  ({ color, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof focusStateLevels> => ({
    focused: {
      borderColor: color.strokeFocusInner,
      outlineColor: color.strokeFocusOuter,
      outlineOffset: strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: strokeWidth.thick,
    },
  }),
  focusStateLevels,
);

export function getSwitchFocusStyle(state: SwitchState): ViewStyle | undefined {
  return state.focused && !state.disabled ? getFocusStyle(state, ['focused']) : undefined;
}

const labelStateLevels = [['disabled']] as const;

const getLabelStyle = getThemedStateStyleFactory(
  'Switch.label',
  ({ color, fontFamily, fontSize, fontWeight, lineHeight }: FlexTokens): StyleDefinition<TextStyle, typeof labelStateLevels> => ({
    color: color.foregroundNeutralPrimary,
    fontFamily: fontFamily.functional,
    fontSize: fontSize.functionalBodyMedium,
    fontWeight: fontWeight.functionalRegular,
    lineHeight: lineHeight.functionalBodyMedium,
    disabled: {
      color: color.foregroundNeutralDisabled,
    },
  }),
  labelStateLevels,
);

export function getSwitchLabelStyle(state: SwitchState): TextStyle {
  return getLabelStyle(state, state.disabled ? ['disabled'] : []);
}

const colorStateLevels = [['checked'], interactiveStatePriority] as const;
type ColorStateLevels = typeof colorStateLevels;
type ColorState = StateNames<ColorStateLevels>;

const trackColorDefinition: ColorStyleDefinition<ViewColorStyle, ColorStateLevels> = {
  backgroundColor: 'backgroundNeutralTransparent',
  borderColor: 'foregroundNeutralSecondary',
  disabled: {
    backgroundColor: 'backgroundNeutralTransparent',
    borderColor: 'strokeNeutralDisabled',
  },
  checked: {
    backgroundColor: 'backgroundNeutralHeavy',
    borderColor: 'strokeNeutralHeavy',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
      borderColor: 'strokeNeutralDisabled',
    },
  },
};

const thumbColorDefinition: ColorStyleDefinition<ViewColorStyle, ColorStateLevels> = {
  backgroundColor: 'foregroundNeutralSecondary',
  disabled: {
    backgroundColor: 'foregroundNeutralDisabled',
  },
  checked: {
    backgroundColor: 'foregroundNeutralOnloud',
    disabled: {
      backgroundColor: 'foregroundNeutralDisabled',
    },
  },
};

const getTrackColors = getThemedColorStyleFactory<ViewColorStyle, ColorStateLevels>(
  'Switch.trackColor',
  trackColorDefinition,
  colorStateLevels,
);

const getThumbColors = getThemedColorStyleFactory<ViewColorStyle, ColorStateLevels>(
  'Switch.thumbColor',
  thumbColorDefinition,
  colorStateLevels,
);

function getColorStateSource(state: Pick<SwitchState, 'disabled' | 'hovered' | 'pressed'>, checked: boolean): ColorState[] {
  const source: ColorState[] = [];
  if (checked) {
    source.push('checked');
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

export function getSwitchTrackColorStyle(
  state: Pick<SwitchState, 'tokens' | 'disabled' | 'hovered' | 'pressed'>,
  checked: boolean,
): ViewColorStyle {
  return getTrackColors(state as SwitchState, getColorStateSource(state, checked));
}

export function getSwitchThumbColorStyle(
  state: Pick<SwitchState, 'tokens' | 'disabled' | 'hovered' | 'pressed'>,
  checked: boolean,
): ViewColorStyle {
  return getThumbColors(state as SwitchState, getColorStateSource(state, checked));
}

export function getSwitchThumbTranslateDistance(state: Pick<SwitchState, 'tokens'>): number {
  return size400 - state.tokens.strokeWidth.thin * 2 - size20 * 2 - 14;
}
