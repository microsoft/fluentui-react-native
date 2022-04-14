import { BadgeCoreProps, BadgeSlotProps } from '../';
import { BadgeCoreTokens } from '../Badge.types';

export const presenceBadgeName = 'PresenceBadge';
export type Presence = 'doNotDisturb' | 'busy' | 'unknown' | 'blocked' | 'outOfOffice' | 'away' | 'available' | 'offline';

export interface PresenceBadgeTokens extends BadgeCoreTokens {}
export interface PresenceBadgeProps extends BadgeCoreProps {
  presence?: Presence;
  isOutOfOffice?: boolean;
}

export interface PresenceBadgeSlotProps extends Omit<BadgeSlotProps, 'text' | 'icon'> {}

export interface PresenceBadgeType {
  props: PresenceBadgeProps;
  slotProps: PresenceBadgeSlotProps;
  tokens: PresenceBadgeTokens;
}
