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
import { size160, size200 } from '@fluentui-react-native/design/tokens/global';

import type { NavItemDensity, NavItemState } from './nav-item.types';

export const navItemStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    flexDirection: 'row',
  },
  rootLabeled: {
    alignSelf: 'stretch',
    justifyContent: 'flex-start',
    width: '100%',
  },
  rootRail: {
    alignSelf: 'flex-start',
    justifyContent: 'center',
  },
  leadingContainer: {
    flexShrink: 0,
  },
  selectedIndicator: {
    position: 'absolute',
  },
  trailingContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
  },
  trailingContent: {
    flexShrink: 0,
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
  },
  selected: {
    backgroundColor: 'backgroundNeutralSoft',
    disabled: {
      backgroundColor: 'backgroundNeutralSubtleDisabled',
    },
  },
};

const getThemedBackgroundStyle = getThemedColorStyleFactory<ViewColorStyle, BackgroundStateLevels>(
  'NavItem.background',
  backgroundColorDefinition,
  backgroundStateLevels,
);

function getInteractionState(state: NavItemState): 'disabled' | 'pressed' | 'hovered' | undefined {
  if (state.disabled) {
    return 'disabled';
  }
  if (state.pressed) {
    return 'pressed';
  }
  if (state.hovered) {
    return 'hovered';
  }
  return undefined;
}

function getBackgroundStateSource(state: NavItemState): BackgroundState[] {
  const source: BackgroundState[] = [state.selected ? 'selected' : 'rest'];
  const interaction = getInteractionState(state);
  if (interaction) {
    source.push(interaction);
  }
  return source;
}

export function getNavItemBackgroundStyle(state: NavItemState): ViewColorStyle {
  return getThemedBackgroundStyle(state, getBackgroundStateSource(state));
}

const foregroundStateLevels = [['label', 'leadingIcon', 'secondary'], interactiveStatePriority] as const;
type ForegroundStateLevels = typeof foregroundStateLevels;
type ForegroundState = StateNames<ForegroundStateLevels>;
type NavItemForegroundRole = 'label' | 'leadingIcon' | 'secondary';

const foregroundColorDefinition: ColorStyleDefinition<TextColorStyle, ForegroundStateLevels> = {
  color: 'foregroundNeutralPrimary',
  label: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  leadingIcon: {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
  secondary: {
    color: 'foregroundNeutralSecondary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedForegroundStyle = getThemedColorStyleFactory<TextColorStyle, ForegroundStateLevels>(
  'NavItem.foreground',
  foregroundColorDefinition,
  foregroundStateLevels,
);

const selectedLeadingIconStateLevels = [['selected'], interactiveStatePriority] as const;
type SelectedLeadingIconStateLevels = typeof selectedLeadingIconStateLevels;
type SelectedLeadingIconState = StateNames<SelectedLeadingIconStateLevels>;

const selectedLeadingIconColorDefinition: ColorStyleDefinition<TextColorStyle, SelectedLeadingIconStateLevels> = {
  color: 'foregroundBrandPrimary',
  selected: {
    color: 'foregroundBrandPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedSelectedLeadingIconStyle = getThemedColorStyleFactory<TextColorStyle, SelectedLeadingIconStateLevels>(
  'NavItem.selectedLeadingIcon',
  selectedLeadingIconColorDefinition,
  selectedLeadingIconStateLevels,
);

/**
 * Resolves the foreground color for one of the row's content roles. A selected row recolors only its leading icon.
 */
export function getNavItemForegroundStyle(state: NavItemState, role: NavItemForegroundRole): TextColorStyle {
  const interaction = getInteractionState(state);
  if (role === 'leadingIcon' && state.selected) {
    const source: SelectedLeadingIconState[] = ['selected'];
    if (interaction) {
      source.push(interaction);
    }
    return getThemedSelectedLeadingIconStyle(state, source);
  }
  const source: ForegroundState[] = [role];
  if (interaction) {
    source.push(interaction);
  }
  return getThemedForegroundStyle(state, source);
}

const indicatorStateLevels = [['rest', 'selected', 'selectedDisabled']] as const;
type IndicatorStateLevels = typeof indicatorStateLevels;
type IndicatorState = StateNames<IndicatorStateLevels>;

function createIndicatorStyleDefinition({ color }: FlexTokens): StyleDefinition<ViewStyle, IndicatorStateLevels> {
  return {
    rest: {
      backgroundColor: color.strokeNeutralTransparent,
    },
    selected: {
      backgroundColor: color.strokeBrandLoud,
    },
    selectedDisabled: {
      backgroundColor: color.strokeNeutralDisabled,
    },
  };
}

const getThemedIndicatorStyle = getThemedStateStyleFactory(
  'NavItem.selectedIndicator',
  createIndicatorStyleDefinition,
  indicatorStateLevels,
);

/**
 * Resolves the selected indicator color. The indicator stays mounted and never participates in interaction tinting.
 */
export function getNavItemIndicatorStyle(state: NavItemState): ViewStyle {
  const source: IndicatorState[] = [state.selected ? (state.disabled ? 'selectedDisabled' : 'selected') : 'rest'];
  return getThemedIndicatorStyle(state, source);
}

const labelStateLevels = [['comfortable', 'compact'], ['selected']] as const;
type LabelStateLevels = typeof labelStateLevels;

function createLabelStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, LabelStateLevels> {
  const selected: TextStyle = { fontWeight: fontWeight.functionalSemibold };
  return {
    fontFamily: fontFamily.functional,
    comfortable: {
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
      selected,
    },
    compact: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
      selected,
    },
  };
}

const getThemedLabelStyle = getThemedStateStyleFactory('NavItem.label', createLabelStyleDefinition, labelStateLevels);

export function getNavItemLabelStyle(state: NavItemState, selected = state.selected): TextStyle {
  return getThemedLabelStyle(state, [state.density, ...(selected ? ['selected' as const] : [])]);
}

const trailingContentStateLevels = [['comfortable', 'compact']] as const;
type TrailingContentStateLevels = typeof trailingContentStateLevels;

function createTrailingContentStyleDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, TrailingContentStateLevels> {
  return {
    fontFamily: fontFamily.functional,
    comfortable: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
    compact: {
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
  };
}

const getThemedTrailingContentStyle = getThemedStateStyleFactory(
  'NavItem.trailingContent',
  createTrailingContentStyleDefinition,
  trailingContentStateLevels,
);

export function getNavItemTrailingContentStyle(state: NavItemState): TextStyle {
  return getThemedTrailingContentStyle(state, [state.density]);
}

export function getNavItemRootSizeStyle(state: NavItemState): ViewStyle {
  return {
    borderRadius: state.tokens.borderRadius.base300,
    paddingEnd: state.metrics.rootPaddingHorizontal,
    paddingStart: state.metrics.rootPaddingStart,
    paddingVertical: state.metrics.rootPaddingVertical,
  };
}

const densityToLeadingSize: Record<NavItemDensity, number> = {
  comfortable: size200,
  compact: size160,
};

export function getNavItemLeadingSize(density: NavItemDensity): number {
  return densityToLeadingSize[density];
}

/**
 * The trailing chevron reuses the shared angle glyph. Rotating it keeps the collapsed caret pointing down and the
 * expanded caret pointing up without adding another icon source.
 */
export function getNavItemChevronRotation(expanded: boolean): string {
  return expanded ? '-90deg' : '90deg';
}
