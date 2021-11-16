import type { IViewProps } from '@fluentui-react-native/adapters';
import { ImageProps, ViewProps, ImageURISource, TextProps, ColorValue } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens } from '@fluentui-react-native/tokens';

export const avatarName = 'Avatar';

export type AvatarSize = 'size8' | 'size24' | 'size32' | 'size40' | 'size48' | 'size56' | 'size72' | 'size100' | 'size120';

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

export type AvatarPresence = 'none' | 'offline' | 'online' | 'away' | 'dnd' | 'blocked' | 'busy';

export type RingThickness = number | 'xSmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export interface RingConfig {
  accent?: boolean;
  transparent?: boolean;
  ringColor?: ColorValue; // glow
  ringBackgroundColor?: ColorValue; // inner/outer rings
  ringThickness?: RingThickness;
  innerGap?: RingThickness;
}

export interface AvatarConfigurableProps {
  size?: AvatarSize;
  ring?: RingConfig;
  coinColorFluent?: AvatarColor;
}

export interface AvatarProps extends IViewProps, AvatarConfigurableProps {
  imageUrl?: string;
  imageDescription?: string;
  initials?: string;
  presence?: AvatarPresence;
  isOutOfOffice?: boolean;
}

export interface AvatarSlotProps {
  root: ViewProps;
  photo: ImageProps;
  initials: TextProps;
  initialsBackground: ViewProps;
  icon: ImageProps;
  ring: ViewProps;
  glow: ViewProps;
}

export type IconAlignment = 'start' | 'center' | 'end';

export interface AvatarTokens extends IBackgroundColorTokens, IForegroundColorTokens, AvatarConfigurableProps {
  avatarSize?: number;
  iconSize?: number;
  iconStrokeWidth?: number;
  iconStrokeColor?: string;
  initialsSize?: number;
  horizontalIconAlignment?: IconAlignment;
  verticalIconAlignment?: IconAlignment;
  physicalSize?: number;
}

export interface AvatarState {
  personaPhotoSource: ImageURISource | undefined;
  iconSource: ImageURISource | undefined;
  showRing: boolean;
  transparentRing: boolean;
}

export interface AvatarInfo {
  props: AvatarProps;
  state: AvatarState;
}

export interface AvatarType {
  props: AvatarProps;
  slotProps: AvatarSlotProps;
  tokens: AvatarTokens;
  state: AvatarState;
}
