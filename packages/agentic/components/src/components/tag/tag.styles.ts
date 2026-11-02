import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';

import {
  channelStatePriority,
  functionalTypography,
  getGapStyleValue,
  getRadiusStyleValue,
  getStrokeWidthStyleValue,
  getThemedColorStyleFactory,
  getThemedStateStyleFactory,
  resolveHoverMode,
} from '@fluentui-react-native/design/styling';
import type {
  ColorStyleDefinition,
  StateNames,
  StyleDefinition,
  TextColorStyle,
  ViewColorStyle,
} from '@fluentui-react-native/design/styling';
import { tagTraits } from './spec/traits';
import type { TagAppearance, TagSize, TagState } from './tag.types';

export const tagStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'flex-start',
    flexDirection: 'row',
    justifyContent: 'center',
  },
  content: {
    flexShrink: 1,
    textAlign: 'center',
  },
  icon: {
    flexShrink: 0,
  },
});

const backgroundStateLevels = [['primary', 'secondary'], channelStatePriority(tagTraits.channels.root.background)] as const;
type BackgroundStateLevels = typeof backgroundStateLevels;
type BackgroundState = StateNames<BackgroundStateLevels>;

const backgroundDefinition: ColorStyleDefinition<ViewColorStyle, BackgroundStateLevels> = {
  primary: {
    backgroundColor: 'backgroundBrandHeavy',
    disabled: {
      backgroundColor: 'backgroundNeutralHeavyDisabled',
    },
  },
  secondary: {
    backgroundColor: 'backgroundNeutralSubtle',
    disabled: {
      backgroundColor: 'backgroundNeutralSubtleDisabled',
    },
  },
};

const foregroundStateLevels = [['primary', 'secondary'], channelStatePriority(tagTraits.channels.content.foreground)] as const;
type ForegroundStateLevels = typeof foregroundStateLevels;

const foregroundDefinition: ColorStyleDefinition<TextColorStyle, ForegroundStateLevels> = {
  primary: {
    color: 'foregroundNeutralOnloud',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  secondary: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, BackgroundStateLevels>(
  'Tag.background',
  backgroundDefinition,
  backgroundStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ForegroundStateLevels>(
  'Tag.foreground',
  foregroundDefinition,
  foregroundStateLevels,
);

function getBackgroundStateSource(state: TagState): BackgroundState[] {
  const source: BackgroundState[] = [state.appearance];
  if (state.disabled) {
    source.push('disabled');
  }
  if (state.pressed) {
    source.push('pressed');
  }
  if (state.hovered && resolveHoverMode(tagTraits.hover, state.appearance) !== 'suppressed') {
    source.push('hovered');
  }
  return source;
}

function getForegroundStateSource(state: TagState): (TagAppearance | 'disabled')[] {
  const source: (TagAppearance | 'disabled')[] = [state.appearance];
  if (state.disabled) {
    source.push('disabled');
  }
  return source;
}

export function getTagBackgroundStyle(state: TagState): ViewColorStyle {
  return getThemedBackgroundStyle(state, getBackgroundStateSource(state));
}

export function getTagForegroundStyle(state: TagState): TextColorStyle {
  return getThemedForegroundStyle(state, getForegroundStateSource(state));
}

const rootStateLevels = [
  ['small', 'medium'],
  ['iconAndText', 'iconOnly'],
  ['rounded', 'circular'],
] as const;
type RootStateLevels = typeof rootStateLevels;
type RootState = StateNames<RootStateLevels>;

function createRootStyleDefinition(tokens: FlexTokens): StyleDefinition<ViewStyle, RootStateLevels> {
  const { borderRadius, spacing } = tokens;
  const { radius, strokeWidth } = tagTraits.geometry.root;
  return {
    borderWidth: getStrokeWidthStyleValue(tokens, strokeWidth),
    minHeight: 24,
    minWidth: 24,
    small: {
      iconAndText: {
        circular: {
          borderRadius: borderRadius.circular,
          gap: getGapStyleValue(spacing.componentBase50),
          paddingHorizontal: spacing.componentBase200,
          paddingVertical: spacing.componentBase100,
        },
        rounded: {
          borderRadius: getRadiusStyleValue(tokens, radius, 'small'),
          gap: getGapStyleValue(spacing.componentBase50),
          paddingHorizontal: spacing.componentBase200,
          paddingVertical: spacing.componentBase100,
        },
      },
      iconOnly: {
        circular: {
          borderRadius: borderRadius.circular,
          gap: 0,
          paddingHorizontal: spacing.componentBase100,
          paddingVertical: spacing.componentBase100,
        },
      },
    },
    medium: {
      iconAndText: {
        circular: {
          borderRadius: borderRadius.circular,
          gap: getGapStyleValue(spacing.componentBase50),
          paddingHorizontal: spacing.componentBase250,
          paddingVertical: spacing.componentBase150,
        },
        rounded: {
          borderRadius: getRadiusStyleValue(tokens, radius, 'medium'),
          gap: getGapStyleValue(spacing.componentBase50),
          paddingHorizontal: spacing.componentBase250,
          paddingVertical: spacing.componentBase150,
        },
      },
      iconOnly: {
        circular: {
          borderRadius: borderRadius.circular,
          gap: getGapStyleValue(spacing.componentBase50),
          paddingHorizontal: spacing.componentBase150,
          paddingVertical: spacing.componentBase150,
        },
      },
    },
  };
}

const getThemedRootStyle = getThemedStateStyleFactory('Tag.root', createRootStyleDefinition, rootStateLevels);

function getRootStyleSource(state: TagState): RootState[] {
  return [state.size, state.iconOnly ? 'iconOnly' : 'iconAndText', state.iconOnly ? 'circular' : state.shape];
}

export function getTagRootStyle(state: TagState): ViewStyle {
  return getThemedRootStyle(state, getRootStyleSource(state));
}

const contentStateLevels = [['small', 'medium'], ['disabled']] as const;

function createContentStyleDefinition(tokens: FlexTokens): StyleDefinition<TextStyle, typeof contentStateLevels> {
  const typography = tagTraits.typography.content;
  const paddingHorizontal = tokens.spacing.componentBase50;
  return {
    small: { ...functionalTypography(tokens, 'functionalBodySmall', typography), paddingHorizontal },
    medium: { ...functionalTypography(tokens, 'functionalBodyMedium', typography), paddingHorizontal },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory('Tag.content', createContentStyleDefinition, contentStateLevels);

export function getTagContentStyle(state: TagState): TextStyle {
  return getThemedContentStyle(state, [state.size]);
}

const iconSizes: Record<TagSize, { dismiss: number; leading: number }> = {
  small: {
    dismiss: 12,
    leading: 16,
  },
  medium: {
    dismiss: 16,
    leading: 20,
  },
};

export function getTagIconSize(size: TagSize): { dismiss: number; leading: number } {
  return iconSizes[size];
}
