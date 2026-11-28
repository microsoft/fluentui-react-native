import type { PresenceBadgeProps } from './presence-badge.types';
import { renderPresenceBadge_unstable } from './renderPresenceBadge';
import { usePresenceBadge_unstable } from './usePresenceBadge';
import { usePresenceBadgeStyles_unstable } from './usePresenceBadgeStyles';

export function PresenceBadge(props: PresenceBadgeProps) {
  const state = usePresenceBadge_unstable(props);
  usePresenceBadgeStyles_unstable(state);
  return renderPresenceBadge_unstable(state);
}
PresenceBadge.displayName = 'PresenceBadge';
