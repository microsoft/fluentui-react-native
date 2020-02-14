import { IPersonaCoinProps, IPersonaCoinTokens } from '../PersonaCoin';
import { ViewProps, TextProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextTokens } from '../../../src/tokens/TextTokens';

export const personaName = 'RNFPersona';

export interface IPersonaState {
  text?: string;
  secondaryText?: string;
  tertiaryText?: string;
  optionalText?: string;
}

export interface IPersonaProps extends IPersonaCoinProps, IPersonaState {}

export interface IPersonaSlotProps {
  root: ViewProps;
  coin: ViewProps;
  stack: ViewProps;
  text: TextProps;
  secondary: TextProps;
  tertiary: TextProps;
  optional: TextProps;
}

export interface IPersonaTokens extends IPersonaCoinTokens {
  verticalGap?: number;
  horizontalGap?: number;

  textFont?: ITextTokens;
  secondaryFont?: ITextTokens;
  tertiaryFont?: ITextTokens;
  optionalFont?: ITextTokens;
}

export interface IPersonaType {
  props: IPersonaProps;
  slotProps: IPersonaSlotProps;
  tokens: IPersonaTokens;
  state: {};
}

export type IPersonaRenderData = IRenderData<IPersonaSlotProps, IPersonaState>;
