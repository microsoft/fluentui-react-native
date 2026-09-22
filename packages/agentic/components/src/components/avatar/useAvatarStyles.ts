import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import { avatarStyles, getAvatarActivityRingStyle, getAvatarIconSize, getAvatarInitialsStyle, getAvatarRootStyle } from './avatar.styles';
import type { AvatarState } from './avatar.types';

export function useAvatarStyles_unstable(state: AvatarState) {
  const foregroundColor = state.tokens.color.foregroundNeutralPrimary;
  const imageStyle: StyleProp<ImageStyle> = [
    avatarStyles.image,
    {
      borderRadius: state.tokens.borderRadius.circular,
    },
  ];
  const rootStyle: StyleProp<ViewStyle> = [avatarStyles.root, getAvatarRootStyle(state), state.userStyle];
  const initialsStyle: StyleProp<TextStyle> = [avatarStyles.initials, getAvatarInitialsStyle(state), { color: foregroundColor }];
  const iconSize = getAvatarIconSize(state.size);

  state.activityRingProps = {
    style: getAvatarActivityRingStyle(state),
    testID: 'avatar-activity-ring',
    visible: state.activityRing,
  };
  attachSlotProps(state.root, { style: rootStyle });
  if (state.image) {
    attachSlotProps(state.image, {
      ...hiddenFromAccessibilityProps,
      resizeMode: 'cover',
      style: imageStyle,
    });
  }
  if (state.icon) {
    attachSlotProps(state.icon, {
      ...hiddenFromAccessibilityProps,
      color: foregroundColor,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.initials) {
    attachSlotProps(state.initials, {
      ...hiddenFromAccessibilityProps,
      style: initialsStyle,
    });
  }
}
