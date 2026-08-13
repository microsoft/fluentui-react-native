import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import { getThemedStateStyleFactory } from '../../utils/branchedStyle';
import type { StateNames, StyleDefinition } from '../../utils/branchedStyle';
import { getThemedColorStyleFactory } from '../../utils/colorStyles';
import type { ColorStyleDefinition, TextColorStyle, ViewColorStyle } from '../../utils/colorStyles';
import type { BadgeSize, BadgeState } from './badge.types';

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

const colorStateLevels = [['tint', 'outline'], ['brand', 'danger', 'success', 'warning', 'informative']] as const;
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
  ({ strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof appearanceStateLevels> => ({
    tint: {
      borderWidth: 0,
    },
    outline: {
      borderWidth: strokeWidth.thin,
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

function getGapValue(value: FlexTokens['spacing']['componentBase50']): NonNullable<ViewStyle['gap']> {
  if (typeof value === 'number' || typeof value === 'string') {
    return value;
  }
  throw new TypeError('Badge gap tokens must resolve to a number or string.');
}

function createRootStyleDefinition({ borderRadius, spacing }: FlexTokens): StyleDefinition<ViewStyle, RootStyleStateLevels> {
  const gap = getGapValue(spacing.componentBase50);

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
        borderRadius: borderRadius.base100,
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
        borderRadius: borderRadius.base200,
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
  ({
    fontFamily,
    fontSize,
    fontWeight,
    lineHeight,
  }: FlexTokens): StyleDefinition<TextStyle, typeof contentStateLevels> => ({
    fontFamily: fontFamily.functional,
    small: {
      fontSize: fontSize.functionalCaption,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalCaption,
    },
    medium: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
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
