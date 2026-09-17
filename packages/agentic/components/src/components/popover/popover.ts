import type { PopoverProps } from './popover.types';
import { renderPopover_unstable } from './renderPopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';
import { usePopover_unstable } from './usePopover';

/**
 * Popover is a trigger plus an anchored floating surface that mounts only while the popover is open.
 */
export const Popover = (props: PopoverProps) => {
  const state = usePopover_unstable(props);
  const styles = usePopoverStyles_unstable(state);
  return renderPopover_unstable(state, styles);
};

Popover.displayName = 'Popover';

export default Popover;
