import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { buttonStyles, getButtonColorStyles, getButtonContentStyle, getButtonIconSize, getButtonRootStyle } from './button.styles';
import type { ButtonState } from './button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * button slots.
 */
export function useButtonStyles_unstable(state: ButtonState) {
  const { size, userStyle } = state;
  const colors = getButtonColorStyles(state);
  const rootStyle: StyleProp<ViewStyle> = [buttonStyles.root, getButtonRootStyle(state), colors.background, userStyle];
  const contentStyle: StyleProp<TextStyle> = [buttonStyles.content, getButtonContentStyle(state), colors.foreground];
  const iconSize = getButtonIconSize(size);

  attachSlotProps(state.root, { style: rootStyle });
  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: colors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: colors.foreground.color,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.content) {
    attachSlotProps(state.content, {
      style: contentStyle,
    });
  }
  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      style: [buttonStyles.content, getButtonContentStyle(state, true), colors.foreground],
    });
  }
}
