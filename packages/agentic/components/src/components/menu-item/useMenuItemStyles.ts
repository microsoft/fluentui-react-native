import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { getMenuItemChrome, getMenuItemLeadingStyle, getMenuItemTrailingStyle, menuItemStyles } from './menu-item.styles';
import type { MenuItemState } from './menu-item.types';

export function useMenuItemStyles_unstable(state: MenuItemState) {
  const chrome = getMenuItemChrome(state);
  const { gap, ...rootStyle } = chrome.root;
  applyFocusRingStyles(state.FocusRing, state, rootStyle.borderRadius);
  attachSlotProps(state.root, {
    style: [
      menuItemStyles.root,
      { alignItems: state.secondaryContentPosition === 'under' ? 'flex-start' : 'center' },
      rootStyle,
      state.userStyle,
    ],
  });
  state.contentStyle = chrome.content.style;
  state.contentReserveStyle = chrome.contentReserve;
  state.secondaryStyle = chrome.secondary;
  state.secondaryReserveStyle = chrome.secondaryReserve;
  state.contentGap = chrome.content.props.gap;
  state.layoutGap = gap;

  const color = chrome.content.style.color;
  for (const icon of [state.icon, state.selectedIcon]) {
    if (icon) {
      attachSlotDefaults(icon, { color, ...chrome.leadingIcon });
      attachSlotProps(icon, hiddenFromAccessibilityProps);
    }
  }
  for (const icon of [state.chevron, state.trailingIcon]) {
    if (icon) {
      attachSlotDefaults(icon, { color, ...chrome.trailingIcon });
      attachSlotProps(icon, hiddenFromAccessibilityProps);
    }
  }
  if (state.avatar) {
    attachSlotDefaults(state.avatar, { style: [getMenuItemLeadingStyle(state), chrome.avatar] });
    attachSlotProps(state.avatar, hiddenFromAccessibilityProps);
  }
  if (state.checkmark) {
    attachSlotDefaults(state.checkmark, { color, ...chrome.checkmark });
    attachSlotProps(state.checkmark, { ...hiddenFromAccessibilityProps, style: state.selected ? undefined : { opacity: 0 } });
  }
  if (state.multiselectCheckbox) {
    attachSlotDefaults(state.multiselectCheckbox, {
      ...chrome.checkbox.props,
      style: [{ alignItems: 'center', justifyContent: 'center' }, chrome.checkbox.style, getMenuItemTrailingStyle(state)],
    });
    attachSlotProps(state.multiselectCheckbox, {
      ...hiddenFromAccessibilityProps,
      focusable: false,
      pointerEvents: 'none',
      status: state.selected ? 'checked' : 'unchecked',
    });
  }
}
