import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { resolveRadioChrome } from './radio.styles';
import type { RadioState } from './radio.types';

export function useRadioStyles_unstable(state: RadioState) {
  const chrome = resolveRadioChrome(state);
  const rootStyle = [chrome.root, state.userStyle];
  applyFocusRingStyles(state.FocusRing, state, chrome.root.borderRadius);
  state.rootStyle = rootStyle;
  state.indicatorStyle = chrome.indicator;
  state.indicatorDotStyle = [chrome.dot, { opacity: state.selected ? 1 : 0 }];
  state.labelContainerStyle = chrome.labelContainer;
  state.labelStyle = chrome.label;
  state.secondaryTextStyle = chrome.secondaryText;
  attachSlotProps(state.root, { style: rootStyle });
}
