import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { resolveTabChrome } from './tab.styles';
import type { TabState } from './tab.types';

/**
 * Applies stable theme styles and instance-specific style selections to the Tab slots.
 */
export function useTabStyles_unstable(state: TabState) {
  const chrome = resolveTabChrome(state);

  applyFocusRingStyles(state.FocusRing, state, chrome.root.borderRadius);
  attachSlotProps(state.root, { style: [chrome.root, state.userStyle] });
  if (state.icon) {
    attachSlotDefaults(state.icon, chrome.icon);
    attachSlotProps(state.icon, { accessible: false });
  }
  if (state.selectedIcon) {
    attachSlotDefaults(state.selectedIcon, chrome.icon);
    attachSlotProps(state.selectedIcon, { accessible: false });
  }
  if (state.content) {
    attachSlotDefaults(state.content, { style: chrome.content });
  }
  if (state.contentHidden) {
    attachSlotDefaults(state.contentHidden, { style: chrome.contentHidden });
  }
}
