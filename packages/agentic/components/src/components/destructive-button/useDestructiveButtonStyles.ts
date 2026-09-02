import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';
import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';

import {
  destructiveButtonStyles,
  getDestructiveButtonColorStyles,
  getDestructiveButtonContentStyle,
  getDestructiveButtonIconSize,
  getDestructiveButtonRootStyle,
} from './destructive-button.styles';
import type { DestructiveButtonState } from './destructive-button.types';

/**
 * Applies stable theme styles and instance-specific style selections to the
 * destructive button slots.
 */
export function useDestructiveButtonStyles_unstable(state: DestructiveButtonState) {
  const { size, userStyle } = state;
  const colors = getDestructiveButtonColorStyles(state);
  const rootLayoutStyle = getDestructiveButtonRootStyle(state);
  const rootStyle: StyleProp<ViewStyle> = [destructiveButtonStyles.root, rootLayoutStyle, colors.background, userStyle];
  const contentStyle: StyleProp<TextStyle> = [destructiveButtonStyles.content, getDestructiveButtonContentStyle(state), colors.foreground];
  const iconSize = getDestructiveButtonIconSize(size);

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
  if (state.content) {
    attachSlotProps(state.content, {
      style: contentStyle,
    });
  }
}
