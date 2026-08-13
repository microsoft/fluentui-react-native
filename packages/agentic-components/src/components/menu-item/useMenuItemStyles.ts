import type { StyleProp, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  getMenuItemCheckboxStyle,
  getMenuItemFocusStyle,
  getMenuItemLeadingStyle,
  getMenuItemLabelStyle,
  getMenuItemRootLayoutStyle,
  getMenuItemRootStyle,
  getMenuItemTrailingStyle,
  menuItemStyles,
} from './menu-item.styles';
import type { MenuItemState } from './menu-item.types';

export function useMenuItemStyles_unstable(state: MenuItemState) {
  const labelColor = getMenuItemLabelStyle(state).color;
  const rootStyle: StyleProp<ViewStyle> = [
    menuItemStyles.root,
    getMenuItemRootLayoutStyle(state),
    getMenuItemRootStyle(state),
    getMenuItemFocusStyle(state),
    state.userStyle,
  ];

  attachSlotProps(state.root, { style: rootStyle });

  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: labelColor,
      height: 20,
      width: 20,
    });
  }

  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: labelColor,
      height: 20,
      width: 20,
    });
  }

  if (state.avatar) {
    attachSlotProps(state.avatar, {
      accessible: false,
      style: [getMenuItemLeadingStyle(state), { height: 16, width: 16 }],
    });
  }

  if (state.chevron) {
    attachSlotProps(state.chevron, {
      accessible: false,
      color: labelColor,
      height: 20,
      width: 20,
    });
  }

  if (state.checkmark) {
    attachSlotProps(state.checkmark, {
      accessible: false,
      color: state.hasMultiselect ? state.tokens.color.foregroundBrandOnloud : labelColor,
      height: state.hasMultiselect ? 12 : 16,
      style: state.selected ? undefined : { opacity: 0 },
      width: state.hasMultiselect ? 12 : 16,
    });
  }

  if (state.multiselectCheckbox) {
    attachSlotProps(state.multiselectCheckbox, {
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
      style: [menuItemStyles.multiselectCheckbox, getMenuItemCheckboxStyle(state), getMenuItemTrailingStyle(state)],
    });
  }
}
