import { I18nManager } from 'react-native';
import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';
import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { resolveSwitchChrome } from './switch.styles';
import type { SwitchState } from './switch.types';

export function useSwitchStyles_unstable(state: SwitchState) {
  const chrome = resolveSwitchChrome(state);
  const distance = Math.max(
    0,
    (chrome.track.width ?? 0) - 2 * ((chrome.track.borderWidth ?? 0) + (chrome.thumb.start ?? 0)) - (chrome.thumb.width ?? 0),
  );
  const translateX = state.checkedProgress.interpolate({ inputRange: [0, 1], outputRange: [0, I18nManager.isRTL ? -distance : distance] });
  applyFocusRingStyles(state.FocusRing, state, chrome.root.borderRadius);
  attachSlotProps(state.layoutContainer, { style: chrome.container });
  attachSlotProps(state.root, { style: [chrome.root, state.userStyle] });
  attachSlotDefaults(state.track, { style: chrome.track });
  attachSlotProps(state.track, { accessible: false });
  attachSlotDefaults(state.thumb, { style: [chrome.thumb, { transform: [{ translateX }] }] });
  attachSlotProps(state.thumb, { accessible: false });
  for (const slot of ['beforeLabel', 'afterLabel', 'aboveLabel'] as const) {
    const label = state[slot];
    if (label) {
      attachSlotDefaults(label, { style: [chrome.label, chrome[slot]] });
      attachSlotProps(label, { accessible: false });
    }
  }
}
