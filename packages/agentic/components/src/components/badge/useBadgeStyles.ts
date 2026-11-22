import { StyleSheet } from 'react-native';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { badgeStyles, getBadgeChrome } from './badge.styles';
import type { BadgeState } from './badge.types';

/**
 * Applies Badge styles and resolved slot props.
 */
export function useBadgeStyles_unstable(state: BadgeState) {
  const chrome = getBadgeChrome(state);
  const rootStyle = [badgeStyles.root, chrome.root, state.userStyle];
  if (state.appearance === 'tint' && StyleSheet.flatten(state.userStyle)?.backgroundColor === undefined) {
    state.tintStyle = { ...StyleSheet.absoluteFillObject, ...chrome.tint, borderRadius: StyleSheet.flatten(rootStyle).borderRadius };
  }

  attachSlotProps(state.root, { style: rootStyle });
  for (const slot of [state.leadingIcon, state.trailingIcon]) {
    if (slot) {
      attachSlotDefaults(slot, { ...chrome.icon, color: chrome.icon.color ?? chrome.content.color });
      attachSlotProps(slot, hiddenFromAccessibilityProps);
    }
  }
  if (state.content) {
    attachSlotDefaults(state.content, { style: [badgeStyles.content, chrome.content] });
    attachSlotProps(state.content, { accessible: false });
  }
}
