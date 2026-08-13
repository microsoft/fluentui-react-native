import type { ImageStyle, StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { avatarStyles, getAvatarIconSize, getAvatarInitialsStyle, getAvatarRootStyle } from './avatar.styles';
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

  attachSlotProps(state.root, { style: rootStyle });
  if (state.image) {
    attachSlotProps(state.image, {
      accessible: false,
      accessibilityElementsHidden: true,
      resizeMode: 'cover',
      importantForAccessibility: 'no-hide-descendants',
      style: imageStyle,
    });
  }
  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      accessibilityElementsHidden: true,
      color: foregroundColor,
      height: iconSize,
      importantForAccessibility: 'no-hide-descendants',
      width: iconSize,
    });
  }
  if (state.initials) {
    attachSlotProps(state.initials, {
      accessible: false,
      accessibilityElementsHidden: true,
      importantForAccessibility: 'no-hide-descendants',
      style: initialsStyle,
    });
  }
}
