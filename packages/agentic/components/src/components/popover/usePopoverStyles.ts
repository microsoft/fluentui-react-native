import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { getPopoverGap, getPopoverThemeStyles, popoverStyles } from './popover.styles';
import type { PopoverState } from './popover.types';

/**
 * Applies the root's structural style, the surface's token styles, and the token gap. Caller styles apply last.
 */
export function usePopoverStyles_unstable(state: PopoverState) {
  const themeStyles = getPopoverThemeStyles(state);
  attachSlotProps(state.root, { style: [popoverStyles.root, state.userStyle] });
  state.calloutPlacement = { side: state.placement, align: state.align, gap: getPopoverGap(state.tokens) };
  state.surfaceContent = { style: [themeStyles.surface, state.surfaceUserStyle], ref: state.surfaceTargetRef };
}
