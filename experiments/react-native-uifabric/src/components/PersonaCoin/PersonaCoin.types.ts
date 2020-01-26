import * as React from 'react';
import { IViewWin32Props } from '@office-iss/react-native-win32';

export const personaCoinName = 'RNFPersonaCoin';

export enum PersonaSize {
  size8,
  size24,
  size32,
  size40,
  size48,
  size56,
  size72,
  size100
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

export interface IPersonaCoinIcon {
  url: string;
}

export interface IPersonaCoinProps extends IViewWin32Props {
  size?: PersonaSize;
  imageUrl?: string;
  imageDescription?: string;
  initials?: string;
  coinColor?: PersonaCoinColor;
  presence?: PersonaPresence;
  isOutOfOffice?: boolean;
  customIcon?: IPersonaCoinIcon;
}

export interface IPersonaCoinSlotProps {
  root: React.PropsWithoutRef<IViewWin32Props>;
  icon: IPersonaCoinIcon;
}

export interface IPersonaCoinTokens {}

export interface IPersonaCoinType {
  props: IPersonaCoinProps;
  slotProps: IPersonaCoinSlotProps;
  tokens: IPersonaCoinTokens;
}
