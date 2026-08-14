import type { BadgeProps } from './badge.types';
import { renderBadge_unstable } from './renderBadge';
import { useBadgeStyles_unstable } from './useBadgeStyles';
import { useBadge_unstable } from './useBadge';

/**
 * Badge component.
 */
export const Badge = (props: BadgeProps) => {
  const state = useBadge_unstable(props);
  useBadgeStyles_unstable(state);
  return renderBadge_unstable(state);
};

Badge.displayName = 'Badge';

export default Badge;
