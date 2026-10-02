import type { PopoverProps } from './popover.types';
import { renderPopover_unstable } from './renderPopover';
import { usePopover_unstable } from './usePopover';
import { usePopoverStyles_unstable } from './usePopoverStyles';

export const Popover = (props: PopoverProps) => {
  const state = usePopover_unstable(props);
  const styles = usePopoverStyles_unstable(state);
  return renderPopover_unstable(state, styles);
};

Popover.displayName = 'Popover';
