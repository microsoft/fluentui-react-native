import * as React from 'react';
import { IViewWin32Props } from '@office-iss/react-native-win32';
import { ImageProps } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens } from 'src/tokens';

export const personaCoinName = 'RNFPersonaCoin';

export enum PersonaSize {
  size8,
  size24,
  size32,
  size40,
  size48,
  size56,
  size72,
  size100,
  size120
}

export enum PersonaCoinColor {
  lightBlue,
  blue,
  darkBlue,
  teal,
  green,
  darkGreen,
  lightPink,
  pink,
  magenta,
  purple,
  orange,
  darkRed,
  violet,
  lightRed,
  gold,
  burgundy,
  warmGray,
  coolGray,
  cyan,
  rust
}

export enum PersonaPresence {
  none,
  offline,
  online,
  away,
  dnd,
  blocked,
  busy
}

export interface IPersonaCoinProps extends IViewWin32Props {
  size?: PersonaSize;
  imageUrl?: string;
  imageDescription?: string;
  initials?: string;
  coinColor?: PersonaCoinColor;
  presence?: PersonaPresence;
  isOutOfOffice?: boolean;
}

export interface IPersonaCoinSlotProps {
  root: React.PropsWithoutRef<IViewWin32Props>;
  icon: ImageProps;
}

export type IconAlignment = 'start' | 'center' | 'end';

export interface IPersonaCoinTokens extends IBackgroundColorTokens, IForegroundColorTokens {
  coinSize?: number;
  iconSize?: number;
  iconSource?: string;
  horizontalIconAlignment?: IconAlignment;
  verticalIconAlignment?: IconAlignment;
  initialsFontSize?: number;
}

export interface IPersonaCoinType {
  props: IPersonaCoinProps;
  slotProps: IPersonaCoinSlotProps;
  tokens: IPersonaCoinTokens;
}
