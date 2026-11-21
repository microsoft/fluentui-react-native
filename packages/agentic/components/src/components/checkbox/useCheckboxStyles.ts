import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { resolveCheckboxChrome } from './checkbox.styles';
import type { CheckboxState } from './checkbox.types';

export function useCheckboxStyles_unstable(state: CheckboxState) {
  const chrome = resolveCheckboxChrome(state);
  applyFocusRingStyles(state.FocusRing, state, state.tokens.borderRadius.base300);
  attachSlotProps(state.root, { style: [chrome.root, state.userStyle] });
  state.indicatorStyle = chrome.indicator;
  state.labelContainerStyle = chrome.labelContainer;
  state.indicatorIconColor = chrome.indicatorIcon.color;
  state.indicatorIconSize = chrome.indicatorIcon.size ?? state.indicatorIconSize;
  if (state.labelText) {
    attachSlotProps(state.labelText, { style: chrome.label });
  }
  if (state.secondaryTextSlot) {
    attachSlotProps(state.secondaryTextSlot, { style: chrome.secondaryText });
  }
}
