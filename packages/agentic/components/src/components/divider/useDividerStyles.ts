import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { dividerStyles, getDividerChrome } from './divider.styles';
import type { DividerState } from './divider.types';

/**
 * Applies token-derived and instance-derived styles to Divider slots.
 */
export function useDividerStyles_unstable(state: DividerState) {
  const chrome = getDividerChrome(state);
  attachSlotProps(state.root, { style: [dividerStyles.root, chrome.root, state.userStyle] });

  if (state.contentContainer) {
    attachSlotProps(state.contentContainer, {
      accessible: false,
      style: [dividerStyles.content, chrome.content],
    });
  }

  if (state.icon) {
    attachSlotDefaults(state.icon, chrome.icon);
    attachSlotProps(state.icon, hiddenFromAccessibilityProps);
  }

  if (state.label) {
    attachSlotDefaults(state.label, { style: [dividerStyles.label, chrome.label] });
    attachSlotProps(state.label, { accessible: false });
  }
  return { before: chrome.before, after: chrome.after };
}
