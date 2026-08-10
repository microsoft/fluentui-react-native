import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import {
  getButtonColorStyles,
  getButtonContentSizeStyle,
  getButtonIconSize,
  getButtonRootSizeStyle,
  getButtonShapeStyle,
  getButtonThemeStyles,
} from './button.styles';
import type { ButtonState } from './button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * button slots.
 */
export function useApplyStyles_unstable(state: ButtonState) {
  const { appearance, disabled, focused, hovered, iconOnly, pressed, selected, shape, size, userStyle } = state;
  const styles = getButtonThemeStyles(state);
  const colors = getButtonColorStyles(styles, appearance, disabled, selected, pressed, hovered);
  const rootStyle: StyleProp<ViewStyle> = [
    styles.root,
    getButtonRootSizeStyle(styles, size, iconOnly),
    getButtonShapeStyle(styles, shape, size),
    colors.background,
    colors.border,
    focused && !disabled && styles.focused,
    userStyle,
  ];
  const contentSizeStyle = getButtonContentSizeStyle(styles, size);
  const contentStyle: StyleProp<TextStyle> = [
    styles.content,
    contentSizeStyle,
    selected ? styles.contentSemibold : styles.contentRegular,
    colors.foreground,
  ];
  const iconSize = getButtonIconSize(size);

  attachSlotProps(state.root, { style: rootStyle });
  if (state.icon) {
    attachSlotProps(state.icon, {
      accessible: false,
      color: colors.foregroundColor,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.selectedIcon) {
    attachSlotProps(state.selectedIcon, {
      accessible: false,
      color: colors.foregroundColor,
      height: iconSize,
      width: iconSize,
    });
  }
  if (state.content) {
    attachSlotProps(state.content, {
      numberOfLines: 1,
      style: state.isToggleButton ? [contentStyle, styles.contentVisible] : contentStyle,
    });
  }
  if (state.contentHidden) {
    attachSlotProps(state.contentHidden, {
      accessibilityElementsHidden: true,
      accessible: false,
      importantForAccessibility: 'no-hide-descendants',
      numberOfLines: 1,
      style: [styles.content, contentSizeStyle, styles.contentSemibold, colors.foreground, styles.contentHidden],
    });
  }
  if (state.contentContainer) {
    attachSlotProps(state.contentContainer, { accessible: false, style: styles.contentContainer });
  }
}
