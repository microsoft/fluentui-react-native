import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { hiddenFromAccessibilityProps } from '../../common/accessibility';
import {
  avatarGroupStyles,
  getAvatarGroupItemOffsetStyle,
  getAvatarGroupItemStyle,
  getAvatarGroupOverflowStyle,
  getAvatarGroupOverflowTextStyle,
  getAvatarGroupRootStyle,
} from './avatar-group.styles';
import type { AvatarGroupState } from './avatar-group.types';

export function useAvatarGroupStyles_unstable(state: AvatarGroupState) {
  const rootStyle: StyleProp<ViewStyle> = [avatarGroupStyles.root, getAvatarGroupRootStyle(state), state.userStyle];

  state.itemStyle = [avatarGroupStyles.item, getAvatarGroupItemStyle(state)];
  state.itemOffsetStyle = [avatarGroupStyles.item, getAvatarGroupItemOffsetStyle(state)];

  attachSlotProps(state.root, { style: rootStyle });

  if (state.overflow) {
    const overflowStyle: StyleProp<ViewStyle> = [avatarGroupStyles.overflow, getAvatarGroupOverflowStyle(state)];
    attachSlotProps(state.overflow, { style: overflowStyle });
  }
  if (state.overflowText) {
    const overflowTextStyle: StyleProp<TextStyle> = [avatarGroupStyles.overflowText, getAvatarGroupOverflowTextStyle(state)];
    attachSlotProps(state.overflowText, { ...hiddenFromAccessibilityProps, style: overflowTextStyle });
  }
}
