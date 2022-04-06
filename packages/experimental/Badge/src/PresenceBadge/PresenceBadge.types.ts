import { BadgeProps } from '../';
import { StyleSheetProperties } from 'react-native';

export const presenceBadgeName = 'PresenceBadge';
export type Presence = 'doNotDisturb' | 'busy' | 'unknown' | 'blocked' | 'outOfOffice' | 'away' | 'available' | 'offline';

export interface PresenceBadgeProps extends BadgeProps {
  presence?: Presence;
  isOutOfOffice?: boolean;
  styles?: StyleSheetProperties;
}

export interface PresenceBadgeSlotProps {
  badge: BadgeProps;
}

export interface PresenceBadgeType {
  props: PresenceBadgeProps;
  slotProps: PresenceBadgeSlotProps;
}
