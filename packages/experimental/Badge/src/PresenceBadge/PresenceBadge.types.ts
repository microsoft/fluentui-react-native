import { BadgeCoreProps, BadgeSlotProps } from '../';
import { BadgeCoreTokens } from '../Badge.types';

export const presenceBadgeName = 'PresenceBadge';
export const PresenceBadgeStatuses = ['doNotDisturb', 'busy', 'unknown', 'blocked', 'outOfOffice', 'away', 'available', 'offline'] as const;
export type PresenceBadgeStatus = typeof PresenceBadgeStatuses[number];

export interface PresenceBadgeTokens extends BadgeCoreTokens {}
export interface PresenceBadgeProps extends BadgeCoreProps {
  status?: PresenceBadgeStatus;
  isOutOfOffice?: boolean;
}

export interface PresenceBadgeSlotProps extends Omit<BadgeSlotProps, 'text' | 'icon'> {}

export interface PresenceBadgeType {
  props: PresenceBadgeProps;
  slotProps: PresenceBadgeSlotProps;
  tokens: PresenceBadgeTokens;
}
