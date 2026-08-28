import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';

import { buttonStyles, getButtonColorStyles, getButtonContentStyle, getButtonIconSize, getButtonRootStyle } from './button.styles';
import type { ButtonState } from './button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * button slots.
 */
export function useButtonStyles_unstable(state: ButtonState) {
  const { size, userStyle } = state;
  const colors = getButtonColorStyles(state);
  const rootLayoutStyle = getButtonRootStyle(state);
  const rootStyle: StyleProp<ViewStyle> = [buttonStyles.root, rootLayoutStyle, colors.background, userStyle];
  const contentStyle: StyleProp<TextStyle> = [buttonStyles.content, getButtonContentStyle(state), colors.foreground];
  const iconSize = getButtonIconSize(size);

  state.focusVisualProps = createFocusVisualProps_unstable({
    borderRadius: rootLayoutStyle.borderRadius,
    innerColor: state.tokens.color.strokeFocusInner,
    innerWidth: state.tokens.strokeWidth.thin,
    outerColor: state.tokens.color.strokeFocusOuter,
    outerWidth: state.tokens.strokeWidth.thick,
    visible: state.focused && !state.disabled,
  });
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
