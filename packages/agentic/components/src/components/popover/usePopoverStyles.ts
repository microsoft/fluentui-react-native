import type { StyleProp, TextStyle, ViewStyle } from 'react-native';

import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { createFocusVisualProps_unstable } from '../../primitives/focus-visual/focus-visual';
import { getPopoverThemeStyles, popoverStyles } from './popover.styles';
import type { PopoverState } from './popover.types';

export type PopoverRenderStyles = {
  contentPlaceholderStyle: StyleProp<TextStyle>;
};

/**
 * Applies cached token styles and slot-level props to the Popover state.
 */
export function usePopoverStyles_unstable(state: PopoverState): PopoverRenderStyles {
  const themeStyles = getPopoverThemeStyles(state);
  const rootStyle: StyleProp<ViewStyle> = [popoverStyles.root, state.userStyle];
  const triggerStyle: StyleProp<ViewStyle> = [popoverStyles.trigger, state.triggerUserStyle];
  const surfaceContentStyle: StyleProp<ViewStyle> = [popoverStyles.surfaceContent, themeStyles.surfaceContent];

  state.focusVisualProps = createFocusVisualProps_unstable({
    borderRadius: state.tokens.borderRadius.base400,
    innerColor: state.tokens.color.strokeFocusInner,
    innerWidth: state.tokens.strokeWidth.thin,
    outerColor: state.tokens.color.strokeFocusOuter,
    outerWidth: state.tokens.strokeWidth.thick,
    visible: state.focused,
  });

  attachSlotProps(state.root, { style: rootStyle });
  attachSlotProps(state.trigger, { style: triggerStyle });
  attachSlotProps(state.surface, { style: themeStyles.surface });
  attachSlotProps(state.surfaceContent, { style: surfaceContentStyle });

  return {
    contentPlaceholderStyle: themeStyles.contentPlaceholder,
  };
}
