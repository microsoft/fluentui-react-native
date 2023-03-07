import type { SvgProps } from 'react-native-svg';

import type { BadgeCoreProps, BadgeSlotProps } from '../';
import type { BadgeCoreTokens, BadgeConfigurableProps } from '../Badge.types';

export const presenceBadgeName = 'PresenceBadge';
export const PresenceBadgeStatuses = ['doNotDisturb', 'busy', 'unknown', 'blocked', 'away', 'available', 'offline', 'outOfOffice'] as const;
export type PresenceBadgeStatus = (typeof PresenceBadgeStatuses)[number];

export const PresenceBadgeIcons = [...PresenceBadgeStatuses, 'availableOutOfOffice', 'doNotDisturbOutOfOffice'] as const;
export type PresenceBadgeIconTypes = (typeof PresenceBadgeIcons)[number];
export type PresenceBadgeIconPath = { [key in PresenceBadgeIconTypes]: string };

export interface PresenceBadgeTokens extends BadgeCoreTokens, BadgeConfigurableProps {
  available?: PresenceBadgeTokens;
  away?: PresenceBadgeTokens;
  offline?: PresenceBadgeTokens;
  outOfOffice?: PresenceBadgeTokens;
  doNotDisturb?: PresenceBadgeTokens;
  busy?: PresenceBadgeTokens;
  unknown?: PresenceBadgeTokens;
  blocked?: PresenceBadgeTokens;
  status?: PresenceBadgeStatus;
}
export interface PresenceBadgeProps extends BadgeCoreProps, BadgeConfigurableProps {
  status?: PresenceBadgeStatus;
  outOfOffice?: boolean;
}

export interface PresenceBadgeSlotProps extends Omit<BadgeSlotProps, 'text' | 'icon'> {
  svg: SvgProps;
}

export interface PresenceBadgeType {
  props: PresenceBadgeProps;
  slotProps: PresenceBadgeSlotProps;
  tokens: PresenceBadgeTokens;
}
