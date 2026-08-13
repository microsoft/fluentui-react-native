import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  buttonStyles,
  getButtonColorStyles,
  getButtonContentStyle,
  getButtonContentVisibilityStyle,
  getButtonFocusStyle,
  getButtonIconSize,
  getButtonRootStyle,
} from './button.styles';
import type { ButtonState } from './button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * button slots.
 */
export function useApplyStyles_unstable(state: ButtonState) {
  const { size, userStyle } = state;
  const colors = getButtonColorStyles(state);
  const rootStyle: StyleProp<ViewStyle> = [
    buttonStyles.root,
    getButtonRootStyle(state),
    colors.background,
    getButtonFocusStyle(state),
    userStyle,
  ];
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
      numberOfLines: 1,
      style: state.isToggleButton ? [contentStyle, getButtonContentVisibilityStyle('visible')] : contentStyle,
    });
  }
  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
      numberOfLines: 1,
      style: [buttonStyles.content, getButtonContentStyle(state, true), colors.foreground, getButtonContentVisibilityStyle('hidden')],
    });
  }
  if (state.contentContainer) {
    attachSlotProps(state.contentContainer, { accessible: false, style: buttonStyles.contentContainer });
  }
}
