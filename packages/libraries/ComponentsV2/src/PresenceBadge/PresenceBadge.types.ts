import type { ViewProps } from 'react-native';

import type { BadgeSize } from '../Badge/Badge.types';

export const presenceBadgeStatuses = [
  'available',
  'away',
  'busy',
  'do-not-disturb',
  'offline',
  'out-of-office',
  'unknown',
  'blocked',
] as const;

export type PresenceBadgeStatus = (typeof presenceBadgeStatuses)[number];
export type PresenceBadgeSize = BadgeSize;

export interface PresenceBadgeProps extends Omit<ViewProps, 'children'> {
  /**
   * Adds an out-of-office visual modifier to the selected status.
   * @default false
   */
  outOfOffice?: boolean;

  /**
   * Presence badge size.
   * @default 'medium'
   */
  size?: PresenceBadgeSize;

  /**
   * Presence state.
   * @default 'available'
   */
  status?: PresenceBadgeStatus;
}
