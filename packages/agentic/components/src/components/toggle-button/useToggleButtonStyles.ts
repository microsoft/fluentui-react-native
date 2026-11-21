import { resolveTokenStates } from '@fluentui-react-native/design/styling';
import { attachSlotDefaults } from '@fluentui-react-native/framework-base';
import { resolveButtonChrome } from '../button/button.styles';
import { applyButtonChrome } from '../button/useButtonStyles';
import type { ToggleButtonState } from './toggle-button.types';

export function useToggleButtonStyles_unstable(state: ToggleButtonState) {
  const { toggleButtonTokens } = state;
  const chrome = resolveButtonChrome(state);
  const selectedRoot = resolveTokenStates(toggleButtonTokens.root, state).style;
  const selectedContent = resolveTokenStates(toggleButtonTokens.content, state).style;
  const content = { ...chrome.content, ...selectedContent };
  const root = { ...chrome.root, ...selectedRoot };
  applyButtonChrome(state, { root, content, icon: chrome.icon });
  if (state.contentHidden) {
    const strong = resolveTokenStates(toggleButtonTokens.content, state, { selected: true }).style;
    attachSlotDefaults(state.contentHidden, { style: { ...content, fontWeight: strong.fontWeight } });
  }
}
