import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { getListboxItemChrome, listboxItemStyles } from './listbox-item.styles';
import type { ListboxItemState } from './listbox-item.types';

export function useListboxItemStyles_unstable(state: ListboxItemState) {
  const chrome = getListboxItemChrome(state);
  const { gap, ...rootChrome } = chrome.root;
  applyFocusRingStyles(state.FocusRing, state, rootChrome.borderRadius);
  const rootStyle = [listboxItemStyles.root, rootChrome, state.userStyle];
  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.header, { style: rootStyle });
  attachSlotDefaults(state.content, { style: chrome.content.style });
  state.contentStyle = { gap: chrome.content.props.gap };
  state.trailingStyle = { gap };
  state.layoutGap = gap;
  state.iconSize = chrome.icon.width;

  if (state.contentHidden) {
    attachSlotDefaults(state.contentHidden, { style: chrome.contentReserve });
  }
  if (state.secondaryContent) {
    attachSlotDefaults(state.secondaryContent, {
      style: [chrome.secondary, { flexShrink: 1, textAlign: state.secondaryContentPosition === 'right' ? 'right' : undefined }],
    });
  }

  const color = chrome.content.style.color;
  for (const icon of [state.icon, state.selectedIcon, state.chevronIndicator]) {
    if (icon) {
      attachSlotDefaults(icon, { color, ...chrome.icon });
      attachSlotProps(icon, hiddenFromAccessibilityProps);
    }
  }
  if (state.avatar) {
    attachSlotDefaults(state.avatar, { style: [chrome.avatar, { overflow: 'hidden' }] });
    attachSlotProps(state.avatar, hiddenFromAccessibilityProps);
  }
  if (state.checkmarkIndicator) {
    attachSlotDefaults(state.checkmarkIndicator, { color, ...chrome.checkmark });
    attachSlotProps(state.checkmarkIndicator, hiddenFromAccessibilityProps);
  }
  if (state.checkboxIndicator) {
    attachSlotDefaults(state.checkboxIndicator, {
      ...chrome.checkbox.props,
      style: [{ alignItems: 'center', justifyContent: 'center' }, chrome.checkbox.style],
    });
    attachSlotProps(state.checkboxIndicator, {
      ...hiddenFromAccessibilityProps,
      focusable: false,
      pointerEvents: 'none',
      status: state.selected ? 'checked' : 'unchecked',
    });
  }
}
