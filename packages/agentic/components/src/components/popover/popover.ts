import type { PopoverProps } from './popover.types';
import { usePopover_unstable } from './usePopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';
import { renderPopover_unstable } from './renderPopover';

/**
 * A nonmodal native popup anchored to a trigger Button, presenting structured, optionally interactive content.
 */
export const Popover = (props: PopoverProps) => {
  const state = usePopover_unstable(props);
  usePopoverStyles_unstable(state);
  return renderPopover_unstable(state);
};
Popover.displayName = 'Popover';

export default Popover;
