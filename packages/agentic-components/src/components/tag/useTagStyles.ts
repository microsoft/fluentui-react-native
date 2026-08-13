import type { StyleProp, TextStyle, ViewStyle } from 'react-native';
import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  tagStyles,
  getTagBackgroundStyle,
  getTagContentStyle,
  getTagFocusStyle,
  getTagForegroundStyle,
  getTagIconSize,
  getTagRootStyle,
} from './tag.styles';
import type { TagState } from './tag.types';

export function useTagStyles_unstable(state: TagState) {
  const { dismiss, size, userStyle } = state;
  const background = getTagBackgroundStyle(state);
  const foreground = getTagForegroundStyle(state);
  const rootStyle: StyleProp<ViewStyle> = [tagStyles.root, getTagRootStyle(state), background, getTagFocusStyle(state), userStyle];
  const contentStyle: StyleProp<TextStyle> = [tagStyles.content, getTagContentStyle(state), foreground];
  const iconSizes = getTagIconSize(size);

  attachSlotProps(state.root, { style: rootStyle });
  if (state.content) {
    attachSlotProps(state.content, { style: contentStyle });
  }
  if (state.leadingIcon) {
    attachSlotProps(state.leadingIcon, {
      accessible: false,
      color: foreground.color,
      height: iconSizes.leading,
      style: tagStyles.icon,
      width: iconSizes.leading,
    });
  }
  if (state.dismissIcon && dismiss) {
    attachSlotProps(state.dismissIcon, {
      accessible: false,
      color: foreground.color,
      height: iconSizes.dismiss,
      style: tagStyles.icon,
      width: iconSizes.dismiss,
    });
  }
}
