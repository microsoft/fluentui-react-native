import { BadgeProps } from '../';

export const presenceBadgeName = 'PresenceBadge';
export type Presence = 'DND' | 'busy' | 'unknown' | 'blocked' | 'OOF' | 'away' | 'available' | 'offline';

export interface PresenceBadgeProps extends BadgeProps {
  presence?: Presence;
  oof?: boolean;
}

export interface PresenceBadgeSlotProps {
  badge: BadgeProps;
}

export interface PresenceBadgeType {
  props: PresenceBadgeProps;
  slotProps: PresenceBadgeSlotProps;
}
