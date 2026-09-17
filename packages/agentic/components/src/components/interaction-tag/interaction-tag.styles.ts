import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import { themedStyleSheetFactory } from '@fluentui-react-native/design';
import type { FlexTokens } from '@fluentui-react-native/design';

import {
  getGapStyleValue,
  getNumericStyleValue,
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
import type { PressableState } from '@fluentui-react-native/framework-base';

import type { AvatarSize } from '../avatar/avatar.types';
import type { InteractionTagAppearance, InteractionTagSize, InteractionTagState } from './interaction-tag.types';

/**
 * The minimum square target box for either action region.
 */
const minimumTargetBox = 24;

export const interactionTagStyles = StyleSheet.create({
  action: {
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    minHeight: minimumTargetBox,
    minWidth: minimumTargetBox,
  },
  content: {
    flexShrink: 1,
    textAlign: 'center',
  },
  dismiss: {
    flexShrink: 0,
  },
  divider: {
    alignSelf: 'stretch',
    flexShrink: 0,
  },
  icon: {
    flexShrink: 0,
  },
  primaryAction: {
    flexShrink: 1,
  },
  root: {
    alignItems: 'stretch',
    alignSelf: 'flex-start',
    borderWidth: 0,
    flexDirection: 'row',
    minHeight: minimumTargetBox,
  },
});

export const getInteractionTagThemedStyles = themedStyleSheetFactory('InteractionTag.themed', ({ tokens }) =>
  StyleSheet.create({
    divider: {
      width: getNumericStyleValue(tokens.strokeWidth.thin) as ViewStyle['width'],
    },
  }),
);

const backgroundStateLevels = [['primary', 'secondary'], interactiveStatePriority] as const;
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

const appearanceStateLevels = [['primary', 'secondary'], ['disabled']] as const;
type AppearanceStateLevels = typeof appearanceStateLevels;
type AppearanceState = InteractionTagAppearance | 'disabled';

const foregroundDefinition: ColorStyleDefinition<TextColorStyle, AppearanceStateLevels> = {
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

const dividerDefinition: ColorStyleDefinition<ViewColorStyle, AppearanceStateLevels> = {
  primary: {
    backgroundColor: 'strokeNeutralOnloud',
    disabled: {
      backgroundColor: 'strokeNeutralDisabled',
    },
  },
  secondary: {
    backgroundColor: 'strokeNeutralSubtle',
    disabled: {
      backgroundColor: 'strokeNeutralDisabled',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, BackgroundStateLevels>(
  'InteractionTag.background',
  backgroundDefinition,
  backgroundStateLevels,
);
const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, AppearanceStateLevels>(
  'InteractionTag.foreground',
  foregroundDefinition,
  appearanceStateLevels,
);
const getThemedDividerStyle = getThemedColorStyleFactory<ViewColorStyle, AppearanceStateLevels>(
  'InteractionTag.divider',
  dividerDefinition,
  appearanceStateLevels,
);

function getAppearanceStateSource(state: InteractionTagState): AppearanceState[] {
  const source: AppearanceState[] = [state.appearance];
  if (state.disabled) {
    source.push('disabled');
  }
  return source;
}

function getBackgroundStateSource(state: InteractionTagState, region: PressableState): BackgroundState[] {
  const source: BackgroundState[] = [state.appearance];
  if (state.disabled) {
    source.push('disabled');
  }
  if (region.pressed) {
    source.push('pressed');
  }
  if (region.hovered) {
    source.push('hovered');
  }
  return source;
}

/**
 * Resolves one action region's background from the tag appearance and that region's own interaction state, so the two
 * regions never share a hover or pressed fill.
 */
export function getInteractionTagBackgroundStyle(state: InteractionTagState, region: PressableState): ViewColorStyle {
  return getThemedBackgroundStyle(state, getBackgroundStateSource(state, region));
}

export function getInteractionTagForegroundStyle(state: InteractionTagState): TextColorStyle {
  return getThemedForegroundStyle(state, getAppearanceStateSource(state));
}

export function getInteractionTagDividerColorStyle(state: InteractionTagState): ViewColorStyle {
  return getThemedDividerStyle(state, getAppearanceStateSource(state));
}

const containerStateLevels = [
  ['small', 'medium'],
  ['iconAndText', 'iconOnly'],
  ['rounded', 'circular'],
] as const;
type ContainerStateLevels = typeof containerStateLevels;
type ContainerState = StateNames<ContainerStateLevels>;

function createRadiusDefinition(
  { borderRadius }: FlexTokens,
  toCorners: (radius: ViewStyle['borderRadius']) => ViewStyle,
): StyleDefinition<ViewStyle, ContainerStateLevels> {
  return {
    small: {
      iconAndText: {
        circular: toCorners(borderRadius.circular),
        rounded: toCorners(borderRadius.base200),
      },
      iconOnly: {
        circular: toCorners(borderRadius.circular),
      },
    },
    medium: {
      iconAndText: {
        circular: toCorners(borderRadius.circular),
        rounded: toCorners(borderRadius.base300),
      },
      iconOnly: {
        circular: toCorners(borderRadius.circular),
      },
    },
  };
}

function toContainerCorners(borderRadius: ViewStyle['borderRadius']): ViewStyle {
  return { borderRadius };
}

function toLeadingCorners(borderRadius: ViewStyle['borderRadius']): ViewStyle {
  return {
    borderEndEndRadius: 0,
    borderEndStartRadius: borderRadius,
    borderStartEndRadius: 0,
    borderStartStartRadius: borderRadius,
  };
}

function toTrailingCorners(borderRadius: ViewStyle['borderRadius']): ViewStyle {
  return {
    borderEndEndRadius: borderRadius,
    borderEndStartRadius: 0,
    borderStartEndRadius: borderRadius,
    borderStartStartRadius: 0,
  };
}

const getThemedContainerStyle = getThemedStateStyleFactory(
  'InteractionTag.container',
  (tokens: FlexTokens) => createRadiusDefinition(tokens, toContainerCorners),
  containerStateLevels,
);
const getThemedLeadingCornerStyle = getThemedStateStyleFactory(
  'InteractionTag.leadingCorners',
  (tokens: FlexTokens) => createRadiusDefinition(tokens, toLeadingCorners),
  containerStateLevels,
);
const getThemedTrailingCornerStyle = getThemedStateStyleFactory(
  'InteractionTag.trailingCorners',
  (tokens: FlexTokens) => createRadiusDefinition(tokens, toTrailingCorners),
  containerStateLevels,
);

function getContainerStateSource(state: InteractionTagState): ContainerState[] {
  return [state.size, state.iconOnly ? 'iconOnly' : 'iconAndText', state.iconOnly ? 'circular' : state.shape];
}

export function getInteractionTagContainerStyle(state: InteractionTagState): ViewStyle {
  return getThemedContainerStyle(state, getContainerStateSource(state));
}

/**
 * Outer corners for the leading region. The edge that meets the divider stays square.
 */
export function getInteractionTagLeadingCornerStyle(state: InteractionTagState): ViewStyle {
  return getThemedLeadingCornerStyle(state, getContainerStateSource(state));
}

/**
 * Outer corners for the trailing region. The edge that meets the divider stays square.
 */
export function getInteractionTagTrailingCornerStyle(state: InteractionTagState): ViewStyle {
  return getThemedTrailingCornerStyle(state, getContainerStateSource(state));
}

const sizeStateLevels = [['small', 'medium']] as const;

function createActionStyleDefinition({ spacing }: FlexTokens): StyleDefinition<ViewStyle, typeof sizeStateLevels> {
  return {
    small: {
      gap: getGapStyleValue(spacing.componentBase50),
      paddingHorizontal: spacing.componentBase150,
      paddingVertical: spacing.componentBase100,
    },
    medium: {
      gap: getGapStyleValue(spacing.componentBase50),
      paddingHorizontal: spacing.componentBase200,
      paddingVertical: spacing.componentBase150,
    },
  };
}

const getThemedActionStyle = getThemedStateStyleFactory('InteractionTag.action', createActionStyleDefinition, sizeStateLevels);

export function getInteractionTagActionStyle(state: InteractionTagState): ViewStyle {
  return getThemedActionStyle(state, [state.size]);
}

function createContentStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
  spacing,
}: FlexTokens): StyleDefinition<TextStyle, typeof sizeStateLevels> {
  return {
    fontFamily: fontFamily.functional,
    small: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
      paddingHorizontal: spacing.componentBase50,
    },
    medium: {
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
      paddingHorizontal: spacing.componentBase50,
    },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory('InteractionTag.content', createContentStyleDefinition, sizeStateLevels);

export function getInteractionTagContentStyle(state: InteractionTagState): TextStyle {
  return getThemedContentStyle(state, [state.size]);
}

const iconSizes: Record<InteractionTagSize, { avatar: AvatarSize; dismiss: number; leading: number }> = {
  small: {
    avatar: 16,
    dismiss: 12,
    leading: 16,
  },
  medium: {
    avatar: 20,
    dismiss: 16,
    leading: 20,
  },
};

export function getInteractionTagIconSize(size: InteractionTagSize): { avatar: AvatarSize; dismiss: number; leading: number } {
  return iconSizes[size];
}
