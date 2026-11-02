import { StyleSheet } from 'react-native';
import type { ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import {
  channelStatePriority,
  getGapStyleValue,
  getRadiusStyleValue,
  getStrokeWidthStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  resolveHoverMode,
} from '@fluentui-react-native/design/styling';
import type { ColorStyleDefinition, StateNames, StyleDefinition, ViewColorStyle } from '@fluentui-react-native/design/styling';
import type { CardSize, CardState } from './card.types';
import { cardTraits } from './spec/traits';

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

const paintsHover = resolveHoverMode(cardTraits.hover) !== 'suppressed';

const backgroundStateLevels = [['selected'], channelStatePriority(cardTraits.channels.root.background)] as const;
type BackgroundStateLevels = typeof backgroundStateLevels;
type BackgroundState = StateNames<BackgroundStateLevels>;

const backgroundDefinition: ColorStyleDefinition<Pick<ViewColorStyle, 'backgroundColor'>, BackgroundStateLevels> = {
  backgroundColor: 'surfaceNeutralTranslucent',
  selected: {
    backgroundColor: 'backgroundNeutralSoft',
    disabled: {
      backgroundColor: 'backgroundNeutralDisabled',
    },
  },
  disabled: {
    backgroundColor: 'backgroundNeutralDisabled',
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<Pick<ViewColorStyle, 'backgroundColor'>, BackgroundStateLevels>(
  'Card.background',
  backgroundDefinition,
  backgroundStateLevels,
);

function getBackgroundStateSource(state: CardState): BackgroundState[] {
  const source: BackgroundState[] = [];
  if (state.selected) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  }
  if (state.pressed) {
    source.push('pressed');
  }
  if (state.hovered && paintsHover) {
    source.push('hovered');
  }
  return source;
}

export function getCardBackgroundStyle(state: CardState): Pick<ViewColorStyle, 'backgroundColor'> {
  return getThemedBackgroundStyle(state, getBackgroundStateSource(state));
}

const strokeStateLevels = [['selected'], channelStatePriority(cardTraits.channels.root.stroke)] as const;
type StrokeStateLevels = typeof strokeStateLevels;
type StrokeState = StateNames<StrokeStateLevels>;

const strokeDefinition: ColorStyleDefinition<Pick<ViewColorStyle, 'borderColor'>, StrokeStateLevels> = {
  borderColor: 'strokeNeutralSubtle',
  selected: {
    borderColor: 'strokeNeutralSoft',
    disabled: {
      borderColor: 'strokeNeutralDisabled',
    },
  },
  disabled: {
    borderColor: 'strokeNeutralDisabled',
  },
};

const getThemedStrokeStyle = getThemedColorStyleFactory<Pick<ViewColorStyle, 'borderColor'>, StrokeStateLevels>(
  'Card.stroke',
  strokeDefinition,
  strokeStateLevels,
);

function getStrokeStateSource(state: CardState): StrokeState[] {
  const source: StrokeState[] = [];
  if (state.selected) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  }
  return source;
}

export function getCardStrokeStyle(state: CardState): Pick<ViewColorStyle, 'borderColor'> {
  return getThemedStrokeStyle(state, getStrokeStateSource(state));
}

function getCardRadius(tokens: FlexTokens, size: CardSize) {
  return getRadiusStyleValue(tokens, cardTraits.geometry.root.radius, size);
}

const rootStyleStateLevels = [
  ['small', 'large'],
  ['default', 'none'],
  ['vertical', 'horizontal'],
] as const;
type RootStyleStateLevels = typeof rootStyleStateLevels;
type RootStyleState = StateNames<RootStyleStateLevels>;

function createRootStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  const gap = getGapStyleValue(tokens.spacing.componentBase300);
  const padding = tokens.spacing.componentBase300;
  const small = getCardRadius(tokens, 'small');
  const large = getCardRadius(tokens, 'large');
  return {
    borderWidth: getStrokeWidthStyleValue(tokens, cardTraits.geometry.root.strokeWidth),
    small: {
      default: {
        borderRadius: small,
        flexDirection: 'column',
        gap,
        padding,
      },
      none: {
        borderRadius: small,
        flexDirection: 'column',
        gap,
        padding: 0,
      },
      horizontal: {
        borderRadius: small,
        flexDirection: 'row',
        gap,
        padding,
      },
    },
    large: {
      default: {
        borderRadius: large,
        flexDirection: 'column',
        gap,
        padding,
      },
      none: {
        borderRadius: large,
        flexDirection: 'column',
        gap,
        padding: 0,
      },
      horizontal: {
        borderRadius: large,
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

const nestedBlockStyleStateLevels = [
  ['small', 'large'],
  ['default', 'none'],
] as const;
type NestedBlockStyleStateLevels = typeof nestedBlockStyleStateLevels;
type NestedBlockStyleState = StateNames<NestedBlockStyleStateLevels>;

function createNestedBlockStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, NestedBlockStyleStateLevels> {
  const { borderRadius, color } = tokens;
  const nestedBackground: ViewStyle = { backgroundColor: color.backgroundNeutralTranslucent.rest };
  return {
    small: {
      default: {
        ...nestedBackground,
        borderRadius: borderRadius.base300,
      },
      // Without padding, the nested block meets the card edge and takes the outer radius.
      none: {
        ...nestedBackground,
        borderRadius: getCardRadius(tokens, 'small'),
      },
    },
    large: {
      default: {
        ...nestedBackground,
        borderRadius: borderRadius.base400,
      },
      none: {
        ...nestedBackground,
        borderRadius: getCardRadius(tokens, 'large'),
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

// The overlay covers the root, so it shares the root radius.
function createOverlayStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, OverlayStyleStateLevels> {
  return {
    small: {
      borderRadius: getCardRadius(tokens, 'small'),
    },
    large: {
      borderRadius: getCardRadius(tokens, 'large'),
    },
  };
}

const getThemedOverlayStyle = getThemedStateStyleFactory('Card.overlay', createOverlayStyleDefinition, overlayStyleStateLevels);

export function getCardOverlayStyle(state: CardState): ViewStyle {
  return getThemedOverlayStyle(state, [state.size]);
}
