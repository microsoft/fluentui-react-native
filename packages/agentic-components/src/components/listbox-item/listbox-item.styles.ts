import { StyleSheet } from 'react-native';
import type { TextStyle, ViewStyle } from 'react-native';

import type { ListboxItemState } from './listbox-item.types';

export const listboxItemStyles = StyleSheet.create({
  root: {
    alignItems: 'center',
    borderStyle: 'solid',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  leading: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  leadingUnder: {
    alignItems: 'flex-start',
  },
  contentRow: {
    alignItems: 'center',
    flex: 1,
    flexDirection: 'row',
    minWidth: 0,
  },
  contentColumn: {
    flex: 1,
    flexDirection: 'column',
    minWidth: 0,
  },
  labelContainer: {
    flex: 1,
    minWidth: 0,
    position: 'relative',
  },
  trailing: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    marginLeft: 8,
  },
  loadingRow: {
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
    minHeight: 24,
  },
  loadingLabel: {
    borderRadius: 4,
  },
  loadingIcon: {
    borderRadius: 10,
  },
  checkboxBox: {
    alignItems: 'center',
    borderRadius: 3,
    borderWidth: 1,
    justifyContent: 'center',
  },
});

function getColor(state: ListboxItemState, key: 'primary' | 'secondary'): ViewStyle['backgroundColor'] {
  const colors = state.tokens.color;
  if (state.disabled) {
    return colors.foregroundNeutralDisabled;
  }
  if (state.pressed) {
    return key === 'primary' ? colors.pressed.foregroundNeutralPrimary : colors.pressed.foregroundNeutralSecondary;
  }
  if (state.hovered) {
    return key === 'primary' ? colors.hover.foregroundNeutralPrimary : colors.hover.foregroundNeutralSecondary;
  }
  if (key === 'secondary' && state.variant === 'listItem' && state.selected && !state.multiselect) {
    return colors.foregroundNeutralPrimary;
  }
  return key === 'primary' ? colors.foregroundNeutralPrimary : colors.foregroundNeutralSecondary;
}

function getLabelWeight(state: ListboxItemState): TextStyle['fontWeight'] {
  return state.variant === 'sectionHeader' || (state.variant === 'listItem' && state.selected && !state.multiselect)
    ? state.tokens.fontWeight.functionalSemibold
    : state.tokens.fontWeight.functionalRegular;
}

export function getListboxItemRootStyle(state: ListboxItemState): ViewStyle {
  const colors = state.tokens.color;
  const selected = state.variant === 'listItem' && state.selected && !state.multiselect;
  const backgroundColor = state.disabled
    ? selected
      ? colors.backgroundNeutralSubtleDisabled
      : colors.backgroundNeutralTransparent
    : state.pressed
      ? selected
        ? colors.pressed.backgroundNeutralSoft
        : colors.pressed.backgroundNeutralTransparent
      : state.hovered
        ? selected
          ? colors.hover.backgroundNeutralSoft
          : colors.hover.backgroundNeutralTransparent
        : selected
          ? colors.backgroundNeutralSoft
          : colors.backgroundNeutralTransparent;

  return {
    backgroundColor,
    borderRadius: state.tokens.borderRadius.base300,
    minHeight: 40,
    paddingHorizontal: state.tokens.spacing.componentBase300,
    paddingVertical: state.tokens.spacing.componentBase250,
  };
}

export function getListboxItemHeaderStyle(state: ListboxItemState): ViewStyle {
  return {
    backgroundColor: state.tokens.color.backgroundNeutralTransparent,
    borderRadius: state.tokens.borderRadius.base300,
    minHeight: 40,
    paddingHorizontal: state.tokens.spacing.componentBase300,
    paddingVertical: state.tokens.spacing.componentBase250,
  };
}

export function getListboxItemLabelTypographyStyle(state: ListboxItemState): TextStyle {
  return {
    fontFamily: state.tokens.fontFamily.functional,
    fontSize: state.variant === 'sectionHeader' ? state.tokens.fontSize.functionalBodySmall : state.tokens.fontSize.functionalBodyMedium,
    fontWeight: getLabelWeight(state),
    lineHeight:
      state.variant === 'sectionHeader' ? state.tokens.lineHeight.functionalBodySmall : state.tokens.lineHeight.functionalBodyMedium,
  };
}

export function getListboxItemSecondaryTypographyStyle(state: ListboxItemState): TextStyle {
  return {
    fontFamily: state.tokens.fontFamily.functional,
    fontSize: state.tokens.fontSize.functionalBodySmall,
    fontWeight: state.tokens.fontWeight.functionalRegular,
    lineHeight: state.tokens.lineHeight.functionalBodySmall,
  };
}

export function getListboxItemLabelColorStyle(state: ListboxItemState): TextStyle {
  return {
    color: getColor(state, 'primary'),
  };
}

export function getListboxItemSecondaryColorStyle(state: ListboxItemState): TextStyle {
  return {
    color: getColor(state, 'secondary'),
  };
}

export function getListboxItemFocusStyle(state: ListboxItemState): ViewStyle | undefined {
  if (state.variant !== 'listItem' || state.disabled || !state.focused) {
    return undefined;
  }

  return {
    outlineColor: state.tokens.color.strokeFocusOuter,
    outlineOffset: state.tokens.strokeWidth.thin,
    outlineStyle: 'solid',
    outlineWidth: state.tokens.strokeWidth.thick,
  };
}

export function getListboxItemVisibleLabelStyle(state: ListboxItemState): TextStyle {
  return state.variant === 'listItem' && !state.multiselect
    ? {
        bottom: 0,
        left: 0,
        position: 'absolute',
        right: 0,
        top: 0,
      }
    : {};
}

export function getListboxItemGhostLabelStyle(): TextStyle {
  return { opacity: 0 };
}

export function getListboxItemIconSize(): number {
  return 20;
}

export function getListboxItemCheckmarkSize(): number {
  return 16;
}

export function getListboxItemAvatarSize(): number {
  return 32;
}
