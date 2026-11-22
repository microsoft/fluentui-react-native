import { attachSlotDefaults, attachSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { avatarStyles, getAvatarChrome } from './avatar.styles';
import type { AvatarState } from './avatar.types';

export function useAvatarStyles_unstable(state: AvatarState) {
  const chrome = getAvatarChrome(state);
  const { style: ringStyle, props: ring } = chrome.activityRing;
  const inset = -((ring.gap ?? 0) + (ringStyle.borderWidth ?? 0));

  state.activityRingProps = {
    style: { ...ringStyle, borderStyle: 'solid', bottom: inset, left: inset, right: inset, top: inset },
    testID: 'avatar-activity-ring',
    visible: state.activityRing,
  };
  attachSlotProps(state.root, { style: [avatarStyles.root, chrome.root, state.userStyle] });
  if (state.image) {
    attachSlotDefaults(state.image, { resizeMode: 'cover', style: [avatarStyles.image, chrome.image] });
    attachSlotProps(state.image, hiddenFromAccessibilityProps);
  }
  if (state.icon) {
    attachSlotDefaults(state.icon, chrome.icon);
    attachSlotProps(state.icon, hiddenFromAccessibilityProps);
  }
  if (state.initials) {
    attachSlotDefaults(state.initials, { style: [avatarStyles.initials, chrome.initials] });
    attachSlotProps(state.initials, hiddenFromAccessibilityProps);
  }
}
