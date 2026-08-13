import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import { getThemedStateStyleFactory } from '../../utils/branchedStyle';
import type { StateNames, StyleDefinition } from '../../utils/branchedStyle';
import { getThemedColorStyleFactory } from '../../utils/colorStyles';
import type { ColorStyleDefinition, ViewColorStyle } from '../../utils/colorStyles';
import type { CardState } from './card.types';

export const cardStyles = StyleSheet.create({
  root: {
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexShrink: 1,
    maxWidth: 720,
    minWidth: 0,
    overflow: 'hidden',
    position: 'relative',
  },
  section: {
    alignSelf: 'stretch',
    flexShrink: 1,
    minWidth: 0,
  },
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'transparent',
    borderStyle: 'solid',
  },
  nestedContent: {
    alignSelf: 'stretch',
    flexShrink: 1,
    overflow: 'hidden',
  },
});

const surfaceColorStateLevels = [['selected'], ['disabled', 'pressed', 'hovered']] as const;
type SurfaceColorStateLevels = typeof surfaceColorStateLevels;
type SurfaceColorState = StateNames<SurfaceColorStateLevels>;

const surfaceColorDefinition: ColorStyleDefinition<ViewColorStyle, SurfaceColorStateLevels> = {
  backgroundColor: 'surfaceNeutralTranslucent',
  borderColor: 'strokeNeutralSubtle',
  selected: {
    backgroundColor: 'backgroundNeutralSoft',
    borderColor: 'strokeNeutralSoft',
    disabled: {
      backgroundColor: 'backgroundNeutralDisabled',
      borderColor: 'strokeNeutralDisabled',
    },
  },
  disabled: {
    backgroundColor: 'backgroundNeutralDisabled',
    borderColor: 'strokeNeutralDisabled',
  },
};

const getThemedSurfaceColors = getThemedColorStyleFactory<ViewColorStyle, SurfaceColorStateLevels>(
  'Card.surface',
  surfaceColorDefinition,
  surfaceColorStateLevels,
);

function getSurfaceColorStateSource(state: CardState): SurfaceColorState[] {
  const source: SurfaceColorState[] = [];
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

export function getCardSurfaceColors(state: CardState): ViewColorStyle {
  return getThemedSurfaceColors(state, getSurfaceColorStateSource(state));
}

const rootStyleStateLevels = [['small', 'large'], ['default', 'none'], ['vertical', 'horizontal']] as const;
type RootStyleStateLevels = typeof rootStyleStateLevels;
type RootStyleState = StateNames<RootStyleStateLevels>;

function getGapValue(value: FlexTokens['spacing']['componentBase300']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new TypeError('Card gap tokens must resolve to a number or string.');
}

function createRootStyleDefinition({ borderRadius, spacing, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  const gap = getGapValue(spacing.componentBase300);
  const padding = spacing.componentBase300;
  return {
    borderWidth: strokeWidth.thin,
    small: {
      default: {
        borderRadius: borderRadius.base600,
        flexDirection: 'column',
        gap,
        padding,
      },
      none: {
        borderRadius: borderRadius.base600,
        flexDirection: 'column',
        gap,
        padding: 0,
      },
      horizontal: {
        borderRadius: borderRadius.base600,
        flexDirection: 'row',
        gap,
        padding,
      },
    },
    large: {
      default: {
        borderRadius: borderRadius.base700,
        flexDirection: 'column',
        gap,
        padding,
      },
      none: {
        borderRadius: borderRadius.base700,
        flexDirection: 'column',
        gap,
        padding: 0,
      },
      horizontal: {
        borderRadius: borderRadius.base700,
        flexDirection: 'row',
        gap,
        padding,
      },
    },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Card.root', createRootStyleDefinition, rootStyleStateLevels);

function getRootStyleStateSource(state: CardState): RootStyleState[] {
  return [state.size, state.padding, state.resolvedDirection];
}

export function getCardRootStyle(state: CardState): ViewStyle {
  return getThemedRootStyle(state, getRootStyleStateSource(state));
}

const nestedBlockStyleStateLevels = [['small', 'large'], ['default', 'none']] as const;
type NestedBlockStyleStateLevels = typeof nestedBlockStyleStateLevels;
type NestedBlockStyleState = StateNames<NestedBlockStyleStateLevels>;

function createNestedBlockStyleDefinition({ borderRadius, color }: FlexTokens): StyleDefinition<ViewStyle, NestedBlockStyleStateLevels> {
  const nestedBackground: ViewStyle = { backgroundColor: color.backgroundNeutralTranslucent };
  return {
    small: {
      default: {
        ...nestedBackground,
        borderRadius: borderRadius.base300,
      },
      none: {
        ...nestedBackground,
        borderRadius: borderRadius.base600,
      },
    },
    large: {
      default: {
        ...nestedBackground,
        borderRadius: borderRadius.base400,
      },
      none: {
        ...nestedBackground,
        borderRadius: borderRadius.base700,
      },
    },
  };
}

const getThemedNestedBlockStyle = getThemedStateStyleFactory(
  'Card.nestedContent',
  createNestedBlockStyleDefinition,
  nestedBlockStyleStateLevels,
);

function getNestedBlockStateSource(state: CardState): NestedBlockStyleState[] {
  return [state.size, state.padding];
}

export function getCardNestedBlockStyle(state: CardState): ViewStyle {
  return getThemedNestedBlockStyle(state, getNestedBlockStateSource(state));
}

const overlayStyleStateLevels = [['small', 'large']] as const;
type OverlayStyleStateLevels = typeof overlayStyleStateLevels;

function createOverlayStyleDefinition({ borderRadius }: FlexTokens): StyleDefinition<ViewStyle, OverlayStyleStateLevels> {
  return {
    small: {
      borderRadius: borderRadius.base600,
    },
    large: {
      borderRadius: borderRadius.base700,
    },
  };
}

const getThemedOverlayStyle = getThemedStateStyleFactory('Card.overlay', createOverlayStyleDefinition, overlayStyleStateLevels);

export function getCardOverlayStyle(state: CardState): ViewStyle {
  return getThemedOverlayStyle(state, [state.size]);
}

const focusStyleStateLevels = [['focused']] as const;

const getThemedFocusStyle = getThemedStateStyleFactory(
  'Card.focus',
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

export function getCardFocusStyle(state: CardState): ViewStyle | undefined {
  return state.focused && !state.disabled ? getThemedFocusStyle(state, focusedState) : undefined;
}
