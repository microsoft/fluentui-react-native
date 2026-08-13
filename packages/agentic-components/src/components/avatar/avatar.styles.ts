import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import { getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type { StateNames, StyleDefinition } from '@fluentui-react-native/design/styling';
import type { AvatarContentMode, AvatarSize, AvatarState } from './avatar.types';

export const avatarStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  image: {
    ...StyleSheet.absoluteFillObject,
  },
  initials: {
    flexShrink: 1,
    padding: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
});

const avatarSizeStates = ['16', '20', '24', '28', '32', '40', '56', '120'] as const;
const avatarModeStates = ['image', 'icon', 'initials'] as const;
const avatarRingStates = ['activityRing'] as const;
const avatarRingStateLevels = [avatarRingStates] as const;

const avatarRootStateLevels = [avatarSizeStates, avatarModeStates, avatarRingStates] as const;
type AvatarRootStateLevels = typeof avatarRootStateLevels;
type AvatarRootState = StateNames<AvatarRootStateLevels>;

const avatarInitialsStateLevels = [avatarSizeStates] as const;
type AvatarInitialsStateLevels = typeof avatarInitialsStateLevels;
type AvatarInitialsState = StateNames<AvatarInitialsStateLevels>;

function createRingStyle({ color, strokeWidth }: FlexTokens, offset: 'thin' | 'thick', width: 'thin' | 'thick' | 'thicker'): ViewStyle {
  return {
    outlineColor: color.strokeBrandLoud,
    outlineOffset: strokeWidth[offset],
    outlineStyle: 'solid',
    outlineWidth: strokeWidth[width],
  };
}

function createModeStyles(
  ringStyle: ViewStyle,
  tokens: FlexTokens,
): Record<AvatarContentMode, StyleDefinition<ViewStyle, typeof avatarRingStateLevels>> {
  return {
    image: {
      backgroundColor: tokens.color.backgroundNeutralTransparent,
      padding: 0,
      activityRing: ringStyle,
    },
    icon: {
      activityRing: ringStyle,
    },
    initials: {
      activityRing: ringStyle,
    },
  };
}

function createSizeStyleDefinition(tokens: FlexTokens, size: AvatarSize): StyleDefinition<ViewStyle, AvatarRootStateLevels> {
  const { borderRadius, color, spacing } = tokens;
  const ringStyle =
    size === 120
      ? createRingStyle(tokens, 'thick', 'thicker')
      : size === 56
        ? createRingStyle(tokens, 'thin', 'thicker')
        : size === 16
          ? createRingStyle(tokens, 'thin', 'thin')
          : createRingStyle(tokens, 'thin', 'thick');
  const modeStyles = createModeStyles(ringStyle, tokens);

  return {
    alignItems: 'center',
    backgroundColor: color.backgroundNeutralSoft,
    borderRadius: borderRadius.circular,
    height: size,
    image: modeStyles.image,
    icon: modeStyles.icon,
    initials: modeStyles.initials,
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
    // retain the ring style at every size, while letting the content mode supply the final branch.
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
  const source: AvatarRootState[] = [String(state.size) as AvatarRootState, state.contentMode];
  if (state.activityRing) {
    source.push('activityRing');
  }
  return source;
}

export function getAvatarRootStyle(state: AvatarState): ViewStyle {
  return getThemedAvatarRootStyle(state, getAvatarRootStateSource(state));
}

const getThemedAvatarInitialsStyle = getThemedStateStyleFactory(
  'Avatar.initials',
  ({ fontFamily, fontSize, fontWeight }: FlexTokens): StyleDefinition<TextStyle, AvatarInitialsStateLevels> => {
    return {
      fontFamily: fontFamily.functional,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: 1,
      padding: 0,
      textAlign: 'center',
      textAlignVertical: 'center',
      textTransform: 'uppercase',
      '16': { fontSize: fontSize.functionalCaption },
      '20': { fontSize: fontSize.functionalCaption },
      '24': { fontSize: fontSize.functionalCaption },
      '28': { fontSize: fontSize.functionalBodySmall },
      '32': { fontSize: fontSize.functionalBodyMedium },
      '40': { fontSize: fontSize.functionalBodyLarge },
      '56': { fontSize: fontSize.functionalTitleSmall },
      '120': { fontSize: fontSize.functionalTitleLarge },
    };
  },
  avatarInitialsStateLevels,
);

function getAvatarInitialsStateSource(state: AvatarState): AvatarInitialsState[] {
  return [String(state.size) as AvatarInitialsState];
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
