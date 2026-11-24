import { renderTeachingPopover_unstable } from './renderTeachingPopover';
import type { TeachingPopoverProps } from './teaching-popover.types';
import { useTeachingPopover_unstable } from './useTeachingPopover';
import { useTeachingPopoverStyles_unstable } from './useTeachingPopoverStyles';

export function TeachingPopover(props: TeachingPopoverProps) {
  const state = useTeachingPopover_unstable(props);
  useTeachingPopoverStyles_unstable(state);
  return renderTeachingPopover_unstable(state);
}
TeachingPopover.displayName = 'TeachingPopover';
