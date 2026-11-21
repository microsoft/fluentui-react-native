import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { resolveListItemChrome } from './list-item.styles';
import type { ListItemState } from './list-item.types';

export function useListItemStyles_unstable(state: ListItemState) {
  const chrome = resolveListItemChrome(state);
  applyFocusRingStyles(state.FocusRing, state, chrome.root.borderRadius);
  attachSlotProps(state.root, { style: [chrome.root, state.userStyle] });
  attachSlotDefaults(state.content, { style: chrome.content });
  attachSlotDefaults(state.contentHidden, { style: chrome.contentHidden });
  if (state.secondaryContent) attachSlotDefaults(state.secondaryContent, { style: chrome.secondary });
  for (const slot of [state.icon, state.selectedIcon]) {
    if (slot) {
      attachSlotDefaults(slot, chrome.icon);
      attachSlotProps(slot, { accessible: false });
    }
  }
  if (state.avatar) {
    attachSlotDefaults(state.avatar, { style: chrome.avatar });
    attachSlotProps(state.avatar, { accessible: false });
  }
  if (state.trailing) {
    attachSlotDefaults(state.trailing, { style: chrome.trailing });
    attachSlotProps(state.trailing, { accessible: false });
  }
  state.chrome = chrome;
}
