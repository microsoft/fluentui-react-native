import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import { getThemedColorStyleFactory, getThemedStateStyleFactory, interactiveStatePriority } from '@fluentui-react-native/design/styling';
import type {
  ColorStyleDefinition,
  StateNames,
  StyleDefinition,
  TextColorStyle,
  ViewColorStyle,
} from '@fluentui-react-native/design/styling';
import { size160, size200, size240, size320, size400 } from '@fluentui-react-native/design/tokens/global';

import type { ListItemState } from './list-item.types';

export const listItemStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    alignSelf: 'stretch',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    width: '100%',
  },
  trailingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
  },
  leadingContainer: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  leadingContainerUnder: {
    alignSelf: 'flex-start',
  },
  avatar: {
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  selectionIndicator: {
    flexShrink: 0,
    textAlign: 'center',
    textAlignVertical: 'center',
  },
  secondaryRight: {
    flexShrink: 0,
    marginStart: 'auto',
    textAlign: 'right',
  },
});

const backgroundStateLevels = [['rest', 'selected'], interactiveStatePriority] as const;
type BackgroundStateLevels = typeof backgroundStateLevels;
type BackgroundState = StateNames<BackgroundStateLevels>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, BackgroundStateLevels> = {
  rest: {
    backgroundColor: 'backgroundNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralTransparent',
    },
    hovered: {
      backgroundColor: 'backgroundNeutralTransparent',
    },
    pressed: {
      backgroundColor: 'backgroundNeutralTransparent',
    },
  },
  selected: {
    backgroundColor: 'backgroundNeutralSoft',
    disabled: {
      backgroundColor: 'backgroundNeutralTransparent',
    },
    hovered: {
      backgroundColor: 'backgroundNeutralSoft',
    },
    pressed: {
      backgroundColor: 'backgroundNeutralSoft',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, BackgroundStateLevels>(
  'ListItem.background',
  backgroundColorDefinition,
  backgroundStateLevels,
);

function getBackgroundStateSource(state: ListItemState): BackgroundState[] {
  const source: BackgroundState[] = [state.selectedFill ? 'selected' : 'rest'];
  if (state.disabled) {
    source.push('disabled');
  } else if (state.pressed) {
    source.push('pressed');
  } else if (state.hovered) {
    source.push('hovered');
  }
  return source;
}

export function getListItemBackgroundStyle(state: ListItemState): ViewColorStyle {
  return getThemedBackgroundStyle(state, getBackgroundStateSource(state));
}

const primaryForegroundStateLevels = [['rest'], interactiveStatePriority] as const;
type PrimaryForegroundStateLevels = typeof primaryForegroundStateLevels;
type PrimaryForegroundState = StateNames<PrimaryForegroundStateLevels>;

const primaryForegroundDefinition: ColorStyleDefinition<TextColorStyle, PrimaryForegroundStateLevels> = {
  rest: {
    color: 'foregroundNeutralPrimary',
    disabled: { color: 'foregroundNeutralDisabled' },
    pressed: {
      color: 'foregroundNeutralPrimary',
    },
    hovered: {
      color: 'foregroundNeutralPrimary',
    },
  },
};

const getThemedPrimaryForegroundStyle = getThemedColorStyleFactory<TextColorStyle, PrimaryForegroundStateLevels>(
  'ListItem.primaryForeground',
  primaryForegroundDefinition,
  primaryForegroundStateLevels,
);

function getPrimaryForegroundStateSource(state: ListItemState): PrimaryForegroundState[] {
  const source: PrimaryForegroundState[] = ['rest'];
  if (state.disabled) {
    source.push('disabled');
    return source;
  }
  if (state.pressed) {
    source.push('pressed');
    return source;
  }
  if (state.hovered) {
    source.push('hovered');
    return source;
  }
  return source;
}

export function getListItemPrimaryForegroundStyle(state: ListItemState): TextColorStyle {
  return getThemedPrimaryForegroundStyle(state, getPrimaryForegroundStateSource(state));
}

const secondaryForegroundStateLevels = [['rest', 'selected'], interactiveStatePriority] as const;
type SecondaryForegroundStateLevels = typeof secondaryForegroundStateLevels;
type SecondaryForegroundState = StateNames<SecondaryForegroundStateLevels>;

const secondaryForegroundDefinition: ColorStyleDefinition<TextColorStyle, SecondaryForegroundStateLevels> = {
  rest: {
    color: 'foregroundNeutralSecondary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundNeutralSecondary',
    },
    pressed: {
      color: 'foregroundNeutralSecondary',
    },
  },
  selected: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    hovered: {
      color: 'foregroundNeutralPrimary',
    },
    pressed: {
      color: 'foregroundNeutralPrimary',
    },
  },
};

const getThemedSecondaryForegroundStyle = getThemedColorStyleFactory<TextColorStyle, SecondaryForegroundStateLevels>(
  'ListItem.secondaryForeground',
  secondaryForegroundDefinition,
  secondaryForegroundStateLevels,
);

function getSecondaryForegroundStateSource(state: ListItemState): SecondaryForegroundState[] {
  const source: SecondaryForegroundState[] = [state.selected ? 'selected' : 'rest'];
  if (state.disabled) {
    source.push('disabled');
  } else if (state.pressed) {
    source.push('pressed');
  } else if (state.hovered) {
    source.push('hovered');
  }
  return source;
}

export function getListItemSecondaryForegroundStyle(state: ListItemState): TextColorStyle {
  return getThemedSecondaryForegroundStyle(state, getSecondaryForegroundStateSource(state));
}

const contentStateLevels = [['small', 'medium', 'large'], ['selected']] as const;
type ContentStateLevels = typeof contentStateLevels;

function createContentStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, ContentStateLevels> {
  const selected: TextStyle = { fontWeight: fontWeight.functionalSemibold };
  return {
    fontFamily: fontFamily.functional,
    small: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
      selected,
    },
    medium: {
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
      selected,
    },
    large: {
      fontSize: fontSize.functionalBodyLarge,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyLarge,
      selected,
    },
  };
}

const getThemedContentStyle = getThemedStateStyleFactory('ListItem.content', createContentStyleDefinition, contentStateLevels);

export function getListItemContentStyle(state: ListItemState, selected = state.selected): TextStyle {
  return getThemedContentStyle(state, [state.size, ...(selected ? ['selected'] : [])]);
}

const secondaryStateLevels = [['small', 'medium', 'large']] as const;
type SecondaryStateLevels = typeof secondaryStateLevels;

function createSecondaryStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, SecondaryStateLevels> {
  return {
    fontFamily: fontFamily.functional,
    small: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
    medium: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
    large: {
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
    },
  };
}

const getThemedSecondaryStyle = getThemedStateStyleFactory('ListItem.secondary', createSecondaryStyleDefinition, secondaryStateLevels);

export function getListItemSecondaryContentStyle(state: ListItemState): TextStyle {
  return getThemedSecondaryStyle(state, [state.size]);
}

export function getListItemRootSizeStyle(state: ListItemState): ViewStyle {
  return {
    borderRadius: state.tokens.borderRadius.base300,
    paddingHorizontal: state.metrics.rootPaddingHorizontal,
    paddingVertical: state.metrics.rootPaddingVertical,
  };
}

const sizeToIconSize: Record<ListItemState['size'], number> = {
  small: size160,
  medium: size200,
  large: size240,
};

const sizeToAvatarSize: Record<ListItemState['size'], number> = {
  small: size200,
  medium: size320,
  large: size400,
};

export function getListItemIconSize(size: ListItemState['size']): number {
  return sizeToIconSize[size];
}

export function getListItemAvatarSize(size: ListItemState['size']): number {
  return sizeToAvatarSize[size];
}

export function getListItemSelectionIndicatorGlyph(selected: boolean, selectionMode: ListItemState['selectionMode']): string {
  if (selectionMode === 'single') {
    return selected ? '◉' : '○';
  }
  return selected ? '☑' : '☐';
}
