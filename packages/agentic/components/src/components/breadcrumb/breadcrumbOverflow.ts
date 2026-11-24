import type { PopoverProps } from '../popover/popover.types';
import { renderPopover_unstable } from '../popover/renderPopover';
import { usePopover } from '../popover/usePopover';
import { usePopoverStyles_unstable } from '../popover/usePopoverStyles';

export function BreadcrumbOverflow({ restoreOnClose, ...props }: PopoverProps & { restoreOnClose: boolean }) {
  const state = usePopover(props, restoreOnClose);
  usePopoverStyles_unstable(state);
  return renderPopover_unstable(state);
}
