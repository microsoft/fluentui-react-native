import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { FlexTokens } from '@fluentui-react-native/design';
import { getThemedColorStyleFactory, getThemedStateStyleFactory } from '@fluentui-react-native/design/styling';
import type {
  ColorStyleDefinition,
  StateNames,
  StyleDefinition,
  TextColorStyle,
  ViewColorStyle,
} from '@fluentui-react-native/design/styling';
import { size160, size400, sizeNone } from '@fluentui-react-native/design/tokens/global';

import type { MenuItemState } from './menu-item.types';

export const menuItemStyles = StyleSheet.create({
  root: {
    borderStyle: 'solid',
    flexDirection: 'row',
    gap: size160,
    justifyContent: 'flex-start',
    minHeight: size400,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  leading: {
    alignItems: 'center',
    flexShrink: 0,
    justifyContent: 'center',
  },
  contentColumn: {
    flexGrow: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  contentRow: {
    alignItems: 'center',
    flexDirection: 'row',
    flexGrow: 1,
    flexShrink: 1,
    justifyContent: 'space-between',
    minWidth: 0,
  },
  labelContainer: {
    flexShrink: 1,
    justifyContent: 'center',
    minWidth: 0,
    position: 'relative',
  },
  labelGhost: {
    opacity: 0,
  },
  secondaryContainer: {
    flexShrink: 1,
    justifyContent: 'center',
    minWidth: 0,
    position: 'relative',
  },
  secondaryGhost: {
    opacity: 0,
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    flexShrink: 0,
    gap: size160,
    justifyContent: 'flex-end',
  },
  multiselectCheckbox: {
    alignItems: 'center',
    borderStyle: 'solid',
    justifyContent: 'center',
  },
  skeletonIcon: {
    borderRadius: 4,
    height: 20,
    width: 20,
  },
  skeletonLabel: {
    borderRadius: 4,
    height: 24,
    width: 120,
  },
  skeletonSecondary: {
    borderRadius: 4,
    height: 20,
    width: 96,
  },
});

const backgroundStateLevels = [['list-item', 'section-header'], ['selected'], ['disabled', 'pressed', 'hovered']] as const;
type BackgroundStateLevels = typeof backgroundStateLevels;
type BackgroundState = StateNames<BackgroundStateLevels>;

const backgroundColorDefinition: ColorStyleDefinition<ViewColorStyle, BackgroundStateLevels> = {
  'list-item': {
    backgroundColor: 'backgroundNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralTransparent',
    },
    selected: {
      backgroundColor: 'backgroundNeutralSoft',
      disabled: {
        backgroundColor: 'backgroundNeutralSubtleDisabled',
      },
    },
  },
  'section-header': {
    backgroundColor: 'backgroundNeutralTransparent',
    disabled: {
      backgroundColor: 'backgroundNeutralTransparent',
    },
  },
};

const getThemedBackground = getThemedColorStyleFactory<ViewColorStyle, BackgroundStateLevels>(
  'MenuItem.background',
  backgroundColorDefinition,
  backgroundStateLevels,
);

function getBackgroundStateSource(state: MenuItemState): BackgroundState[] {
  const source: BackgroundState[] = [state.menuStyle];
  if (state.isSelectedVisual) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  } else if (state.pressed) {
    source.push('pressed');
  } else if (state.hovered) {
    source.push('hovered');
  }
  return source;
}

export function getMenuItemRootStyle(state: MenuItemState): ViewStyle {
  return getThemedBackground(state, getBackgroundStateSource(state));
}

const focusStateLevels = [['focused']] as const;

const getThemedFocus = getThemedStateStyleFactory(
  'MenuItem.focus',
  ({ color, strokeWidth }: FlexTokens): StyleDefinition<ViewStyle, typeof focusStateLevels> => ({
    focused: {
      borderColor: color.strokeFocusInner,
      outlineColor: color.strokeFocusOuter,
      outlineOffset: strokeWidth.thin,
      outlineStyle: 'solid',
      outlineWidth: strokeWidth.thick,
    },
  }),
  focusStateLevels,
);

export function getMenuItemFocusStyle(state: MenuItemState): ViewStyle | undefined {
  return state.focused && !state.disabled && state.isListItem ? getThemedFocus(state, ['focused']) : undefined;
}

const labelFontStateLevels = [['list-item', 'section-header'], ['selected']] as const;
type LabelFontStateLevels = typeof labelFontStateLevels;

function createLabelFontDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, LabelFontStateLevels> {
  return {
    'list-item': {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodyMedium,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodyMedium,
      selected: {
        fontWeight: fontWeight.functionalSemibold,
      },
    },
    'section-header': {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalSemibold,
      lineHeight: lineHeight.functionalBodySmall,
    },
  };
}

const getThemedLabelFont = getThemedStateStyleFactory('MenuItem.labelFont', createLabelFontDefinition, labelFontStateLevels);

const secondaryFontStateLevels = [['list-item', 'section-header'], ['selected']] as const;
type SecondaryFontStateLevels = typeof secondaryFontStateLevels;

function createSecondaryFontDefinition({
  fontFamily,
  fontSize,
  fontWeight,
  lineHeight,
}: FlexTokens): StyleDefinition<TextStyle, SecondaryFontStateLevels> {
  return {
    'list-item': {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
      selected: {
        fontWeight: fontWeight.functionalSemibold,
      },
    },
    'section-header': {
      fontFamily: fontFamily.functional,
      fontSize: fontSize.functionalBodySmall,
      fontWeight: fontWeight.functionalRegular,
      lineHeight: lineHeight.functionalBodySmall,
    },
  };
}

const getThemedSecondaryFont = getThemedStateStyleFactory(
  'MenuItem.secondaryFont',
  createSecondaryFontDefinition,
  secondaryFontStateLevels,
);

const labelColorStateLevels = [['list-item', 'section-header'], ['selected'], ['disabled', 'pressed', 'hovered']] as const;
type LabelColorStateLevels = typeof labelColorStateLevels;
type LabelColorState = StateNames<LabelColorStateLevels>;

const labelColorDefinition: ColorStyleDefinition<TextColorStyle, LabelColorStateLevels> = {
  'list-item': {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    selected: {
      color: 'foregroundNeutralPrimary',
    },
  },
  'section-header': {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedLabelColor = getThemedColorStyleFactory<TextColorStyle, LabelColorStateLevels>(
  'MenuItem.labelColor',
  labelColorDefinition,
  labelColorStateLevels,
);

function getLabelColorStateSource(state: MenuItemState): LabelColorState[] {
  const source: LabelColorState[] = [state.menuStyle];
  if (state.isSelectedVisual) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  } else if (state.pressed) {
    source.push('pressed');
  } else if (state.hovered) {
    source.push('hovered');
  }
  return source;
}

const secondaryColorStateLevels = [['list-item', 'section-header'], ['selected'], ['disabled', 'pressed', 'hovered']] as const;
type SecondaryColorStateLevels = typeof secondaryColorStateLevels;
type SecondaryColorState = StateNames<SecondaryColorStateLevels>;

const secondaryColorDefinition: ColorStyleDefinition<TextColorStyle, SecondaryColorStateLevels> = {
  'list-item': {
    color: 'foregroundNeutralSecondary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
    selected: {
      color: 'foregroundNeutralPrimary',
    },
  },
  'section-header': {
    color: 'foregroundNeutralPrimary',
    disabled: {
      color: 'foregroundNeutralDisabled',
    },
  },
};

const getThemedSecondaryColor = getThemedColorStyleFactory<TextColorStyle, SecondaryColorStateLevels>(
  'MenuItem.secondaryColor',
  secondaryColorDefinition,
  secondaryColorStateLevels,
);

function getSecondaryColorStateSource(state: MenuItemState): SecondaryColorState[] {
  const source: SecondaryColorState[] = [state.menuStyle];
  if (state.isSelectedVisual) {
    source.push('selected');
  }
  if (state.disabled) {
    source.push('disabled');
  } else if (state.pressed) {
    source.push('pressed');
  } else if (state.hovered) {
    source.push('hovered');
  }
  return source;
}

export function getMenuItemLabelStyle(state: MenuItemState): TextStyle {
  return {
    ...getThemedLabelFont(state, [state.menuStyle, ...(state.isSelectedVisual ? ['selected'] : [])]),
    ...getThemedLabelColor(state, getLabelColorStateSource(state)),
  };
}

export function getMenuItemSecondaryStyle(state: MenuItemState): TextStyle {
  return {
    ...getThemedSecondaryFont(state, [state.menuStyle, ...(state.isSelectedVisual ? ['selected'] : [])]),
    ...getThemedSecondaryColor(state, getSecondaryColorStateSource(state)),
  };
}

export function getMenuItemGhostStyle(base: TextStyle): TextStyle {
  return {
    ...base,
    opacity: 0,
  };
}

export function getMenuItemCheckboxStyle(state: MenuItemState): ViewStyle {
  const colors = state.tokens.color;
  return {
    alignItems: 'center',
    backgroundColor: state.selected ? colors.backgroundBrandHeavy : colors.backgroundNeutralTransparent,
    borderColor: state.selected ? colors.backgroundBrandHeavy : colors.strokeNeutralLoud,
    borderRadius: 4,
    borderWidth: 1,
    height: size160,
    justifyContent: 'center',
    width: size160,
  };
}

export function getMenuItemLeadingStyle(state: MenuItemState): ViewStyle {
  return {
    alignSelf:
      state.secondaryContentText &&
      state.secondaryContentText !== null &&
      state.secondaryContentText !== '' &&
      state.secondaryContentPosition === 'under'
        ? 'flex-start'
        : 'center',
    justifyContent: 'center',
  };
}

export function getMenuItemTrailingStyle(state: MenuItemState): ViewStyle {
  return {
    alignSelf: state.secondaryContentPosition === 'under' ? 'flex-start' : 'center',
  };
}

export function getMenuItemContentLayoutStyle(state: MenuItemState): ViewStyle {
  return state.secondaryContentPosition === 'under'
    ? {
        flexDirection: 'column',
        gap: sizeNone,
      }
    : {
        alignItems: 'center',
        flexDirection: 'row',
        gap: size160,
      };
}

export function getMenuItemRootLayoutStyle(state: MenuItemState): ViewStyle {
  return {
    alignItems: state.secondaryContentPosition === 'under' ? 'flex-start' : 'center',
  };
}

export const menuItemIcons = {
  regular: {
    fontSource: {
      codepoint: 0x25cb,
      fontFamily: 'Arial',
    },
  },
  selected: {
    fontSource: {
      codepoint: 0x25cf,
      fontFamily: 'Arial',
    },
  },
  chevron: {
    fontSource: {
      codepoint: 0x203a,
      fontFamily: 'Arial',
    },
  },
  checkmark: {
    fontSource: {
      codepoint: 0x2713,
      fontFamily: 'Arial',
    },
  },
} as const;
