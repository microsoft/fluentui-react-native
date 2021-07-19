import type { IViewProps } from '@fluentui-react-native/adapters';
import { ImageProps, ViewProps, ImageURISource, TextProps, ColorValue } from 'react-native';
import { IBackgroundColorTokens, IForegroundColorTokens } from '@fluentui-react-native/tokens';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const personaCoinName = 'RNFPersonaCoin';

export type PersonaSize = 'size8' | 'size24' | 'size32' | 'size40' | 'size48' | 'size56' | 'size72' | 'size100' | 'size120';

/**
 * Sets color of the coin when there is no picture
 * @deprecated Use PersonaCoinFluentColor instead.
 */
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

/**
 * Sets color of the coin when there is no picture. Uses fluent color names
 */
export type PersonaCoinFluentColor =
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

export type PersonaPresence = 'none' | 'offline' | 'online' | 'away' | 'dnd' | 'blocked' | 'busy';

export type RingThickness = number | 'xSmall' | 'small' | 'medium' | 'large' | 'xlarge' | 'xxlarge';

export interface RingConfig {
  accent?: boolean;
  transparent?: boolean;
  ringColor?: ColorValue; // glow
  ringBackgroundColor?: ColorValue; // inner/outer rings
  ringThickness?: RingThickness;
  innerGap?: RingThickness;
}

export interface IPersonaConfigurableProps {
  size?: PersonaSize;

  /**
   * Sets color of the coin when there is no picture
   * @deprecated Use coinColorFluent instead
   */
  coinColor?: PersonaCoinColor;
  ring?: RingConfig;
  coinColorFluent?: PersonaCoinFluentColor;
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
  ring: ViewProps;
  glow: ViewProps;
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
  showRing: boolean;
  transparentRing: boolean;
}

export interface IPersonaCoinType {
  props: IPersonaCoinProps;
  slotProps: IPersonaCoinSlotProps;
  tokens: IPersonaCoinTokens;
  state: IPersonaCoinState;
}

export type IPersonaCoinRenderData = IRenderData<IPersonaCoinSlotProps, IPersonaCoinState>;
