import { BadgeProps, BadgeSlotProps } from '../';
import { BadgeTokens } from '../Badge.types';

export const presenceBadgeName = 'PresenceBadge';
export type Presence = 'doNotDisturb' | 'busy' | 'unknown' | 'blocked' | 'outOfOffice' | 'away' | 'available' | 'offline';

export interface PresenceBadgeTokens extends BadgeTokens {}
export interface PresenceBadgeProps extends BadgeProps {
  presence?: Presence;
  isOutOfOffice?: boolean;
}

export interface PresenceBadgeSlotProps extends Omit<BadgeSlotProps, 'text' | 'icon'> {}

export interface PresenceBadgeType {
  props: PresenceBadgeProps;
  slotProps: PresenceBadgeSlotProps;
}
