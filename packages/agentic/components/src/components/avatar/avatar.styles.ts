import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import { getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { StateNames, StyleDefinition } from '@fluentui-react-native/design/styling';
import type { AvatarSize, AvatarState } from './avatar.types';

export const avatarStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  initials: {
    flexShrink: 1,
    includeFontPadding: false,
    padding: 0,
    position: 'absolute',
    textAlign: 'center',
  },
});

const avatarSizeStates = ['16', '20', '24', '28', '32', '40', '56', '120'] as const;
const avatarModeStates = ['image', 'icon', 'initials'] as const;
const avatarRootStateLevels = [avatarSizeStates, avatarModeStates] as const;
type AvatarRootStateLevels = typeof avatarRootStateLevels;
type AvatarRootState = StateNames<AvatarRootStateLevels>;

const avatarSizeStateLevels = [avatarSizeStates] as const;
type AvatarSizeStateLevels = typeof avatarSizeStateLevels;
type AvatarSizeState = StateNames<AvatarSizeStateLevels>;

function createRingStyle({ color, strokeWidth }: FlexTokens, offset: 'thin' | 'thick', width: 'thin' | 'thick' | 'thicker'): ViewStyle {
  const inset = -(strokeWidth[offset] + strokeWidth[width]);
  return {
    borderColor: color.strokeBrandLoud,
    borderStyle: 'solid',
    borderWidth: strokeWidth[width],
    bottom: inset,
    left: inset,
    right: inset,
    top: inset,
  };
}

function createSizeStyleDefinition(tokens: FlexTokens, size: AvatarSize): StyleDefinition<ViewStyle, AvatarRootStateLevels> {
  const { borderRadius, color, spacing } = tokens;

  return {
    alignItems: 'center',
    backgroundColor: color.backgroundNeutralSoft,
    borderRadius: borderRadius.circular,
    height: size,
    image: {
      backgroundColor: color.backgroundNeutralTransparent,
      padding: 0,
    },
    minHeight: size,
    minWidth: size,
    padding:
      size === 16
        ? spacing.componentBase50
        : size === 20
          ? spacing.componentBase50
          : size === 24
            ? spacing.componentBase100
            : size === 28
              ? spacing.componentBase150
              : size === 32
                ? spacing.componentBase100
                : size === 40
                  ? spacing.componentBase200
                  : size === 56
                    ? spacing.componentBase300
                    : spacing.layoutBase400,
    justifyContent: 'center',
    width: size,
  };
}

const getThemedAvatarRootStyle = getThemedStateStyleFactory(
  'Avatar.root',
  (tokens: FlexTokens): StyleDefinition<ViewStyle, AvatarRootStateLevels> => {
    return {
      alignItems: 'center',
      borderRadius: tokens.borderRadius.circular,
      justifyContent: 'center',
      position: 'relative',
      '16': createSizeStyleDefinition(tokens, 16),
      '20': createSizeStyleDefinition(tokens, 20),
      '24': createSizeStyleDefinition(tokens, 24),
      '28': createSizeStyleDefinition(tokens, 28),
      '32': createSizeStyleDefinition(tokens, 32),
      '40': createSizeStyleDefinition(tokens, 40),
      '56': createSizeStyleDefinition(tokens, 56),
      '120': createSizeStyleDefinition(tokens, 120),
    };
  },
  avatarRootStateLevels,
);

function getAvatarRootStateSource(state: AvatarState): AvatarRootState[] {
  return [String(state.size) as AvatarRootState, state.contentMode];
}

export function getAvatarRootStyle(state: AvatarState): ViewStyle {
  return getThemedAvatarRootStyle(state, getAvatarRootStateSource(state));
}

const getThemedAvatarActivityRingStyle = getThemedStateStyleFactory(
  'Avatar.activityRing',
  (tokens: FlexTokens): StyleDefinition<ViewStyle, AvatarSizeStateLevels> => ({
    ...createRingStyle(tokens, 'thin', 'thick'),
    borderRadius: tokens.borderRadius.circular,
    '16': createRingStyle(tokens, 'thin', 'thin'),
    '56': createRingStyle(tokens, 'thin', 'thicker'),
    '120': createRingStyle(tokens, 'thick', 'thicker'),
  }),
  avatarSizeStateLevels,
);

export function getAvatarActivityRingStyle(state: AvatarState): ViewStyle {
  return getThemedAvatarActivityRingStyle(state, [String(state.size) as AvatarSizeState]);
}

function createInitialsTextStyle(size: number): TextStyle {
  return {
    fontSize: size,
  };
}

const getThemedAvatarInitialsStyle = getThemedStateStyleFactory(
  'Avatar.initials',
  ({ fontFamily, fontSize, fontWeight }: FlexTokens): StyleDefinition<TextStyle, AvatarSizeStateLevels> => {
    return {
      fontFamily: fontFamily.functional,
      fontWeight: fontWeight.functionalRegular,
      padding: 0,
      textAlign: 'center',
      textTransform: 'uppercase',
      '16': createInitialsTextStyle(fontSize.functionalCaption),
      '20': createInitialsTextStyle(fontSize.functionalCaption),
      '24': createInitialsTextStyle(fontSize.functionalCaption),
      '28': createInitialsTextStyle(fontSize.functionalBodySmall),
      '32': createInitialsTextStyle(fontSize.functionalBodyMedium),
      '40': createInitialsTextStyle(fontSize.functionalBodyLarge),
      '56': createInitialsTextStyle(fontSize.functionalTitleSmall),
      '120': createInitialsTextStyle(fontSize.functionalTitleLarge),
    };
  },
  avatarSizeStateLevels,
);

function getAvatarInitialsStateSource(state: AvatarState): AvatarSizeState[] {
  return [String(state.size) as AvatarSizeState];
}

export function getAvatarInitialsStyle(state: AvatarState): TextStyle {
  return getThemedAvatarInitialsStyle(state, getAvatarInitialsStateSource(state));
}

const avatarIconSizes: Record<AvatarSize, number> = {
  16: 12,
  20: 16,
  24: 16,
  28: 16,
  32: 20,
  40: 24,
  56: 32,
  120: 48,
};

export function getAvatarIconSize(size: AvatarSize): number {
  return avatarIconSizes[size];
}
