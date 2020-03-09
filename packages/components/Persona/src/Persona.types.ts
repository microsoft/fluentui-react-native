import { IPersonaCoinProps, IPersonaCoinTokens } from '@fluentui-native/persona-coin';
import { ViewProps, TextProps } from 'react-native';
import { IRenderData } from '@uifabricshared/foundation-composable';
import { ITextTokens } from '@fluentui-native/tokens';

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
  coin: IPersonaCoinProps;
  stack: ViewProps;
  text: TextProps;
  secondary: TextProps;
  tertiary: TextProps;
  optional: TextProps;
}

export interface IPersonaTokens extends Omit<IPersonaCoinTokens, 'backgroundColor'> {
  verticalGap?: number;
  horizontalGap?: number;

  coinBackgroundColor?: string;

  textFont?: ITextTokens;
  secondaryFont?: ITextTokens;
  tertiaryFont?: ITextTokens;
  optionalFont?: ITextTokens;
}

export interface IPersonaType {
  props: IPersonaProps;
  slotProps: IPersonaSlotProps;
  tokens: IPersonaTokens;
  state: IPersonaState;
}

export type IPersonaRenderData = IRenderData<IPersonaSlotProps, IPersonaState>;
