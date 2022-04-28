import type { IViewProps } from '@fluentui-react-native/adapters';
import { ImageProps, ViewProps, TextProps, ColorValue } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens, IBorderTokens } from '@fluentui-react-native/tokens';
import { BadgeProps, PresenceBadgeProps } from '@fluentui-react-native/badge';

export const JSAvatarName = 'Avatar';
export const AvatarSizes = [
  'size20',
  'size24',
  'size28',
  'size32',
  'size36',
  'size40',
  'size48',
  'size56',
  'size64',
  'size72',
  'size96',
  'size120',
] as const;
export type AvatarSize = typeof AvatarSizes[number];

export type AvatarShape = 'circular' | 'square';
export type AvatarActive = 'active' | 'inactive' | 'unset';
export type AvatarActiveAppearance = 'ring' | 'shadow' | 'glow' | 'ring-shadow' | 'ring-glow';

/**
 * Sets color of the avatar when there is no picture. Uses fluent color names
 */
export type AvatarColor =
  | 'cornflower'
  | 'blue'
  | 'royalBlue'
  | 'teal'
  | 'forest'
  | 'darkGreen'
  | 'berry'
  | 'hotPink'
  | 'grape'
  | 'purple'
  | 'pumpkin'
  | 'red'
  | 'burgundy'
  | 'orchid'
  | 'brass'
  | 'darkRed'
  | 'beige'
  | 'platinum'
  | 'steel'
  | 'brown';
export interface RingConfig {
  accent?: boolean;
  transparent?: boolean;
  ringColor?: ColorValue; // glow
  ringBackgroundColor?: ColorValue; // inner/outer rings
  ringThickness?: number;
  innerGap?: number;
}

export interface AvatarConfigurableProps {
  size?: AvatarSize;
  ring?: RingConfig;
  coinColorFluent?: AvatarColor;
}

export interface JSAvatarProps extends IViewProps, AvatarConfigurableProps {
  active?: AvatarActive;
  activeAppearance?: AvatarActiveAppearance;
  image?: ImageProps;
  src?: string;
  initials?: string;
  name?: string;
  shape?: AvatarShape;
  badge?: PresenceBadgeProps;
}

export interface AvatarSlotProps {
  root: ViewProps;
  image: ImageProps;
  initials: TextProps;
  initialsBackground: ViewProps;
  icon: ImageProps;
  ring: ViewProps;
  badge: BadgeProps;
}

export type IconAlignment = 'start' | 'center' | 'end';

export interface JSAvatarTokens extends IBackgroundColorTokens, IForegroundColorTokens, AvatarConfigurableProps, IBorderTokens {
  avatarSize?: number;
  iconSize?: number;
  iconStrokeWidth?: number;
  iconStrokeColor?: string;
  initialsSize?: number;
  horizontalIconAlignment?: IconAlignment;
  verticalIconAlignment?: IconAlignment;
  physicalSize?: number;
  circular?: JSAvatarTokens;
  square?: JSAvatarTokens;
  inactive?: JSAvatarTokens;
  avatarOpacity?: number;
  ringColor?: ColorValue;
}

export interface JSAvatarState {
  showRing: boolean;
  transparentRing: boolean;
}

export interface AvatarInfo {
  props: JSAvatarProps;
  state: JSAvatarState;
}

export interface JSAvatarType {
  props: JSAvatarProps;
  slotProps: AvatarSlotProps;
  tokens: JSAvatarTokens;
  state: JSAvatarState;
}
