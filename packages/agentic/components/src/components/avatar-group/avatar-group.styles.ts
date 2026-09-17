import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import {
  getGapStyleValue,
  getNumericStyleValueAsNumber as toNumber,
  getThemedStateStyleFactory,
} from '@fluentui-react-native/design/styling';
import type { StateNames, StyleDefinition } from '@fluentui-react-native/design/styling';
import type { AvatarGroupSize, AvatarGroupState } from './avatar-group.types';

export const avatarGroupSizes = [16, 20, 24, 28, 32, 40, 56, 120] as const;

export const avatarGroupStyles = StyleSheet.create({
  item: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overflow: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  overflowText: {
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
  },
});

const avatarGroupSizeStates = ['16', '20', '24', '28', '32', '40', '56', '120'] as const;
const avatarGroupLayoutStates = ['spread', 'stack'] as const;
const avatarGroupOffsetStates = ['offset'] as const;

const avatarGroupRootStateLevels = [avatarGroupSizeStates, avatarGroupLayoutStates] as const;
type AvatarGroupRootStateLevels = typeof avatarGroupRootStateLevels;
type AvatarGroupRootState = StateNames<AvatarGroupRootStateLevels>;

const avatarGroupItemStateLevels = [avatarGroupSizeStates, avatarGroupLayoutStates, avatarGroupOffsetStates] as const;
type AvatarGroupItemStateLevels = typeof avatarGroupItemStateLevels;
type AvatarGroupItemState = StateNames<AvatarGroupItemStateLevels>;

const avatarGroupOverflowStateLevels = [avatarGroupSizeStates] as const;
type AvatarGroupOverflowStateLevels = typeof avatarGroupOverflowStateLevels;
type AvatarGroupOverflowState = StateNames<AvatarGroupOverflowStateLevels>;

/**
 * The trailing edge of each stacked item that its successor covers. The scale is a quarter of the avatar
 * diameter, which the spacing tokens cannot express at every stop.
 */
const stackOverlap: Record<AvatarGroupSize, number> = {
  16: 4,
  20: 5,
  24: 6,
  28: 7,
  32: 8,
  40: 10,
  56: 14,
  120: 30,
};

/**
 * The separation ring painted between stacked items, and the boundary drawn around the overflow indicator.
 * Size 120 needs four pixels, which the stroke-width scale does not reach.
 */
function getRingWidth({ strokeWidth }: FlexTokens, size: AvatarGroupSize): number {
  if (size === 120) {
    return 4;
  }
  if (size === 56) {
    return toNumber(strokeWidth.thicker);
  }
  if (size === 40) {
    return toNumber(strokeWidth.thick);
  }
  return toNumber(strokeWidth.thin);
}

function getSpreadGap({ spacing }: FlexTokens, size: AvatarGroupSize): ViewStyle['gap'] {
  if (size === 120) {
    return getGapStyleValue(spacing.componentBase500);
  }
  if (size === 16) {
    return getGapStyleValue(spacing.componentBase200);
  }
  if (size === 32 || size === 40 || size === 56) {
    return getGapStyleValue(spacing.componentBase300);
  }
  return getGapStyleValue(spacing.componentBase250);
}

function getOverflowFontSize({ fontSize }: FlexTokens, size: AvatarGroupSize): number {
  switch (size) {
    case 16:
    case 20:
    case 24:
      return toNumber(fontSize.functionalCaption);
    case 28:
      return toNumber(fontSize.functionalBodySmall);
    case 32:
      return toNumber(fontSize.functionalBodyMedium);
    case 40:
      return toNumber(fontSize.functionalBodyLarge);
    case 56:
      return toNumber(fontSize.functionalTitleSmall);
    default:
      return toNumber(fontSize.functionalTitleLarge);
  }
}

function createRootSizeStyle(
  tokens: FlexTokens,
  size: AvatarGroupSize,
): StyleDefinition<ViewStyle, readonly [typeof avatarGroupLayoutStates]> {
  return {
    spread: { gap: getSpreadGap(tokens, size) },
    stack: { gap: 0 },
  };
}

function createItemSizeStyle(
  tokens: FlexTokens,
  size: AvatarGroupSize,
): StyleDefinition<ViewStyle, readonly [typeof avatarGroupLayoutStates, typeof avatarGroupOffsetStates]> {
  const ringWidth = getRingWidth(tokens, size);
  const stackBox = size + ringWidth * 2;

  return {
    spread: {
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      borderRadius: tokens.borderRadius.circular,
      height: size,
      width: size,
      offset: { marginStart: 0 },
    },
    stack: {
      backgroundColor: tokens.color.surfaceNeutralNearer,
      borderRadius: tokens.borderRadius.circular,
      height: stackBox,
      width: stackBox,
      offset: { marginStart: -(stackOverlap[size] + ringWidth * 2) },
    },
  };
}

function createOverflowSizeStyle(tokens: FlexTokens, size: AvatarGroupSize): ViewStyle {
  return {
    borderWidth: getRingWidth(tokens, size),
    height: size,
    width: size,
  };
}

function createOverflowTextSizeStyle(tokens: FlexTokens, size: AvatarGroupSize): TextStyle {
  const fontSize = getOverflowFontSize(tokens, size);
  return { fontSize, lineHeight: fontSize };
}

const getThemedAvatarGroupRootStyle = getThemedStateStyleFactory(
  'AvatarGroup.root',
  (tokens: FlexTokens): StyleDefinition<ViewStyle, AvatarGroupRootStateLevels> => ({
    alignItems: 'center',
    flexDirection: 'row',
    '16': createRootSizeStyle(tokens, 16),
    '20': createRootSizeStyle(tokens, 20),
    '24': createRootSizeStyle(tokens, 24),
    '28': createRootSizeStyle(tokens, 28),
    '32': createRootSizeStyle(tokens, 32),
    '40': createRootSizeStyle(tokens, 40),
    '56': createRootSizeStyle(tokens, 56),
    '120': createRootSizeStyle(tokens, 120),
  }),
  avatarGroupRootStateLevels,
);

const getThemedAvatarGroupItemStyle = getThemedStateStyleFactory(
  'AvatarGroup.item',
  (tokens: FlexTokens): StyleDefinition<ViewStyle, AvatarGroupItemStateLevels> => ({
    alignItems: 'center',
    justifyContent: 'center',
    '16': createItemSizeStyle(tokens, 16),
    '20': createItemSizeStyle(tokens, 20),
    '24': createItemSizeStyle(tokens, 24),
    '28': createItemSizeStyle(tokens, 28),
    '32': createItemSizeStyle(tokens, 32),
    '40': createItemSizeStyle(tokens, 40),
    '56': createItemSizeStyle(tokens, 56),
    '120': createItemSizeStyle(tokens, 120),
  }),
  avatarGroupItemStateLevels,
);

const getThemedAvatarGroupOverflowStyle = getThemedStateStyleFactory(
  'AvatarGroup.overflow',
  (tokens: FlexTokens): StyleDefinition<ViewStyle, AvatarGroupOverflowStateLevels> => ({
    backgroundColor: tokens.color.surfaceNeutralNearer,
    borderColor: tokens.color.strokeNeutralSubtle,
    borderRadius: tokens.borderRadius.circular,
    '16': createOverflowSizeStyle(tokens, 16),
    '20': createOverflowSizeStyle(tokens, 20),
    '24': createOverflowSizeStyle(tokens, 24),
    '28': createOverflowSizeStyle(tokens, 28),
    '32': createOverflowSizeStyle(tokens, 32),
    '40': createOverflowSizeStyle(tokens, 40),
    '56': createOverflowSizeStyle(tokens, 56),
    '120': createOverflowSizeStyle(tokens, 120),
  }),
  avatarGroupOverflowStateLevels,
);

const getThemedAvatarGroupOverflowTextStyle = getThemedStateStyleFactory(
  'AvatarGroup.overflowText',
  (tokens: FlexTokens): StyleDefinition<TextStyle, AvatarGroupOverflowStateLevels> => ({
    color: tokens.color.foregroundNeutralPrimary,
    fontFamily: tokens.fontFamily.functional,
    fontWeight: tokens.fontWeight.functionalSemibold,
    '16': createOverflowTextSizeStyle(tokens, 16),
    '20': createOverflowTextSizeStyle(tokens, 20),
    '24': createOverflowTextSizeStyle(tokens, 24),
    '28': createOverflowTextSizeStyle(tokens, 28),
    '32': createOverflowTextSizeStyle(tokens, 32),
    '40': createOverflowTextSizeStyle(tokens, 40),
    '56': createOverflowTextSizeStyle(tokens, 56),
    '120': createOverflowTextSizeStyle(tokens, 120),
  }),
  avatarGroupOverflowStateLevels,
);

function getSizeState(state: AvatarGroupState): string {
  return String(state.size);
}

export function getAvatarGroupRootStyle(state: AvatarGroupState): ViewStyle {
  return getThemedAvatarGroupRootStyle(state, [getSizeState(state) as AvatarGroupRootState, state.layout]);
}

export function getAvatarGroupItemStyle(state: AvatarGroupState): ViewStyle {
  return getThemedAvatarGroupItemStyle(state, [getSizeState(state) as AvatarGroupItemState, state.layout]);
}

export function getAvatarGroupItemOffsetStyle(state: AvatarGroupState): ViewStyle {
  return getThemedAvatarGroupItemStyle(state, [getSizeState(state) as AvatarGroupItemState, state.layout, 'offset']);
}

export function getAvatarGroupOverflowStyle(state: AvatarGroupState): ViewStyle {
  return getThemedAvatarGroupOverflowStyle(state, [getSizeState(state) as AvatarGroupOverflowState]);
}

export function getAvatarGroupOverflowTextStyle(state: AvatarGroupState): TextStyle {
  return getThemedAvatarGroupOverflowTextStyle(state, [getSizeState(state) as AvatarGroupOverflowState]);
}
