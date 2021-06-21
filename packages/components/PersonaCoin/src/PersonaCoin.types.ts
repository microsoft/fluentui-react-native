import type { IViewProps } from '@fluentui-react-native/adapters';
import { ImageProps, ViewProps, ImageURISource, TextProps } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens } from '@fluentui-react-native/tokens';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { Color } from '@fluentui-react-native/theme-types';

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

export type RingThickness = number | 'xSmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export interface IActivityRingConfig {
  accent?: boolean;
  transparent?: boolean;
  ringColor?: Color; // glow
  ringBackgroundColor?: Color; // inner/outer rings
  ringThickness?: RingThickness;
  innerGap?: RingThickness;
}

export interface IPersonaConfigurableProps {
  size?: PersonaSize;
  coinColor?: PersonaCoinColor;
  activityRing?: IActivityRingConfig;
}

export interface IPersonaCoinProps extends IViewProps, IPersonaConfigurableProps {
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
  activityRing: ViewProps;
  activityGlow: ViewProps;
}

export type IconAlignment = 'start' | 'center' | 'end';

export interface IPersonaCoinTokens extends IBackgroundColorTokens, IForegroundColorTokens, IPersonaConfigurableProps {
  coinSize?: number;
  iconSize?: number;
  iconStrokeWidth?: number;
  iconStrokeColor?: string;
  initialsSize?: number;
  horizontalIconAlignment?: IconAlignment;
  verticalIconAlignment?: IconAlignment;
}

export interface IPersonaCoinState {
  personaPhotoSource: ImageURISource | undefined;
  iconSource: ImageURISource | undefined;
  showActivityRing: boolean;
}

export interface IPersonaCoinType {
  props: IPersonaCoinProps;
  slotProps: IPersonaCoinSlotProps;
  tokens: IPersonaCoinTokens;
  state: IPersonaCoinState;
}

export type IPersonaCoinRenderData = IRenderData<IPersonaCoinSlotProps, IPersonaCoinState>;
