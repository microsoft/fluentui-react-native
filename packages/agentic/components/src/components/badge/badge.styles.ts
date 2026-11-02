import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import {
  functionalTypography,
  getGapStyleValue,
  getRadiusStyleValue,
  getStrokeWidthStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
} from '@fluentui-react-native/design/styling';
import type {
  ColorStyleDefinition,
  StateNames,
  StyleDefinition,
  TextColorStyle,
  ViewColorStyle,
} from '@fluentui-react-native/design/styling';
import type { BadgeSize, BadgeState } from './badge.types';
import { badgeTraits } from './spec/traits';

export const badgeStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 0,
  },
  content: {
    flexShrink: 1,
    textAlign: 'center',
  },
});

const colorStateLevels = [
  ['tint', 'outline'],
  ['brand', 'danger', 'success', 'warning', 'informative'],
] as const;
type ColorStateLevels = typeof colorStateLevels;
type ColorState = StateNames<ColorStateLevels>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, ColorStateLevels> = {
  tint: {
    brand: {
      backgroundColor: 'backgroundBrandSoft',
      borderColor: 'strokeNeutralTransparent',
    },
    danger: {
      backgroundColor: 'backgroundDangerSoft',
      borderColor: 'strokeNeutralTransparent',
    },
    informative: {
      backgroundColor: 'backgroundNeutralSoft',
      borderColor: 'strokeNeutralTransparent',
    },
    success: {
      backgroundColor: 'backgroundSuccessSoft',
      borderColor: 'strokeNeutralTransparent',
    },
    warning: {
      backgroundColor: 'backgroundWarningSoft',
      borderColor: 'strokeNeutralTransparent',
    },
  },
  outline: {
    brand: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeBrandLoud',
    },
    danger: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeDangerLoud',
    },
    informative: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeNeutralLoud',
    },
    success: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeSuccessLoud',
    },
    warning: {
      backgroundColor: 'backgroundNeutralTransparent',
      borderColor: 'strokeWarningLoud',
    },
  },
};

const foregroundColorDefinition: ColorStyleDefinition<TextColorStyle, ColorStateLevels> = {
  tint: {
    brand: {
      color: 'foregroundBrandPrimary',
    },
    danger: {
      color: 'foregroundDangerPrimary',
    },
    informative: {
      color: 'foregroundNeutralPrimary',
    },
    success: {
      color: 'foregroundSuccessPrimary',
    },
    warning: {
      color: 'foregroundWarningPrimary',
    },
  },
  outline: {
    brand: {
      color: 'foregroundBrandPrimary',
    },
    danger: {
      color: 'foregroundDangerPrimary',
    },
    informative: {
      color: 'foregroundNeutralPrimary',
    },
    success: {
      color: 'foregroundSuccessPrimary',
    },
    warning: {
      color: 'foregroundWarningPrimary',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, ColorStateLevels>(
  'Badge.background',
  backgroundColorDefinition,
  colorStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ColorStateLevels>(
  'Badge.foreground',
  foregroundColorDefinition,
  colorStateLevels,
);

function getColorStateSource(state: BadgeState): ColorState[] {
  return [state.appearance, state.color];
}

export function getBadgeBackgroundStyle(state: BadgeState): ViewColorStyle {
  return getThemedBackgroundStyle(state, getColorStateSource(state));
}

export function getBadgeForegroundStyle(state: BadgeState): TextColorStyle {
  return getThemedForegroundStyle(state, getColorStateSource(state));
}

const appearanceStateLevels = [['tint', 'outline']] as const;
const getThemedAppearanceStyle = getThemedStateStyleFactory(
  'Badge.appearance',
  (tokens: FlexTokens): StyleDefinition<ViewStyle, typeof appearanceStateLevels> => ({
    tint: {
      borderWidth: getStrokeWidthStyleValue(tokens, badgeTraits.geometry.root.strokeWidth, 'tint'),
    },
    outline: {
      borderWidth: getStrokeWidthStyleValue(tokens, badgeTraits.geometry.root.strokeWidth, 'outline'),
    },
  }),
  appearanceStateLevels,
);

export function getBadgeAppearanceStyle(state: BadgeState): ViewStyle {
  return getThemedAppearanceStyle(state, [state.appearance]);
}

const rootStyleStateLevels = [
  ['small', 'medium'],
  ['circular', 'rounded'],
  ['iconAndText', 'iconOnly'],
] as const;
type RootStyleStateLevels = typeof rootStyleStateLevels;
type RootStyleState = StateNames<RootStyleStateLevels>;

function createRootStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  const { borderRadius, spacing } = tokens;
  const { radius } = badgeTraits.geometry.root;
  const gap = getGapStyleValue(spacing.componentBase50);

  return {
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'center',
    paddingVertical: 0,
    small: {
      minHeight: 16,
      circular: {
        borderRadius: borderRadius.circular,
        iconAndText: {
          gap,
          paddingHorizontal: spacing.componentBase100,
        },
        iconOnly: {
          minWidth: 16,
          paddingHorizontal: 0,
        },
      },
      rounded: {
        borderRadius: getRadiusStyleValue(tokens, radius, 'small'),
        iconAndText: {
          gap,
          paddingHorizontal: spacing.componentBase100,
        },
        iconOnly: {
          minWidth: 16,
          paddingHorizontal: 0,
        },
      },
    },
    medium: {
      minHeight: 20,
      circular: {
        borderRadius: borderRadius.circular,
        iconAndText: {
          gap,
          paddingHorizontal: spacing.componentBase150,
        },
        iconOnly: {
          minWidth: 20,
          paddingHorizontal: 0,
        },
      },
      rounded: {
        borderRadius: getRadiusStyleValue(tokens, radius, 'medium'),
        iconAndText: {
          gap,
          paddingHorizontal: spacing.componentBase150,
        },
        iconOnly: {
          minWidth: 20,
          paddingHorizontal: 0,
        },
      },
    },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Badge.root', createRootStyleDefinition, rootStyleStateLevels);

function getRootStyleSource(state: BadgeState): RootStyleState[] {
  return [state.size, state.shape, state.iconOnly ? 'iconOnly' : 'iconAndText'];
}

export function getBadgeRootStyle(state: BadgeState): ViewStyle {
  return getThemedRootStyle(state, getRootStyleSource(state));
}

const contentStateLevels = [['small', 'medium']] as const;

const getThemedContentStyle = getThemedStateStyleFactory(
  'Badge.content',
  (tokens: FlexTokens): StyleDefinition<TextStyle, typeof contentStateLevels> => ({
    small: functionalTypography(tokens, 'functionalCaption', badgeTraits.typography.content),
    medium: functionalTypography(tokens, 'functionalBodySmall', badgeTraits.typography.content),
  }),
  contentStateLevels,
);

export function getBadgeContentStyle(state: BadgeState): TextStyle {
  return getThemedContentStyle(state, [state.size]);
}

const iconSizes: Record<BadgeSize, number> = {
  small: 12,
  medium: 16,
};

export function getBadgeIconSize(size: BadgeSize): number {
  return iconSizes[size];
}
