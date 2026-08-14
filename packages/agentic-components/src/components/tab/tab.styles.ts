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

import type { TabState } from './tab.types';

export const tabStyles = StyleSheet.create({
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

const colorStateLevels = [['selected'], interactiveStatePriority] as const;
type ColorStateLevels = typeof colorStateLevels;
type ColorState = StateNames<ColorStateLevels>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, ColorStateLevels> = {
  backgroundColor: 'backgroundNeutralTransparent',
  selected: {
    backgroundColor: 'backgroundNeutralHeavy',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
    },
  },
  disabled: {
    backgroundColor: 'backgroundNeutralTransparent',
  },
};

const foregroundColorDefinition: ColorStyleDefinition<TextColorStyle, ColorStateLevels> = {
  color: 'foregroundNeutralPrimary',
  selected: {
    color: 'foregroundNeutralOnloud',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  disabled: {
    color: 'foregroundNeutralDisabled',
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, ColorStateLevels>(
  'Tab.background',
  backgroundColorDefinition,
  colorStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ColorStateLevels>(
  'Tab.foreground',
  foregroundColorDefinition,
  colorStateLevels,
);

function getColorStateSource(state: TabState): ColorState[] {
  const source: ColorState[] = [];
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

export function getTabColorStyles(state: TabState): {
  background: ViewColorStyle;
  foreground: TextColorStyle;
} {
  const source = getColorStateSource(state);
  return {
    background: getThemedBackgroundStyle(state, source),
    foreground: getThemedForegroundStyle(state, source),
  };
}

const rootStyleStateLevels = [['iconAndText', 'iconOnly']] as const;
type RootStyleStateLevels = typeof rootStyleStateLevels;
type RootStyleState = StateNames<RootStyleStateLevels>;

function createRootStyleDefinition({ borderRadius, spacing }: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  return {
    iconAndText: {
      borderRadius: borderRadius.base300,
      gap: getGapStyleValue(spacing.componentBase100),
      paddingHorizontal: spacing.componentBase300,
      paddingVertical: spacing.componentBase150,
    },
    iconOnly: {
      borderRadius: borderRadius.circular,
      paddingHorizontal: spacing.componentBase150,
      paddingVertical: spacing.componentBase150,
    },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Tab.root', createRootStyleDefinition, rootStyleStateLevels);

function getRootStyleStateSource(state: TabState): RootStyleState[] {
  return [state.layout];
}

export function getTabRootStyle(state: TabState): ViewStyle {
  return getThemedRootStyle(state, getRootStyleStateSource(state));
}

const contentStyleStateLevels = [['selected']] as const;
type ContentStyleStateLevels = typeof contentStyleStateLevels;
type ContentStyleState = StateNames<ContentStyleStateLevels>;

function createContentStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, ContentStyleStateLevels> {
  return {
    fontFamily: fontFamily.functional,
    fontSize: fontSize.functionalBodyMedium,
    fontWeight: fontWeight.functionalRegular,
    lineHeight: lineHeight.functionalBodyMedium,
    selected: {
      fontWeight: fontWeight.functionalSemibold,
    },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory('Tab.content', createContentStyleDefinition, contentStyleStateLevels);

export function getTabContentStyle(state: TabState, selected = state.selected): TextStyle {
  const source: ContentStyleState[] = selected ? ['selected'] : [];
  return getThemedContentStyle(state, source);
}

const focusStyleStateLevels = [['focused']] as const;

const getThemedFocusStyle = getThemedStateStyleFactory(
  'Tab.focus',
  ({ color, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof focusStyleStateLevels> => ({
    focused: {
      borderColor: color.strokeFocusInner,
      outlineColor: color.strokeFocusOuter,
      outlineOffset: strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: strokeWidth.thick,
    },
  }),
  focusStyleStateLevels,
);

const focusedState = ['focused'] as const;

export function getTabFocusStyle(state: TabState): ViewStyle | undefined {
  return state.focused && !state.disabled ? getThemedFocusStyle(state, focusedState) : undefined;
}

export function getTabIconSize(): number {
  return 20;
}
