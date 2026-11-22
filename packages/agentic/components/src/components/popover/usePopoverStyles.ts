import { attachSlotProps } from '@fluentui-react-native/framework-base';

import { getPopoverChrome, getPopoverSurfaceStyle, popoverStyles } from './popover.styles';
import type { PopoverState } from './popover.types';

/**
 * Applies the root's structural style, the surface's token styles, and the token gap. Caller styles apply last.
 */
export function usePopoverStyles_unstable(state: PopoverState) {
  const { surface, gap } = getPopoverChrome(state);
  attachSlotProps(state.root, { style: [popoverStyles.root, state.userStyle] });
  state.calloutPlacement = { side: state.placement, align: state.align, gap };
  state.surfaceContent = {
    style: [getPopoverSurfaceStyle(surface), state.surfaceUserStyle],
    ref: state.surfaceTargetRef,
  };
}
