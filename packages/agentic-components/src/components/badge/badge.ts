import type { BadgeProps } from './badge.types';
import { renderBadge_unstable } from './renderBadge';
import { useApplyStyles_unstable } from './useApplyStyles';
import { useBadge_unstable } from './useBadge';

/**
 * Badge component.
 */
export const Badge = (props: BadgeProps) => {
  const state = useBadge_unstable(props);
  useApplyStyles_unstable(state);
  return renderBadge_unstable(state);
};

Badge.displayName = 'Badge';

export default Badge;
