import { SvgProps } from 'react-native-svg';
import { BadgeCoreProps, BadgeSlotProps } from '../';
import { BadgeCoreTokens, BadgeConfigurableProps } from '../Badge.types';

export const presenceBadgeName = 'PresenceBadge';
export const PresenceBadgeStatuses = ['doNotDisturb', 'busy', 'unknown', 'blocked', 'outOfOffice', 'away', 'available', 'offline'] as const;
export type PresenceBadgeStatus = (typeof PresenceBadgeStatuses)[number];

export interface PresenceBadgeTokens extends BadgeCoreTokens, BadgeConfigurableProps {
  available?: PresenceBadgeTokens;
  away?: PresenceBadgeTokens;
  awayOutOfOffice?: PresenceBadgeTokens;
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
