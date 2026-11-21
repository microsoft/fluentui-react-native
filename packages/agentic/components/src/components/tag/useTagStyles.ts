import { StyleSheet } from 'react-native';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { tagStyles, getTagChrome } from './tag.styles';
import type { TagState } from './tag.types';

export function useTagStyles_unstable(state: TagState) {
  const chrome = getTagChrome(state);
  const rootStyle = [tagStyles.root, chrome.root, state.userStyle];
  applyFocusRingStyles(state.FocusRing, state.themeState, StyleSheet.flatten(rootStyle).borderRadius);
  attachSlotProps(state.root, { style: rootStyle });
  if (state.content) {
    attachSlotDefaults(state.content, { style: [tagStyles.content, chrome.content] });
    attachSlotProps(state.content, { accessible: false });
  }
  for (const [slot, props] of [
    [state.leadingIcon, chrome.leadingIcon],
    [state.dismissIcon, chrome.dismissIcon],
  ] as const) {
    if (slot) {
      attachSlotDefaults(slot, { ...props, color: props.color ?? chrome.content.color, style: tagStyles.icon });
      attachSlotProps(slot, hiddenFromAccessibilityProps);
    }
  }
}
