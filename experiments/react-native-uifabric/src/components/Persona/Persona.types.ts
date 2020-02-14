import { IPersonaCoinProps, IPersonaCoinTokens } from '../PersonaCoin';
import { ViewProps, TextProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';

export const personaName = 'RNFPersona';

export interface IPersonaProps extends IPersonaCoinProps {
  text?: string;
  secondaryText?: string;
  tertiaryText?: string;
  optionalText?: string;
}

export interface IPersonaSlotProps {
  root: ViewProps;
  coin: ViewProps;
  stack: ViewProps;
  text: TextProps;
  secondary: TextProps;
  tertinary: TextProps;
  optional: TextProps;
}

export interface IPersonaTokens extends IPersonaCoinTokens {
  verticalGap?: number;
  horizontalGap?: number;
}

export interface IPersonaType {
  props: IPersonaProps;
  slotProps: IPersonaSlotProps;
  tokens: IPersonaTokens;
  state: {};
}

export type IPersonaRenderData = IRenderData<IPersonaSlotProps, {}>;
