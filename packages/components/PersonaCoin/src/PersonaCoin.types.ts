import { IViewWin32Props } from '@office-iss/react-native-win32';
import { ImageProps, ViewProps, ImageURISource, TextProps } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens } from '@fluentui-native/tokens';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const personaCoinName = 'RNFPersonaCoin';

export type PersonaSize = 'size8' | 'size24' | 'size32' | 'size40' | 'size48' | 'size56' | 'size72' | 'size100' | 'size120';

export type PersonaCoinColor =
  | 'lightBlue'
  | 'blue'
  | 'darkBlue'
  | 'teal'
  | 'green'
  | 'darkGreen'
  | 'lightPink'
  | 'pink'
  | 'magenta'
  | 'purple'
  | 'orange'
  | 'darkRed'
  | 'violet'
  | 'lightRed'
  | 'gold'
  | 'burgundy'
  | 'warmGray'
  | 'coolGray'
  | 'cyan'
  | 'rust';

export type PersonaPresence = 'none' | 'offline' | 'online' | 'away' | 'dnd' | 'blocked' | 'busy';

export interface IPersonaConfigurableProps {
  size?: PersonaSize;
  coinColor?: PersonaCoinColor;
}

export interface IPersonaCoinProps extends IViewWin32Props, IPersonaConfigurableProps {
  imageUrl?: string;
  imageDescription?: string;
  initials?: string;
  presence?: PersonaPresence;
  isOutOfOffice?: boolean;
}

export interface IPersonaCoinSlotProps {
  root: ViewProps;
  photo: ImageProps;
  initials: TextProps;
  initialsBackground: ViewProps;
  icon: ImageProps;
}

export type IconAlignment = 'start' | 'center' | 'end';

export interface IPersonaCoinTokens extends IBackgroundColorTokens, IForegroundColorTokens, IPersonaConfigurableProps {
  coinSize?: number;
  iconSize?: number;
  initialsSize?: number;
  horizontalIconAlignment?: IconAlignment;
  verticalIconAlignment?: IconAlignment;
}

export interface IPersonaCoinState {
  personaPhotoSource: ImageURISource | undefined;
  iconSource: ImageURISource | undefined;
}

export interface IPersonaCoinType {
  props: IPersonaCoinProps;
  slotProps: IPersonaCoinSlotProps;
  tokens: IPersonaCoinTokens;
  state: IPersonaCoinState;
}

export type IPersonaCoinRenderData = IRenderData<IPersonaCoinSlotProps, IPersonaCoinState>;
