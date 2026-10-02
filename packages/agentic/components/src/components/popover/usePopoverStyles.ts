import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { applyFocusRingStyles } from '../../common/applyFocusRingStyles';
import { getPopoverThemeStyles, popoverStyles } from './popover.styles';
import type { PopoverState, PopoverCompositionState } from './popover.types';

export function usePopoverStyles_unstable(state: PopoverState | PopoverCompositionState) {
  const themeStyles = getPopoverThemeStyles(state);
  attachSlotProps(state.root, { style: [popoverStyles.root, state.userStyle] });
  const userTriggerStyle = state.triggerUserStyle;
  if (state.trigger)
    attachSlotProps(state.trigger, {
      style: [
        popoverStyles.trigger,
        typeof userTriggerStyle === 'function' ? userTriggerStyle({ pressed: state.pressed }) : userTriggerStyle,
      ],
    });
  attachSlotProps(state.surfaceContent, { style: [popoverStyles.surfaceContent, themeStyles.surfaceContent] });
  if (state.surface) {
    attachSlotProps(state.surface, { style: themeStyles.surface });
  }
  applyFocusRingStyles(state.FocusRing, state, state.tokens.borderRadius.base400);
  return { contentPlaceholderStyle: themeStyles.contentPlaceholder };
}
