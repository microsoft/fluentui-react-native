import { StyleSheet } from 'react-native';
import { resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';

import { resolveButtonChrome } from './button.styles';
import type { ButtonState } from './button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * button slots.
 */
export function useButtonStyles_unstable(state: ButtonState) {
  const chrome = resolveButtonChrome(state);
  applyButtonChrome(state, chrome);
  if (state.contentHidden) {
    const selected = resolveTokenStates(state.buttonTokens.content, state, { selected: true }).style;
    attachSlotDefaults(state.contentHidden, {
      style: [selected, { color: chrome.content.color }],
    });
  }
}

/** Apply effective Button visuals to both Button and MenuButton triggers. */
export function applyButtonChrome(state: ButtonState, { root, content, icon }: ReturnType<typeof resolveButtonChrome>) {
  const style = [root, state.userStyle];
  if (state.FocusRing) applyFocusRingStyles(state.FocusRing, state.themeState, StyleSheet.flatten(style).borderRadius);
  attachSlotProps(state.root, { style });
  if (state.content) attachSlotDefaults(state.content, { style: content });
  for (const slot of [state.icon, state.selectedIcon]) {
    if (slot) {
      attachSlotDefaults(slot, { ...icon, color: icon.color ?? content.color });
      attachSlotProps(slot, { accessible: false });
    }
  }
}
